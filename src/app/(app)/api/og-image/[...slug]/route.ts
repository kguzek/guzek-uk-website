import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

import type { CustomMiddleware } from "@/lib/types";
import { OG_IMAGE_SIZE, PRODUCTION_URL } from "@/lib/constants";
import { rateLimitMiddleware } from "@/middleware/ratelimit-middleware";

const PUPPETEER_EXECUTABLE_PATH = process.env.PUPPETEER_EXECUTABLE_PATH;

export const revalidate = 86400;

async function generateScreenshot(path: string) {
  const browser = await puppeteer.launch({ executablePath: PUPPETEER_EXECUTABLE_PATH });
  const page = await browser.newPage();
  await page.setViewport(OG_IMAGE_SIZE);

  await page.goto(`${PRODUCTION_URL}/${path}`, { waitUntil: "networkidle0" });
  const screenshot = await page.screenshot({ type: "png" });
  await browser.close();

  return screenshot;
}

const routeHandler: CustomMiddleware<[{ params: Promise<{ slug: string[] }> }]> = async (
  request,
  args,
) => {
  const slug = args?.params ? (await args.params).slug : [];
  const path = Array.isArray(slug) ? slug.join("/") : "";
  try {
    const image = await generateScreenshot(path);
    return new NextResponse(image, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("error generating screenshot:", error);
    return NextResponse.json(
      {
        message: "Could not generate screenshot",
        error: error instanceof Error ? error.message : null,
      },
      {
        status: 500,
      },
    );
  }
};

export const GET = rateLimitMiddleware(routeHandler);
