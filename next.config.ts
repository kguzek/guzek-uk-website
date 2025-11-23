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
};

const withNextIntl = createNextIntlPlugin();
const { experimental, ...config } = withPayload(withNextIntl(nextConfig));
// @ts-expect-error turbo shouldn't exist but payload sets it
const { turbo, ...experimentalOptions } = experimental; // eslint-disable-line @typescript-eslint/no-unused-vars
const finalConfig = { ...config, experimental: experimentalOptions };
export default finalConfig;
