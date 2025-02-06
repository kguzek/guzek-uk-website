import { ErrorComponent } from "@/components/error-component";
import { serverToApi, triggerRevalidation } from "@/lib/backend/server";
import { ErrorCode } from "@/lib/enums";
import type { MenuItem, PageContent } from "@/lib/types";

export async function getPageBySlug(slug: string) {
  const result = await serverToApi<MenuItem[]>("pages");
  if (!result.ok) {
    console.error("Failed to fetch pages", result);
    return null;
  }
  return result.data.find((item) => item.shouldFetch && item.url === slug);
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

function JsonLdScript({ page }: { page: MenuItem }) {
  const definition = SCHEMA_LD_DEFINITIONS[page.url];
  if (definition == null) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(definition) }}
    />
  );
}

export async function DynamicPageLoader({ page }: { page: string }) {
  const currentPage = await getPageBySlug(page);
  if (!currentPage) return <ErrorComponent errorCode={ErrorCode.NotFound} />;
  const result = await serverToApi<PageContent>(`pages/${currentPage.id}`);
  if (!result.ok) return <ErrorComponent errorResult={result} />;
  if (!result.data.content) {
    console.error("Failed to fetch page content; response data:", result.data);
    await triggerRevalidation(`pages/${currentPage.id}`);
    return <ErrorComponent errorCode={ErrorCode.NotFound} />;
  }
  return (
    <div className="text flex justify-center">
      <JsonLdScript page={currentPage} />
      <div
        className="page-content prose mt-6"
        dangerouslySetInnerHTML={{ __html: result.data.content }}
      ></div>
    </div>
  );
}
