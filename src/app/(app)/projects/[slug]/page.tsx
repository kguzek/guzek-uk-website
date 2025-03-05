import Image from "next/image";
import Link from "next/link";
import { getPayload } from "payload";
import config from "@payload-config";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { ArrowUpRight } from "lucide-react";

import type { UserLocale } from "@/lib/types";
import { CarouselArrows } from "@/components/carousel/carousel-arrows";
import { ErrorComponent } from "@/components/error/component";
import { Tile } from "@/components/tile";
import { ErrorCode } from "@/lib/enums";
import { getTranslations } from "@/lib/providers/translation-provider";
import { isImage } from "@/lib/util";
import { Carousel, CarouselContent, CarouselItem } from "@/ui/carousel";

type Props = { params: Promise<{ slug: string }> };

const propsToSlug = async ({ params }: Props) => (await params).slug;

const BADGE_LABELS = {
  "created-at": {
    en: "first+released",
    pl: "opublikowano",
  },
  "last-commit": {
    en: "last+updated",
    pl: "ostatnia+aktualizacja",
  },
};

function Badge({
  repository,
  locale,
  badge,
}: {
  repository: string;
  locale: UserLocale;
  badge: keyof typeof BADGE_LABELS;
}) {
  const url = `${repository.replace("github.com", `img.shields.io/github/${badge}`)}?style=for-the-badge&label=${BADGE_LABELS[badge][locale]}`;
  return (
    <Image
      className="m-0 h-5 w-auto rounded-md sm:h-8 sm:rounded-lg"
      src={url}
      alt={BADGE_LABELS[badge][locale]}
      height={0}
      width={0}
      unoptimized // needed to serve SVGs
    />
  );
}

export default async function ProjectPage(props: Props) {
  const payload = await getPayload({ config });
  const { data, userLocale } = await getTranslations();
  const { docs } = await payload.find({
    collection: "projects",
    locale: userLocale,
    where: { slug: { equals: await propsToSlug(props) } },
    limit: 1,
  });
  if (docs.length === 0) {
    return <ErrorComponent errorCode={ErrorCode.NotFound} />;
  }
  const project = docs[0];
  if (!isImage(project.mainImage)) {
    return null;
  }
  return (
    <div className="text flex justify-center">
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
              <Badge
                repository={project.repository}
                locale={userLocale}
                badge="created-at"
              />
              <Badge
                repository={project.repository}
                locale={userLocale}
                badge="last-commit"
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
          {project.repository ? (
            <Link href={project.repository}>Check it out on GitHub!</Link>
          ) : null}
        </Tile>
      </div>
    </div>
  );
}
