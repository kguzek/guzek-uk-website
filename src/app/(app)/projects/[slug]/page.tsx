import Image from "next/image";
import Link from "next/link";
import { getPayload } from "payload";
import config from "@payload-config";
import { RichText } from "@payloadcms/richtext-lexical/react";

import type { Media } from "@/payload-types";
import { ErrorComponent } from "@/components/error-component";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ErrorCode } from "@/lib/enums";
import { getTranslations } from "@/lib/providers/translation-provider";

type Props = { params: Promise<{ slug: string }> };

type MediaImage = Pick<Media, "id" | "createdAt" | "updatedAt" | "alt"> & {
  url: string;
  width: number;
  height: number;
};

export const isImage = (image: Media | number): image is MediaImage =>
  typeof image !== "number" && !!image.url && !!image.width && !!image.height;

const propsToSlug = async ({ params }: Props) => (await params).slug;

const BADGE_LABELS: Record<"en" | "pl", { released: string; updated: string }> =
  {
    en: {
      released: "first+released",
      updated: "last+updated",
    },
    pl: {
      released: "opublikowano",
      updated: "ostatnio+zaktualizowane",
    },
  };

export default async function ProjectPage(props: Props) {
  const payload = await getPayload({ config });
  const { userLocale } = await getTranslations();
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
        {project.url && <Link href={project.url}>{project.url}</Link>}
        {project.repository && (
          <>
            <div className="mt-2 flex gap-2">
              <Image
                className="m-0"
                src={`${project.repository.replace("github.com", "img.shields.io/github/created-at")}?style=for-the-badge&label=${BADGE_LABELS[userLocale].released}`}
                alt="Created at"
                width={250}
                height={28}
                unoptimized // needed to serve SVGs
              />
              <Image
                className="m-0"
                src={`${project.repository.replace("github.com", "img.shields.io/github/last-commit")}?style=for-the-badge&label=${BADGE_LABELS[userLocale].updated}`}
                alt="Last updated"
                width={250}
                height={28}
                unoptimized
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
        <RichText data={project.description} />
        {project.extraImages && (
          <Carousel>
            <CarouselContent>
              {[project.mainImage, ...project.extraImages]
                .filter(isImage)
                .map((image) => (
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
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        )}
        {project.repository ? (
          <Link href={project.repository}>Check it out on GitHub!</Link>
        ) : null}
      </div>
    </div>
  );
}
