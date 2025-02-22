import type { JSXConvertersFunction } from "@payloadcms/richtext-lexical/react";
import Image from "next/image";
import Link from "next/link";
import { getPayload } from "payload";
import config from "@payload-config";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { ArrowUpRight } from "lucide-react";

import { DynamicPageLoader } from "@/components/pages/dynamic-page";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTranslations } from "@/lib/providers/translation-provider";
import { cn } from "@/lib/utils";

import { isImage } from "./[slug]/page";

// const titleToSlug = (title: string) =>
//   title.trim().toLowerCase().replace(/\s/g, "-");

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

export default async function ProjectsPage() {
  const payload = await getPayload({ config });
  const { userLocale } = await getTranslations();
  const projects = await payload.find({
    collection: "projects",
    locale: userLocale,
  });

  return (
    <>
      <DynamicPageLoader slug="/projects" />

      <div className="text">
        <div className="grid w-full gap-4 lg:grid-cols-2">
          {projects.docs.map((project) => (
            <Card
              className="group outline-background-soft dark:bg-background outline outline-1"
              key={project.id}
            >
              <CardHeader className="flex w-full flex-row justify-between gap-x-4 gap-y-1 sm:h-32 sm:items-center">
                <div>
                  <CardTitle className="text-primary-strong">
                    <Link
                      className="hover-underline"
                      href={`/projects/${project.slug}`}
                    >
                      {project.title}
                    </Link>
                  </CardTitle>
                  {project.url && (
                    <CardDescription className="mt-2 text-xs sm:text-sm">
                      <Link
                        className="hover-underline text-accent"
                        href={project.url}
                      >
                        {project.url}
                      </Link>
                    </CardDescription>
                  )}
                </div>
                <Link
                  className={cn("flex items-center gap-4")}
                  href={`/projects/${project.slug}`}
                >
                  {[project.mainImage, ...(project.extraImages ?? [])]
                    .slice(0, 2)
                    .map((image) =>
                      isImage(image) ? (
                        <Image
                          className="hidden h-auto w-20 sm:block sm:w-24"
                          key={image.id}
                          src={image.url}
                          alt={image.alt}
                          height={0}
                          width={96}
                        />
                      ) : null,
                    )}
                  <ArrowUpRight className="group-hover:animate-jump group-hover:text-primary-strong sm:text-primary -translate-y-1/4 transition-all duration-300 group-hover:scale-125" />
                </Link>
              </CardHeader>
              <CardContent>
                <Link href={`/projects/${project.slug}`}>
                  <RichText
                    className="text-primary hover:text-primary-strong line-clamp-3 text-xs transition-all duration-300 sm:text-base"
                    data={project.description}
                    converters={htmlWithoutLinks}
                  />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
