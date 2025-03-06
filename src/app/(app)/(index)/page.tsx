import type { SchemaOrgDefinition } from "@/components/schema-org";
import { DynamicPageLoader, getPageBySlug } from "@/components/pages/dynamic-page";
import { SchemaOrgScript } from "@/components/schema-org";
import { PRODUCTION_URL } from "@/lib/constants";
import { getTitle } from "@/lib/util";

export async function generateMetadata() {
  const homepage = await getPageBySlug("/");
  return {
    title: getTitle(homepage?.title),
  };
}

const KONRAD_GUZEK_SCHEMA: SchemaOrgDefinition = {
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
  url: PRODUCTION_URL,
  sameAs: ["https://www.linkedin.com/in/konrad-guzek/", "https://github.com/kguzek"],
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
};

export default function Index() {
  return (
    <>
      <SchemaOrgScript schema={KONRAD_GUZEK_SCHEMA} />
      {/** TODO: convert `tile` into a CMS richtext editor block */}
      <DynamicPageLoader slug="/" tile />
    </>
  );
}
