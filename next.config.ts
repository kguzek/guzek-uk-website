import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // GitHub project shields
        hostname: "img.shields.io",
      },
      {
        // Episodate API TV Show thumbnails
        hostname: "static.episodate.com",
      },
      {
        // TVmaze API TV Show thumbnails
        hostname: "static.tvmaze.com",
      },
      {
        hostname: "raw.githubusercontent.com",
      },
    ],
  },
  experimental: {
    nodeMiddleware: true,
    ppr: true,
  },
};

const withNextIntl = createNextIntlPlugin();
export default withPayload(withNextIntl(nextConfig));
