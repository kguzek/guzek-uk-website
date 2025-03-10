import { getPayload } from "payload";
import config from "@payload-config";
import { getLocale, getTranslations } from "next-intl/server";

import type { MenuItem, UserLocale } from "@/lib/types";
import { getAuth } from "@/lib/providers/auth-provider";

import type { Parallels } from "./breadcrumbs";
import { Breadcrumbs } from "./breadcrumbs";
import { NavigationBar } from "./navigation-bar";

const MENU_ITEMS: (Omit<MenuItem, "title"> & {
  title: string | Record<UserLocale, string>;
})[] = [
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

const ADMIN_MENU_ITEMS: MenuItem[] = [
  {
    id: 4,
    url: "/admin",
    title: "CMS",
    isAbsolute: true,
  },
];

export async function Navigation() {
  const t = await getTranslations();
  const { user } = await getAuth();
  const locale = await getLocale();
  const payload = await getPayload({ config });
  const projects = await payload.find({
    collection: "projects",
    locale: locale as UserLocale,
  });
  const parallels = [
    null,
    [
      { label: t("liveSeries.title"), slug: "liveseries" },
      { label: t("projects.title"), slug: "projects" },
      ...(user
        ? [{ label: t("profile.title"), slug: "profile" }]
        : [
            { label: t("profile.formDetails.login"), slug: "login" },
            { label: t("profile.formDetails.signup"), slug: "signup" },
          ]),
    ],
    {
      liveseries: [
        { label: t("liveSeries.search.title"), slug: "search" },
        {
          label: t("liveSeries.mostPopular.title"),
          slug: "most-popular",
        },
      ],
      projects: projects.docs.map((project) => ({
        label: project.title,
        slug: project.slug,
      })),
    },
  ] satisfies Parallels;

  const menuItems =
    user?.role === "admin" ? MENU_ITEMS.concat(ADMIN_MENU_ITEMS) : MENU_ITEMS;

  return (
    <>
      <NavigationBar
        user={user}
        menuItems={menuItems.map((item) => ({
          ...item,
          title:
            typeof item.title === "string"
              ? item.title
              : item.title[locale as UserLocale],
        }))}
      />
      <Breadcrumbs parallels={parallels} />
    </>
  );
}
