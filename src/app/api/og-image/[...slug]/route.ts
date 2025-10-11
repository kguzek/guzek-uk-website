import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

import type { CustomMiddleware } from "@/lib/types";
import { PRODUCTION_URL } from "@/lib/constants";

export const revalidate = 2592000; // 30 days

const API_SLUG_PATTERN = /^\/api\/og-image((?:\/[.\w-]+)*)/;

async function getOgImageStatus(request: NextRequest, slugOverride?: string) {
  const computedSlug = API_SLUG_PATTERN.exec(request.nextUrl.pathname)?.at(1) || "/";
  if (slugOverride != null && computedSlug !== slugOverride) {
    console.warn(
      `Computed slug '${computedSlug}' does not match override '${slugOverride}'`,
    );
  }
  const slug = slugOverride ?? computedSlug;
  const payload = await getPayload({ config });
  const docs = await payload.find({
    collection: "og-images",
    where: { slug: { like: `${slug}%` } },
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
  return { status: "image-valid", redirectUrl } as const;
}

type Args = [{ params: Promise<{ slug: string[] }> }];

const routeHandler: CustomMiddleware<Args> = async (request, { params }) => {
  const segments = params ? (await params).slug : [];
  const slug = Array.isArray(segments) ? `/${segments.join("/")}` : "/";
  const result = await getOgImageStatus(request, slug);
  switch (result.status) {
    case "not-found":
    case "image-invalid":
      return NextResponse.json({ message: "Image not found" }, { status: 404 });
    case "image-valid":
      return NextResponse.redirect(result.redirectUrl);
  }
};

export const GET = routeHandler;
