import { serverToApi } from "@/lib/backend-v2";
import { NavBarItem, UserWidget } from "./navigation-bar-client";
import { MenuItem } from "@/lib/types";
import { getCurrentUser } from "@/providers/auth-provider";
import Logo from "@/media/logo";
import { PAGE_NAME } from "@/lib/util";
import { LanguageSelector } from "./language-selector";

export async function NavBar() {
  const result = await serverToApi<MenuItem[]>("pages");
  const user = await getCurrentUser();
  const menuItems = result.ok && result.hasBody ? result.data : [];
  return (
    <div className="ribbon">
      <nav className="flex gap-10 px-4 py-2">
        <Logo size={80} />
        <h1>{PAGE_NAME}</h1>
        <div className="ml-auto flex flex-row-reverse lg:flex-row">
          {/* Hamburger */}
          <label className="peer block cursor-pointer p-4 lg:hidden">
            <input type="checkbox" className="peer hidden" />
            <div className="mb-1 h-1 w-6 transform bg-primary transition-transform peer-checked:translate-y-2 peer-checked:rotate-45"></div>
            <div className="mb-1 h-1 w-6 bg-primary opacity-100 transition-opacity peer-checked:opacity-0"></div>
            <div className="h-1 w-6 transform bg-primary transition-transform peer-checked:-translate-y-2 peer-checked:-rotate-45"></div>
          </label>
          {/* Menu */}
          <ul className="absolute right-0 top-20 z-10 w-full origin-top-right scale-0 transform select-none items-center rounded-lg border-2 border-solid border-background-soft bg-background shadow-lg transition-transform peer-has-[:checked]:scale-100 sm:w-[50%] lg:static lg:flex lg:w-full lg:transform-none lg:border-none lg:bg-transparent lg:shadow-none">
            {menuItems.map((item, index) => (
              <li className="p-4 text-center" key={index}>
                <NavBarItem item={item} />
              </li>
            ))}
            <LanguageSelector />
          </ul>
          <UserWidget user={user} />
        </div>
      </nav>
      <hr />
    </div>
  );
}
