import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Raleway, Roboto_Slab } from "next/font/google";
import Script from "next/script";

import { Footer } from "@/components/footer";
import { LanguageCookie } from "@/components/language-cookie";
import { NavigationBar } from "@/components/navigation/navigation-bar";
import { LanguageSelectorProvider } from "@/context/language-selector-context";
import { ModalProvider } from "@/context/modal-context";
import { cn } from "@/lib/cn";
import { useTranslations } from "@/providers/translation-provider";

import "./forms.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Konrad Guzek – Software Engineer, Web Developer, Student | Guzek UK",
  description:
    "The portfiolio website of Konrad Guzek, a Polish software developer from the UK. Home to LiveSeries – free TV show tracking & streaming.",
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
      <Script
        data-collect-dnt="true"
        src="https://scripts.simpleanalyticscdn.com/latest.js"
      />
    </html>
  );
}
