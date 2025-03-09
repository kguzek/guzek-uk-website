import type { NextRequest } from "next/server";
import type { File, Payload } from "payload";
import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import puppeteer from "puppeteer";

import type { CustomMiddleware } from "@/lib/types";
import type { Media } from "@/payload-types";
import {
  NAV_BAR_HEIGHT_DESKTOP,
  OG_IMAGE_METADATA,
  PRODUCTION_URL,
} from "@/lib/constants";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";

export const revalidate = 86400;

const PUPPETEER_EXECUTABLE_PATH = process.env.PUPPETEER_EXECUTABLE_PATH;
const OG_IMAGE_VALIDITY_PERIOD = revalidate * 1000;
const PUPPETEER_ARGS = process.env.PUPPETEER_ARGS || "";
const API_SLUG_PATTERN = /^\/api\/og-image((?:\/[.\w-]+)*)/;

const imageGenerationPromises = new Map<string, Promise<NextResponse>>();

async function generateScreenshot(path: string) {
  console.info("Generating screenshot for", path, "with Puppeteer...");
  const browser = await puppeteer.launch({
    executablePath: PUPPETEER_EXECUTABLE_PATH,
    args: PUPPETEER_ARGS.split(" "),
  });
  const page = await browser.newPage();
  const { width, height } = OG_IMAGE_METADATA;
  await page.setViewport({
    width,
    height: height + NAV_BAR_HEIGHT_DESKTOP,
  });
  await page.goto(`${PRODUCTION_URL}${path}`, {
    waitUntil: "networkidle0",
    timeout: 120000,
  });
  const screenshot = await page.screenshot({
    type: "png",
    clip: { width, height, x: 0, y: NAV_BAR_HEIGHT_DESKTOP },
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

async function getOgImageStatus(request: NextRequest, slugOverride?: string) {
  const computedSlug = API_SLUG_PATTERN.exec(request.nextUrl.pathname)?.at(1) || "/";
  if (slugOverride != null && computedSlug !== slugOverride) {
    console.warn(
      `Computed slug '${computedSlug}' does not match override '${slugOverride}'`,
    );
  }
  const slug = slugOverride ?? computedSlug;
  const previousPromise = imageGenerationPromises.get(slug);
  if (previousPromise != null) {
    return {
      status: "pending",
      previousPromise,
    } as const;
  }
  const payload = await getPayload({ config });
  const docs = await payload.find({
    collection: "og-images",
    where: { slug: { equals: slug } },
    limit: 1,
  });
  const doc = docs.docs.at(0);
  if (doc == null) {
    return { status: "not-found" } as const;
  }
  const image =
    typeof doc.image === "number"
      ? await payload.findByID({ collection: "media", id: doc.image })
      : doc.image;
  if (!image.url) {
    return { status: "image-invalid" } as const;
  }
  const redirectUrl = new URL(image.url, PRODUCTION_URL);
  if (isOgImageStale(image.updatedAt)) {
    return { status: "image-stale", redirectUrl, image } as const;
  }
  return { status: "image-valid", redirectUrl } as const;
}

async function _tryGenerateScreenshot(
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
  } finally {
    imageGenerationPromises.delete(path);
  }
}

function tryGenerateScreenshot(path: string, payload: Payload, existingMedia?: Media) {
  const promise = _tryGenerateScreenshot(path, payload, existingMedia);
  imageGenerationPromises.set(path, promise);
  return promise;
}

const routeHandler: CustomMiddleware<[{ params: Promise<{ slug: string[] }> }]> = async (
  request,
  args,
) => {
  const payload = await getPayload({ config });
  const segments = args?.params ? (await args.params).slug : [];
  const slug = Array.isArray(segments) ? `/${segments.join("/")}` : "/";
  const result = await getOgImageStatus(request, slug);
  switch (result.status) {
    case "pending":
      console.info("Returning existing promise for", slug);
      return await result.previousPromise;
    case "not-found":
      return tryGenerateScreenshot(slug, payload);
    case "image-invalid":
      console.error("OG image record has no URL", slug);
      return NextResponse.json({ message: "Image not found" }, { status: 404 });
    case "image-stale":
      // Update the image in the background but return the stale image
      console.info("Updating stale OG image for", slug, "from", result.image.updatedAt);
      tryGenerateScreenshot(slug, payload, result.image);
    // Fall through to redirect (deliberately omitted 'break')
    case "image-valid":
      return NextResponse.redirect(result.redirectUrl);
  }
};

const rateLimiter = rateLimitMiddleware({
  maxRequests: 1,
  matcher: async (request) => {
    const { status } = await getOgImageStatus(request);
    // Rate limit the requests that will result in a new image being generated
    return status === "not-found";
  },
});

export const GET = rateLimiter(routeHandler);
