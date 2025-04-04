import type { SerializedUploadNode } from "@payloadcms/richtext-lexical";
import type { JSXConvertersFunction } from "@payloadcms/richtext-lexical/react";
import Image from "next/image";
import { getPayload } from "payload";
import config from "@payload-config";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { getLocale } from "next-intl/server";

import type { DraftModeParams, UserLocale } from "@/lib/types";
import type { Media } from "@/payload-types";
import { ErrorComponent } from "@/components/error/component";
import { ErrorCode } from "@/lib/enums";

import { Tile } from "../tile";

export async function getPageBySlug(slug: string, draftMode?: string) {
  const locale = await getLocale();
  const payload = await getPayload({ config });
  console.log({ draftMode });
  const result = await payload.find({
    collection: "pages",
    where: { slug: { equals: slug } },
    limit: 1,
    locale: locale as UserLocale,
    draft: draftMode === "true",
  });
  if (result.totalDocs === 0) {
    return null;
  }
  return result.docs[0];
}

function CustomUploadConverter({ node }: { node: SerializedUploadNode }) {
  if (node.relationTo === "media" && typeof node.value === "object") {
    const media = node.value as unknown as Media;
    return (
      <Image
        className="mb-4"
        src={media.url || ""}
        alt={media.alt || ""}
        width={media.width || 100}
        height={media.height || 32}
      />
    );
  }
  return null;
}

const jsxConvertersWithImage: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  upload: CustomUploadConverter,
  paragraph: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({
      nodes: node.children,
    });

    if (!children?.length) {
      return <br />;
    }
    return <p className="mt-0">{children}</p>;
  },
});

export async function DynamicPageLoader({
  slug,
  tile = false,
  draftMode,
}: {
  slug: string;
  tile?: boolean;
} & DraftModeParams) {
  const page = await getPageBySlug(slug, draftMode);
  if (page == null) {
    return <ErrorComponent errorCode={ErrorCode.NotFound} path={slug} />;
  }
  const content = <RichText data={page.content} converters={jsxConvertersWithImage} />;
  return (
    <div className="text flex justify-center">
      <div className="mt-6">
        <div className="prose">{tile ? <Tile glow>{content}</Tile> : content}</div>
      </div>
    </div>
  );
}
