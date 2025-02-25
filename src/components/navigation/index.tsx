import { getPayload } from "payload";
import config from "@payload-config";

import { getAuth } from "@/lib/providers/auth-provider/rsc";
import { getTranslations } from "@/lib/providers/translation-provider";

import type { Parallels } from "./breadcrumbs";
import { Breadcrumbs } from "./breadcrumbs";
import { NavigationBar } from "./navigation-bar";

const MENU_ITEMS = [
  {
    id: 1,
    url: "/",
    title: {
      en: "Homepage",
      pl: "Strona główna",
    },
  },
  {
    id: 2,
    url: "/projects",
    title: {
      en: "Projects",
      pl: "Projekty",
    },
  },
  {
    id: 3,
    url: "/liveseries",
    title: "LiveSeries",
  },
];

export async function Navigation() {
  const { data, userLanguage } = await getTranslations();
  const { user } = await getAuth();
  const { userLocale } = await getTranslations();
  const payload = await getPayload({ config });
  const projects = await payload.find({
    collection: "projects",
    locale: userLocale,
  });
  const parallels = [
    null,
    [
      { label: data.liveSeries.title, slug: "liveseries" },
      { label: data.projects.title, slug: "projects" },
      ...(user
        ? [{ label: data.profile.title, slug: "profile" }]
        : [
            { label: data.profile.formDetails.login, slug: "login" },
            { label: data.profile.formDetails.signup, slug: "signup" },
          ]),
    ],
    {
      liveseries: [
        { label: data.liveSeries.search.title, slug: "search" },
        {
          label: data.liveSeries.mostPopular.title,
          slug: "most-popular",
        },
      ],
      projects: projects.docs.map((project) => ({
        label: project.title,
        slug: project.slug,
      })),
    },
  ] satisfies Parallels;

  return (
    <>
      <NavigationBar
        user={user}
        menuItems={MENU_ITEMS.map((item) => ({
          ...item,
          title: typeof item.title === "string" ? item.title : item.title[userLocale],
        }))}
        userLanguage={userLanguage}
      />
      <Breadcrumbs parallels={parallels} />
    </>
  );
}
