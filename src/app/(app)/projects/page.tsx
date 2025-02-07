import Image from "next/image";
import Link from "next/link";
import { getPayload } from "payload";
import config from "@payload-config";
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

import { isImage } from "./[slug]/page";

const titleToSlug = (title: string) =>
  title.trim().toLowerCase().replace(/\s/g, "-");

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
        <div className="grid w-full gap-2 lg:grid-cols-2">
          {projects.docs.map((project) => (
            <Link
              href={`/projects/${titleToSlug(project.title)}`}
              key={project.id}
            >
              <Card className="group max-h-44 dark:!bg-background-strong">
                <CardHeader>
                  <CardTitle className="text-primary-strong">
                    {project.title}
                  </CardTitle>
                  <CardDescription>
                    {project.url && (
                      <Link
                        className="hover-underline text-accent"
                        href={project.url}
                      >
                        {project.url}
                      </Link>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-end justify-between">
                  {isImage(project.mainImage) && (
                    <Image
                      src={project.mainImage.url}
                      alt={project.mainImage.alt}
                      height={30}
                      width={150}
                    />
                  )}
                  <ArrowUpRight className="ease transition-transform duration-300 group-hover:scale-125" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
