import type { JSXConvertersFunction } from "@payloadcms/richtext-lexical/react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPayload } from "payload";
import config from "@payload-config";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { ArrowUpRight } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";

import { SimpleIcon } from "@/components/image/simple-icon";
import { DynamicPageLoader, getPageBySlug } from "@/components/pages/dynamic-page";
import { Tile } from "@/components/tile";
import { DEFAULT_LOCALE, GITHUB_URL, OG_IMAGE_METADATA } from "@/lib/constants";
import { convertLexicalToPlainText } from "@/lib/lexical";
import { isImage, isValidLocale, truncateText } from "@/lib/util";
import { cn } from "@/lib/utils";
import { CardDescription, CardHeader, CardTitle } from "@/ui/card";

import { ExternalLinkButton } from "./[slug]/external-link";
import { ProjectTechnologies } from "./[slug]/project-technologies";

// const titleToSlug = (title: string) =>
//   title.trim().toLowerCase().replace(/\s/g, "-");

const PROJECTS_PAGE_SLUG = "/projects";

const htmlWithoutLinks: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  link: (link) => (
    <span className="hover-underline text-primary-strong cursor-pointer whitespace-pre-wrap">
      {link.node.children
        .map((child) => (child as unknown as { text: string }).text)
        .join(" ")}
    </span>
  ),
});

export async function generateMetadata() {
  const t = await getTranslations();
  const page = await getPageBySlug(PROJECTS_PAGE_SLUG);
  const description =
    page == null
      ? undefined
      : truncateText(await convertLexicalToPlainText(page.content)) || undefined;

  const title = t("projects.title");
  return {
    title,
    description,
    openGraph: {
      images: {
        url: "/api/og-image/projects",
        ...OG_IMAGE_METADATA,
      },
    },
  } satisfies Metadata;
}

export default async function ProjectsPage() {
  const payload = await getPayload({ config });
  const t = await getTranslations();
  const locale = await getLocale();
  const projects = await payload.find({
    collection: "projects",
    locale: isValidLocale(locale) ? locale : DEFAULT_LOCALE,
    sort: "id",
  });
  return (
    <>
      <DynamicPageLoader slug={PROJECTS_PAGE_SLUG} />
      <div className="text flex flex-col items-center gap-4">
        <div className="grid w-full gap-4 lg:grid-cols-2">
          {projects.docs.map((project) => (
            <Tile
              glow
              containerClassName="group"
              key={project.id}
              header={
                <CardHeader className="flex w-full flex-row justify-between gap-x-4 gap-y-1 sm:h-24 sm:items-center">
                  <div>
                    <CardTitle className="flex flex-wrap items-center gap-2 text-balance">
                      <div
                        className={cn("mr-2", {
                          "mr-0 w-full": (project.technologies?.length ?? 0) > 4,
                        })}
                      >
                        <Link
                          className="glow:text-primary-strong text-primary"
                          href={`/projects/${project.slug}`}
                        >
                          {project.title}
                        </Link>
                      </div>
                      <ProjectTechnologies project={project} />
                    </CardTitle>
                    <CardDescription className="mt-2 text-xs sm:text-sm">
                      {project.url && (
                        <Link
                          className="glow:underlined text-accent col-span-full"
                          href={project.url}
                        >
                          {project.url}
                        </Link>
                      )}
                    </CardDescription>
                  </div>
                  <Link
                    className={cn("flex items-center gap-4")}
                    href={`/projects/${project.slug}`}
                  >
                    {[project.mainImage, ...(project.extraImages ?? [])]
                      .filter(isImage)
                      .slice(0, 1)
                      .map((image) => (
                        <Image
                          className="hidden h-auto w-20 sm:block sm:w-24"
                          key={image.id}
                          src={image.url}
                          alt={image.alt}
                          height={0}
                          width={96}
                        />
                      ))}
                    <ArrowUpRight className="group-hover:animate-jump group-hover:text-primary-strong sm:text-primary transition-all duration-300 group-hover:scale-125" />
                  </Link>
                </CardHeader>
              }
            >
              <Link href={`/projects/${project.slug}`}>
                <RichText
                  className="text-primary glow:text-primary-strong line-clamp-3 text-xs transition-all duration-300 sm:text-base"
                  data={project.description}
                  converters={htmlWithoutLinks}
                />
              </Link>
            </Tile>
          ))}
        </div>
        <ExternalLinkButton href={GITHUB_URL} variant="github-glow" rel="me">
          {t("projects.myGithub")} <SimpleIcon name="github" alt="GitHub" />
        </ExternalLinkButton>
      </div>
    </>
  );
}
