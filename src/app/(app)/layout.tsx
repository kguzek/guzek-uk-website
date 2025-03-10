import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Raleway, Roboto_Slab } from "next/font/google";
import Script from "next/script";

import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { getTranslations } from "@/lib/providers/translation-provider";
import { cn } from "@/lib/utils";

import "./globals.css";

import { GlowCapture } from "@codaworks/react-glow";

import { OG_IMAGE_METADATA, PRODUCTION_URL } from "@/lib/constants";
import { QueryProvider } from "@/lib/providers/query-provider";
import { PAGE_NAME } from "@/lib/util";
import { Toaster } from "@/ui/sonner";
import { TooltipProvider } from "@/ui/tooltip";

const SEO_TITLE = "Konrad Guzek – Software Engineer, Web Developer, Student";

export const metadata: Metadata = {
  title: {
    template: `%s | ${PAGE_NAME}`,
    default: SEO_TITLE,
  },
  description:
    "The portfiolio website of Konrad Guzek, a Polish software developer from the UK. Home to LiveSeries – free TV show tracking & streaming.",
  authors: [{ name: "Konrad Guzek", url: "https://www.guzek.uk" }],
  creator: "Konrad Guzek",
  keywords: [
    "portfolio",
    "web developer",
    "software engineer",
    "software developer",
    "student",
    "computer science",
    "konrad guzek",
    "guzek uk",
    "liveseries",
    "tv shows",
    "wrocław",
    "wroclaw",
    "gliwice",
    "poland",
    "wust",
    "pwr",
    "politechnika wrocławska",
  ],
  metadataBase: new URL(PRODUCTION_URL),
  alternates: {
    canonical: "/",
    languages: {
      // TODO: complete after i18n overhaul
    },
  },
  openGraph: {
    title: SEO_TITLE,
    images: {
      url: "/api/og-image",
      ...OG_IMAGE_METADATA,
    },
  },
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

export const experimental_ppr = true;

export default async function RootLayout({ children }: { children: ReactNode }) {
  const { userLocale } = await getTranslations();
  return (
    <html
      lang={userLocale}
      className={cn("dark bg-background-strong", raleway.variable, robotoSlab.variable)}
    >
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo192.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="canonical" href={PRODUCTION_URL} />
      </head>
      <body className="text-primary bg-gradient-main">
        <QueryProvider>
          <TooltipProvider>
            <GlowCapture className="flex min-h-screen flex-col pt-(--navbar-height) sm:pt-(--navbar-height-sm)">
              <Navigation />
              <main className="grow">{children}</main>
              <Footer />
            </GlowCapture>
            <Toaster />
          </TooltipProvider>
        </QueryProvider>
      </body>
      <Script
        data-collect-dnt="true"
        src="https://scripts.simpleanalyticscdn.com/latest.js"
      />
    </html>
  );
}
