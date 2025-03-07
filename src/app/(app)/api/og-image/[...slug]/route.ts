import type { File, Payload } from "payload";
import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import puppeteer from "puppeteer";

import type { CustomMiddleware } from "@/lib/types";
import type { Media } from "@/payload-types";
import { NAV_BAR_HEIGHT_DESKTOP, OG_IMAGE_SIZE, PRODUCTION_URL } from "@/lib/constants";
import { rateLimitMiddleware } from "@/middleware/ratelimit-middleware";

export const revalidate = 86400;

const PUPPETEER_EXECUTABLE_PATH = process.env.PUPPETEER_EXECUTABLE_PATH;
const OG_IMAGE_VALIDITY_PERIOD = revalidate * 1000;

async function generateScreenshot(path: string) {
  console.info("Generating screenshot for", path, "with Puppeteer...");
  const browser = await puppeteer.launch({ executablePath: PUPPETEER_EXECUTABLE_PATH });
  const page = await browser.newPage();
  await page.setViewport({
    width: OG_IMAGE_SIZE.width,
    height: OG_IMAGE_SIZE.height + NAV_BAR_HEIGHT_DESKTOP,
  });
  await page.goto(`${PRODUCTION_URL}${path}`, {
    waitUntil: "networkidle0",
    timeout: 120000,
  });
  const screenshot = await page.screenshot({
    type: "png",
    clip: { ...OG_IMAGE_SIZE, x: 0, y: NAV_BAR_HEIGHT_DESKTOP },
  });
  await browser.close();
  return screenshot;
}

/** Returned when a new image is generated. */
const getImageResponse = <T extends Awaited<ReturnType<typeof generateScreenshot>>>(
  image: T,
  updated: boolean,
) =>
  new NextResponse<T>(image, {
    status: updated ? 200 : 201,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });

const slugToFilename = (slug: string) =>
  `og-image${slug === "/" ? "" : slug.replaceAll("/", "-")}.png`;

const isOgImageStale = (updatedAt: string) =>
  Date.now() - new Date(updatedAt).getTime() > OG_IMAGE_VALIDITY_PERIOD;

async function tryGenerateScreenshot(
  path: string,
  payload: Payload,
  existingMedia?: Media,
) {
  if (!path) {
    throw new Error(
      `Falsey path provided to tryGenerateScreenshot: '${path}' (${typeof path})`,
    );
  }
  try {
    const image = await generateScreenshot(path);
    const buffer = Buffer.from(image);
    const file: File = {
      data: buffer,
      mimetype: "image/png",
      name: slugToFilename(path),
      size: buffer.length,
    };
    if (existingMedia == null) {
      console.info("Creating media record with OG image for", path);
      const createdMedia = await payload.create({
        collection: "media",
        data: {
          alt: `OpenGraph Image for ${path}`,
        },
        file,
      });
      await payload.create({
        collection: "og-images",
        data: { slug: path, image: createdMedia.id },
      });
    } else {
      console.info(
        "Updating media record",
        existingMedia.id,
        "with OG image for",
        path,
        "& filename",
        file.name,
      );
      await payload.update({
        collection: "media",
        id: existingMedia.id,
        data: {
          filename: existingMedia.filename || file.name,
        },
        file,
      });
    }
    return getImageResponse(image, existingMedia == null);
  } catch (error) {
    console.error("error generating screenshot:", error);
    return NextResponse.json(
      {
        message: "Could not generate screenshot",
        error: error instanceof Error ? error.message : null,
      },
      { status: 500 },
    );
  }
}

const routeHandler: CustomMiddleware<[{ params: Promise<{ slug: string[] }> }]> = async (
  request,
  args,
) => {
  const payload = await getPayload({ config });
  const segments = args?.params ? (await args.params).slug : [];
  const slug = Array.isArray(segments) ? `/${segments.join("/")}` : "/";
  const docs = await payload.find({
    collection: "og-images",
    where: { slug: { equals: slug } },
    limit: 1,
  });
  const doc = docs.docs.at(0);
  if (doc == null) {
    return await tryGenerateScreenshot(slug, payload);
  }
  const image =
    typeof doc.image === "number"
      ? await payload.findByID({ collection: "media", id: doc.image })
      : doc.image;
  if (!image.url) {
    console.error("OG image record has no URL", doc, image);
    return NextResponse.json({ message: "Image not found" }, { status: 404 });
  }
  if (isOgImageStale(image.updatedAt)) {
    // Update the image in the background but return the stale image
    console.info("Updating stale OG image for", slug, "from", image.updatedAt);
    tryGenerateScreenshot(slug, payload, image);
  }
  return NextResponse.redirect(new URL(image.url, PRODUCTION_URL));
};

export const GET = rateLimitMiddleware(routeHandler);
