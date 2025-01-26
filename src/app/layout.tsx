import { ReactNode } from "react";
import { Metadata, Viewport } from "next";
import Script from "next/script";
import { Raleway, Roboto_Slab } from "next/font/google";
import { NavigationBar } from "@/components/navigation/navigation-bar";
import { Footer } from "@/components/footer";
import { ModalProviderWrapper } from "@/context/modal-context-provider";
import { LanguageCookie } from "@/components/language-cookie";
import { LanguageSelectorProvider } from "@/context/language-selector-context";
import { cn } from "@/lib/utils";
import "./globals.css";
import "./forms.css";

export const metadata: Metadata = {
  title: "Guzek UK",
  description:
    "The portfiolio website of Konrad Guzek, a Polish software developer from the UK.",
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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={cn(raleway.variable, robotoSlab.variable)}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo192.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <ModalProviderWrapper>
          <LanguageSelectorProvider>
            <LanguageCookie />
            <NavigationBar />
            {children}
            <Footer />
          </LanguageSelectorProvider>
        </ModalProviderWrapper>
      </body>
      <Script src="https://scripts.simpleanalyticscdn.com/latest.js" />
    </html>
  );
}
