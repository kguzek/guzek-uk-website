import { getPayload } from "payload";
import config from "@payload-config";
import { RichText } from "@payloadcms/richtext-lexical/react";

import { ErrorComponent } from "@/components/error/component";
import { ErrorCode } from "@/lib/enums";
import { getTranslations } from "@/lib/providers/translation-provider";

import { Tile } from "../tile";

export async function getPageBySlug(slug: string) {
  const { userLocale } = await getTranslations();
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "pages",
    where: { slug: { equals: slug } },
    limit: 1,
    locale: userLocale,
  });
  if (result.totalDocs === 0) {
    return null;
  }
  return result.docs[0];
}

export async function DynamicPageLoader({
  slug,
  tile = false,
}: {
  slug: string;
  tile?: boolean;
}) {
  const page = await getPageBySlug(slug);
  if (page == null) {
    return <ErrorComponent errorCode={ErrorCode.NotFound} path={slug} />;
  }
  return (
    <div className="text flex justify-center">
      <div className="mt-6">
        <div className="prose">
          {tile ? (
            <Tile glow>
              <RichText data={page.content} />
            </Tile>
          ) : (
            <RichText data={page.content} />
          )}
        </div>
      </div>
    </div>
  );
}
