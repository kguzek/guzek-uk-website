import { getPayload } from "payload";
import config from "@payload-config";

import type { MenuItem, User } from "@/lib/types";
import { serverToApi } from "@/lib/backend/server";
import { getAuth } from "@/lib/providers/auth-provider";
import { getTranslations } from "@/lib/providers/translation-provider";

import type { Parallels } from "./breadcrumbs";
import { Breadcrumbs } from "./breadcrumbs";
import { NavBarItem, NavigationBar } from "./navigation-bar";

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
      user
        ? { label: data.profile.title, slug: "profile" }
        : { label: data.profile.formDetails.login, slug: "login" },
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
      <NavigationBar user={user} userLanguage={userLanguage}>
        <MenuItems user={user} />
      </NavigationBar>
      <Breadcrumbs parallels={parallels} />
    </>
  );
}

export async function MenuItems({ user }: { user: User | null }) {
  const result = await serverToApi<MenuItem[]>("pages");
  const menuItems = result.ok && result.hasBody ? result.data : [];
  return menuItems
    .filter((item) => user?.admin || !item.adminOnly)
    .map((item) => (
      <li className="py-2 text-center" key={`nav-link-${item.id}`}>
        <NavBarItem item={item} />
      </li>
    ));
}
