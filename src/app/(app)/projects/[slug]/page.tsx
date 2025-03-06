import Image from "next/image";
import Link from "next/link";
import { getPayload } from "payload";
import config from "@payload-config";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { ArrowUpRight, Download } from "lucide-react";

import type { SchemaOrgDefinition } from "@/components/schema-org";
import type { UserLocale } from "@/lib/types";
import type { Project } from "@/payload-types";
import { CarouselArrows } from "@/components/carousel/carousel-arrows";
import { ErrorComponent } from "@/components/error/component";
import { SchemaOrgScript } from "@/components/schema-org";
import { SimpleIcon } from "@/components/simple-icon";
import { Tile } from "@/components/tile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ErrorCode } from "@/lib/enums";
import { convertLexicalToPlainText } from "@/lib/lexical";
import { getTranslations } from "@/lib/providers/translation-provider";
import { getTitle, isImage, truncateText } from "@/lib/util";
import { Carousel, CarouselContent, CarouselItem } from "@/ui/carousel";

type Props = { params: Promise<{ slug: string }> };

const propsToSlug = async ({ params }: Props) => (await params).slug;

const SHIELD_LABELS = {
  "created-at": {
    en: "first+released",
    pl: "opublikowano",
  },
  "last-commit": {
    en: "last+updated",
    pl: "ostatnia+aktualizacja",
  },
};

async function propsToProject(props: Props) {
  const slug = await propsToSlug(props);
  const { userLocale } = await getTranslations();
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "projects",
    locale: userLocale,
    where: { slug: { equals: slug } },
    limit: 1,
  });
  return docs.at(0);
}

export async function generateMetadata(props: Props) {
  const project = await propsToProject(props);
  if (project == null) {
    return {};
  }
  const description = (await convertLexicalToPlainText(project.description)) || undefined;
  return {
    title: getTitle(project.title),
    description: truncateText(description, 160),
    image: isImage(project.mainImage) ? project.mainImage.url : undefined,
  };
}

function getProjectSchema(project: Project, userLocale: UserLocale): SchemaOrgDefinition {
  const schema: SchemaOrgDefinition = {
    "@context": "http://schema.org",
    "@type": "SoftwareApplication",
    name: {
      "@language": userLocale,
      "@value": project.title,
    },
    author: {
      "@type": "Person",
      name: "Konrad Guzek",
    },
    datePublished: project.datePublished,
  };
  if (isImage(project.mainImage)) {
    schema.image = project.mainImage.url;
  }
  if (project.categories != null && project.categories.length > 0) {
    schema.applicationCategory = {
      "@language": userLocale,
      "@value": project.categories
        .map((category) => (typeof category === "number" ? category : category.label))
        .join(", "),
    };
  }
  if (project.url) {
    schema.url = project.url;
  }
  if (project.downloadUrl) {
    schema.downloadUrl = project.downloadUrl;
  }
  if (project.extraImages != null && project.extraImages.length > 0) {
    const screenshot = project.extraImages.find((image) => isImage(image));
    if (screenshot != null) {
      schema.screenshot = screenshot.url;
    }
  }
  return schema;
}

function Shield({
  repository,
  locale,
  shield,
}: {
  repository: string;
  locale: UserLocale;
  shield: keyof typeof SHIELD_LABELS;
}) {
  const url = `${repository.replace("github.com", `img.shields.io/github/${shield}`)}?style=for-the-badge&label=${SHIELD_LABELS[shield][locale]}`;
  return (
    <Image
      className="m-0 h-5 w-auto rounded-md sm:h-8 sm:rounded-lg"
      src={url}
      alt={SHIELD_LABELS[shield][locale]}
      height={0}
      width={0}
      unoptimized // needed to serve SVGs
    />
  );
}

export default async function ProjectPage(props: Props) {
  const { data, userLocale } = await getTranslations();
  const project = await propsToProject(props);
  if (project == null) {
    return <ErrorComponent errorCode={ErrorCode.NotFound} />;
  }
  if (!isImage(project.mainImage)) {
    return null;
  }
  return (
    <div className="text flex justify-center">
      <SchemaOrgScript schema={getProjectSchema(project, userLocale)} />
      <div className="prose mt-6">
        <h2 className="mb-2">{project.title}</h2>
        {project.url && (
          <Link className="group flex items-center gap-2 bg-none" href={project.url}>
            <div className="hover-underline group-hover:underlined text-accent">
              {project.url}
            </div>
            <ArrowUpRight className="group-hover:animate-jump text-primary group-hover:text-primary-strong transition-all [transition-duration:300ms]" />
          </Link>
        )}
        {project.repository && (
          <>
            <div className="mt-2 grid grid-cols-[auto_auto] gap-x-2">
              <Shield
                repository={project.repository}
                locale={userLocale}
                shield="created-at"
              />
              <Shield
                repository={project.repository}
                locale={userLocale}
                shield="last-commit"
              />
            </div>
          </>
        )}
        <Image
          className="mt-2"
          src={project.mainImage.url}
          alt={project.mainImage.alt}
          width={project.mainImage.width}
          height={project.mainImage.height}
        />
        <Tile>
          {
            <div className="-mb-5 flex items-center gap-4 self-start">
              <div className="flex gap-2">
                {(project.technologies ?? []).map((technology, idx) =>
                  typeof technology === "number" || !technology.hasLogo ? null : (
                    <SimpleIcon
                      colored
                      key={`project-technology-${idx}`}
                      name={technology.name}
                      alt={technology.name}
                    />
                  ),
                )}
              </div>
              <div className="flex gap-2">
                {(project.categories ?? []).map((category, idx) =>
                  typeof category === "number" ? null : (
                    <Badge key={`project-category-${idx}`} className="py-1">
                      {category.label}
                    </Badge>
                  ),
                )}
              </div>
            </div>
          }
          <RichText data={project.description} />
          {project.extraImages && (
            <Carousel className="sm:mx-12">
              <CarouselContent>
                {project.extraImages.filter(isImage).map((image) => (
                  <CarouselItem key={image.url} className="flex justify-center">
                    <Image
                      src={image.url}
                      alt={image.alt}
                      width={image.width}
                      height={0}
                      className="max-h-96 w-full object-contain"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselArrows data={data} />
            </Carousel>
          )}
          <div className="flex gap-2">
            {project.downloadUrl ? (
              <Button asChild variant="glow">
                <Link href={project.downloadUrl} className="bg-none!">
                  {data.projects.download} <Download />
                </Link>
              </Button>
            ) : null}
            {project.repository ? (
              <Button asChild variant="github-glow">
                <Link href={project.repository} className="bg-none!">
                  GitHub <SimpleIcon name="GitHub" alt="GitHub repository" />
                </Link>
              </Button>
            ) : null}
          </div>
        </Tile>
      </div>
    </div>
  );
}
