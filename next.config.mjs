// @ts-check
import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import('next').NextConfig} */
const nextConfig = {
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
    ],
  },
};

export default withPayload(nextConfig);
