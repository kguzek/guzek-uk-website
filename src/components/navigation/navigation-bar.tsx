import { serverToApi } from "@/lib/backend/server";
import { MenuItem, User } from "@/lib/types";
import { PAGE_NAME } from "@/lib/util";
import { Logo } from "@/media/logo";
import { useAuth } from "@/providers/auth-provider";
import { useTranslations } from "@/providers/translation-provider";

import { LanguageSelector } from "./language-selector";
import { NavBarItem } from "./navigation-bar-client";
import { UserWidget } from "./user-widget";

export async function NavigationBar() {
  const { userLanguage } = await useTranslations();
  const { user } = await useAuth();
  return (
    <>
      <nav className="flex items-center gap-4 px-4 py-2 lg:gap-6">
        <Logo size={80} />
        <p className="whitespace-nowrap font-bold sm:text-3xl">{PAGE_NAME}</p>
        <div className="ml-auto flex flex-row-reverse lg:flex-row">
          {/* Hamburger */}
          <label
            aria-controls="menu"
            className="peer z-30 flex cursor-pointer flex-col justify-center p-4 lg:hidden"
          >
            <input
              type="checkbox"
              aria-controls="menu"
              id="hamburger"
              className="peer hidden"
            />
            <div className="mb-1 w-6 transform rounded-full bg-primary pt-1 transition-transform peer-checked:translate-y-2 peer-checked:-rotate-45"></div>
            <div className="mb-1 w-6 rounded-full bg-primary pt-1 opacity-100 transition-opacity peer-checked:opacity-0"></div>
            <div className="w-6 transform rounded-full bg-primary pt-1 transition-transform peer-checked:-translate-y-2 peer-checked:rotate-45"></div>
          </label>
          {/* Click outside menu to hide */}
          <label
            htmlFor="hamburger"
            aria-controls="menu"
            className="pointer-events-none fixed left-0 top-0 z-10 h-[100vh] w-[100vw] opacity-0 backdrop-blur-[6px] transition-opacity duration-300 peer-has-[:checked]:pointer-events-auto peer-has-[:checked]:opacity-50 lg:hidden"
          ></label>
          {/* Menu */}
          <ul className="invisible absolute right-0 top-0 z-20 w-full origin-top translate-y-[-100%] select-none items-center gap-6 rounded-b-lg border-0 border-b-2 border-primary bg-background bg-opacity-50 pb-4 opacity-0 shadow-lg shadow-background-strong backdrop-blur-lg backdrop-filter transition-[opacity,transform,visibility] duration-300 peer-has-[:checked]:visible peer-has-[:checked]:translate-y-0 peer-has-[:checked]:scale-100 peer-has-[:checked]:opacity-100 sm:right-10 sm:top-3 sm:w-[50%] sm:origin-top-right sm:translate-y-0 sm:scale-[25%] sm:rounded-lg sm:border-2 sm:border-solid sm:pt-4 lg:visible lg:static lg:flex lg:w-full lg:transform-none lg:border-none lg:bg-transparent lg:opacity-100 lg:shadow-none lg:backdrop-blur-none xl:pt-0">
            <div className="mt-5 flex justify-center sm:hidden">
              <UserWidget user={user} userLanguage={userLanguage} />
            </div>
            <MenuItems user={user} />
            <LanguageSelector userLanguage={userLanguage} />
          </ul>
          <div className="mx-3 hidden sm:block">
            <UserWidget user={user} userLanguage={userLanguage} />
          </div>
        </div>
      </nav>
      <hr />
    </>
  );
}

async function MenuItems({ user }: { user: User | null }) {
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
