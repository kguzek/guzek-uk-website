import { getPayload } from "payload";
import config from "@payload-config";
import { RichText } from "@payloadcms/richtext-lexical/react";

import type { Page } from "@/payload-types";
import { ErrorComponent } from "@/components/error-component";
import { ErrorCode } from "@/lib/enums";
import { getTranslations } from "@/lib/providers/translation-provider";

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

type SchemaValue = string | Record<string, string>;
type NestedSchemaValue = SchemaValue | Record<string, SchemaValue>;
type SchemaOrgDefinition = Record<
  string,
  NestedSchemaValue | NestedSchemaValue[]
>;

const SCHEMA_LD_DEFINITIONS: {
  [pageUrl: string]: SchemaOrgDefinition | undefined;
} = {
  "/": {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Konrad Guzek",
    gender: "Male",
    birthDate: "2004-10-16",
    email: "mailto:konrad@guzek.uk",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Wrocław",
      addressCountry: "Poland",
    },
    url: "https://www.guzek.uk",
    sameAs: ["https://www.linkedin.com/in/konrad-guzek/"],
    jobTitle: "Software Developer",
    worksFor: {
      "@type": "Organization",
      name: "Solvro",
    },
    alumniOf: [
      {
        "@type": "EducationalOrganization",
        name: "I Liceum Ogólnokształcące im. E. Dembowskiego w Gliwicach",
      },
      {
        "@type": "CollegeOrUniversity",
        name: "Wrocław University of Science and Technology",
        department: {
          "@type": "EducationalOrganization",
          name: "Computer Science",
        },
      },
    ],
    birthPlace: {
      "@type": "Place",
      name: "London, UK",
    },
    image: "https://avatars.githubusercontent.com/u/52281528",
  },
  "/projects": {
    "@context": "http://schema.org",
    "@type": "SoftwareApplication",
    name: "Slav King",
    image:
      "https://github.com/kguzek/slav-king/blob/images/screenshots/gameplay-1.png?raw=true",
    url: "https://github.com/kguzek/slav-king",
    author: {
      "@type": "Person",
      name: "Konrad Guzek",
    },
    applicationCategory: "2D platformer",
    downloadUrl: "https://github.com/kguzek/slav-king",
    screenshot:
      "https://github.com/kguzek/slav-king/blob/images/screenshots/shop.png?raw=true",
    datePublished: "2022-01-23",
  },
};

function JsonLdScript({ page }: { page: Page }) {
  const definition = SCHEMA_LD_DEFINITIONS[page.slug];
  if (definition == null) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(definition) }}
    />
  );
}

export async function DynamicPageLoader({ slug }: { slug: string }) {
  const page = await getPageBySlug(slug);
  const { data } = await getTranslations();
  if (!page)
    return (
      <ErrorComponent
        errorCode={ErrorCode.NotFound}
        errorMessage={
          <p>
            {data.error[404].body}: <code className="genre">{slug}</code>
          </p>
        }
      />
    );
  return (
    <div className="text flex justify-center">
      <JsonLdScript page={page} />
      <div className="prose mt-6">
        <RichText data={page.content} />
      </div>
    </div>
  );
}
