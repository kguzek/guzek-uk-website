import { getPayload } from "payload";
import config from "@payload-config";

import type { MenuItem } from "@/lib/types";
import { serverToApi } from "@/lib/backend/server";
import { getAuth } from "@/lib/providers/auth-provider";
import { getTranslations } from "@/lib/providers/translation-provider";

import type { Parallels } from "./breadcrumbs";
import { Breadcrumbs } from "./breadcrumbs";
import { NavigationBar } from "./navigation-bar";

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

  const menuItemsResult = await serverToApi<MenuItem[]>("pages");
  const menuItems =
    menuItemsResult.ok && menuItemsResult.hasBody ? menuItemsResult.data : [];
  const filteredMenuItems = menuItems.filter(
    (item) => user?.admin || !item.adminOnly,
  );
  return (
    <>
      <NavigationBar
        user={user}
        menuItems={filteredMenuItems}
        userLanguage={userLanguage}
      />
      <Breadcrumbs parallels={parallels} />
    </>
  );
}
