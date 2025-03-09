import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  // output: "export", // Outputs a Single-Page Application (SPA).
  // distDir: "./build", // Changes the build output directory to `./build`.
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
  },
};

export default withPayload(nextConfig);
