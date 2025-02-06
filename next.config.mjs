// @ts-check
import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: "export", // Outputs a Single-Page Application (SPA).
  // distDir: "./build", // Changes the build output directory to `./build`.
  images: {
    remotePatterns: [
      {
        hostname:
          "avatar-management--avatars.us-west-2.prod.public.atl-paas.net",
      },
    ],
  },
};

export default withPayload(nextConfig);
