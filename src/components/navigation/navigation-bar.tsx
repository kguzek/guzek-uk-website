"use client";

import React, {
  useState,
  useEffect,
  MouseEventHandler,
  useRef,
  CSSProperties,
  MouseEvent,
} from "react";
import Link from "next/link";
import Logo from "@/media/logo";
import { TRANSLATIONS } from "@/lib/translations";
import { Language, MenuItem } from "@/lib/models";
import { PAGE_NAME } from "@/lib/util";
import { useTranslations } from "@/context/translation-context";
import "./navigation.css";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export default function NavigationBar({
  selectedLanguage,
  menuItems,
}: {
  selectedLanguage: Language;
  menuItems?: MenuItem[];
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const windowDimensions = useWindowDimensions();
  const { setLanguage } = useTranslations();

  // Create the array of nav bar page elements
  const menuItemElements = menuItems?.map((item, index) => (
    <li key={index}>
      <NavBarItem item={item} setMenuOpen={setMenuOpen} />
    </li>
  ));

  const displayStyle =
    windowDimensions.width > 980
      ? "desktop"
      : windowDimensions.width > 550
      ? "medium"
      : "mobile";

  const userWidget = (
    <UserWidget displayStyle={displayStyle} setMenuOpen={setMenuOpen} />
  );

  /** Event handler for when the user selects one of the lanugage options. */
  function changeLang(evt: MouseEvent<HTMLButtonElement>) {
    evt.preventDefault();
    // Get the button text and remove whitespaces as well as Non-Breaking Spaces (&nbsp;)
    const button = evt.target as HTMLButtonElement;
    const elemText = button.textContent || button.innerText;
    const lang = elemText.replace(/[\s\u00A0]/, "");
    try {
      setLanguage(lang);
    } catch (error) {
      console.error(error as Error);
    }
  }

  // Waiting for the page to load on the client
  if (windowDimensions.width === 0 || windowDimensions.height === 0)
    return null;

  return (
    <div className="ribbon">
      <nav className="navigation">
        <Logo size={80} />
        <h1>{PAGE_NAME}</h1>
        <ul className={`${menuOpen ? "open" : "closed"} no-select nav-items `}>
          {displayStyle === "mobile" && userWidget}
          {menuItemElements ?? (
            <div className="skeleton flex">
              <p className="skeleton-text" style={{ width: "25vw" }}></p>
            </div>
          )}
          <LangSelector
            selectedLanguage={selectedLanguage}
            changeLang={changeLang}
          />
          {displayStyle === "desktop" && userWidget}
        </ul>
        {displayStyle === "medium" && userWidget}
        <Hamburger menuOpen={menuOpen} onClick={() => setMenuOpen(!menuOpen)} />
      </nav>
      <hr />
    </div>
  );
}

function NavBarItem({
  item,
  setMenuOpen,
}: {
  item: MenuItem;
  setMenuOpen: Function;
}) {
  const pathname = usePathname();

  // Handle edge case for index page ("/")
  const isActive =
    item.url === "/" ? pathname === "/" : pathname?.startsWith(item.url);
  const onClick = () => setMenuOpen(false);
  const className = "clickable nav-link" + (isActive ? " active" : "");
  return item.localUrl ? (
    <Link href={item.url} onClick={onClick} className={className}>
      {item.title}
    </Link>
  ) : (
    <a href={item.url} onClick={onClick} className={className}>
      {item.title}
    </a>
  );
}

function LangSelector({
  selectedLanguage,
  changeLang,
}: {
  selectedLanguage: Language;
  changeLang: MouseEventHandler<HTMLButtonElement>;
}) {
  const { data } = useTranslations();

  const [markerStyle, setMarkerStyle] = useState<CSSProperties>({});
  const initialSelectedRef = useRef<HTMLButtonElement>(null);

  const updateMarkerStyle = (button: HTMLButtonElement | null) =>
    setMarkerStyle({
      width: button?.offsetWidth,
      height: button?.offsetHeight,
      left: button?.offsetLeft,
      top: button?.offsetTop,
    });

  useEffect(() => {
    const updateStyle = () => updateMarkerStyle(initialSelectedRef.current);
    updateStyle();
    window.addEventListener("resize", updateStyle);
    window.addEventListener("load", updateStyle);

    return () => {
      window.removeEventListener("resize", updateStyle);
      window.removeEventListener("load", updateStyle);
    };
  }, [initialSelectedRef]);

  function onChangeLang(event: React.MouseEvent<HTMLButtonElement>) {
    changeLang(event);
    updateMarkerStyle(event.currentTarget);
  }

  return (
    <div className="centred lang-selector">
      <div className="lang-selector-marker" style={markerStyle}></div>
      {Object.keys(TRANSLATIONS).map((lang) => (
        <button
          key={lang}
          onClick={onChangeLang}
          className={selectedLanguage === lang ? "" : "clickable"}
          ref={selectedLanguage === lang ? initialSelectedRef : null}
        >
          {lang}
        </button>
      ))}
      <small>{data.language}</small>
    </div>
  );
}

function UserWidget({
  displayStyle,
  setMenuOpen,
}: {
  displayStyle: string;
  setMenuOpen: Function;
}) {
  const pathname = usePathname();
  const { data } = useTranslations();
  const { user } = useAuth();
  //  add user.url
  const imgUrl =
    (user && Object.hasOwn(user, "url") && (user as any).url) ||
    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/default-avatar.png";
  const active =
    pathname != null && ["/profile", "/login"].includes(pathname)
      ? "active"
      : "";
  return (
    <Link
      href={user ? "/profile" : "/login"}
      className={`${active} clickable ${displayStyle} nav-link user-widget`}
      onClick={() => setMenuOpen(false)}
    >
      <img alt="User avatar" className="user-avatar" src={imgUrl} />
      <b className={"user-name"}>{user?.username || data.loginShort}</b>
    </Link>
  );
}

function Hamburger({
  menuOpen,
  onClick,
}: {
  menuOpen: boolean;
  onClick: MouseEventHandler;
}) {
  return (
    <div onClick={onClick} className="clickable hamburger">
      <p className={menuOpen ? "fas fa-times" : "fas fa-bars"}></p>
    </div>
  );
}

function useWindowDimensions() {
  function getWindowDimensions() {
    return { width: window.innerWidth, height: window.innerHeight };
  }

  const [windowDimensions, setWindowDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowDimensions;
}

interface Page {
  link: string;
  label: string;
}

export function MiniNavBar({
  pathBase,
  pages,
}: {
  pathBase: string;
  pages: Page[];
}) {
  const pathname = usePathname();

  const getClassName = (path: string) =>
    (
      path
        ? pathname.startsWith(`/${pathBase}/` + path)
        : [`/${pathBase}`, `/${pathBase}/`].includes(pathname)
    )
      ? " active"
      : "";

  return (
    <nav className="flex mini-navbar serif">
      {pages.map(({ link, label }, idx) => (
        <Link
          key={idx}
          className={"clickable nav-link" + getClassName(link)}
          href={`/${pathBase}/${link}`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
