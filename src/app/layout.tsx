import { ReactNode } from "react";
import { Metadata, Viewport } from "next";
import Script from "next/script";
import { Raleway, Roboto_Slab } from "next/font/google";
import { NavigationBar } from "@/components/navigation/navigation-bar";
import { Footer } from "@/components/footer";
import { ModalProvider } from "@/context/modal-context";
import { LanguageCookie } from "@/components/language-cookie";
import { LanguageSelectorProvider } from "@/context/language-selector-context";
import { cn } from "@/lib/utils";
import "./globals.css";
import "./forms.css";
import { useTranslations } from "@/providers/translation-provider";

export const metadata: Metadata = {
  title: "Konrad Guzek – Software Engineer, Web Developer, Student | Guzek UK",
  description:
    "The portfiolio website of Konrad Guzek, a Polish software developer from the UK. Specialising in web development and software engineering. Home to LiveSeries – free TV show subscriptions, tracking and streaming.",
  keywords: [
    "portfolio",
    "web developer",
    "software engineer",
    "software developer",
    "student",
    "computer science",
    "liveseries",
    "konrad guzek",
    "guzek uk",
  ],
};

export const viewport: Viewport = {
  themeColor: "#2596be",
  colorScheme: "dark",
};

const raleway = Raleway({
  subsets: ["latin", "latin-ext"],
  preload: true,
  display: "swap",
  variable: "--font-raleway",
});

const robotoSlab = Roboto_Slab({
  subsets: ["latin", "latin-ext"],
  preload: true,
  display: "swap",
  variable: "--font-roboto-slab",
});

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { userLanguage } = await useTranslations();
  return (
    <html
      lang={userLanguage.toLowerCase()}
      className={cn(raleway.variable, robotoSlab.variable)}
    >
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo192.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="canonical" href="https://www.guzek.uk" />
      </head>
      <body>
        <ModalProvider userLanguage={userLanguage}>
          <LanguageSelectorProvider>
            <LanguageCookie />
            <NavigationBar />
            {children}
            <Footer />
          </LanguageSelectorProvider>
        </ModalProvider>
      </body>
      <Script src="https://scripts.simpleanalyticscdn.com/latest.js" />
    </html>
  );
}
