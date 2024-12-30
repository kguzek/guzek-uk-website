import { Metadata, Viewport } from "next";
import { ReactNode } from "react";
import { Footer } from "@/components/footer";
import { AppProviders } from "@/providers/AppProviders";
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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <script
          async
          src="https://kit.fontawesome.com/b70d905b1a.js"
          crossOrigin="anonymous"
        ></script>
        <link rel="apple-touch-icon" href="/logo192.png" />
        <link rel="manifest" href="/manifest.json" />
        <title>Guzek UK</title>
      </head>
      <body>
        <AppProviders>
          {children}
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
