import path from "path";
import { fileURLToPath } from "url";
import type { SanitizedCollectionConfig } from "payload";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import { s3Storage } from "@payloadcms/storage-s3";
import sharp from "sharp";

import { BlockEmailButton } from "./collections/blocks/BlockEmailButton";
import { Emails } from "./collections/Emails";
import { Media } from "./collections/Media";
import { OgImages } from "./collections/OgImages";
import { Pages } from "./collections/Pages";
import { ProjectCategories } from "./collections/ProjectCategories";
import { Projects } from "./collections/Projects";
import { Technologies } from "./collections/Technologies";
import { Users } from "./collections/Users";
import {
  EMAIL_FROM_ADDRESS,
  EMAIL_FROM_NAME,
  PRODUCTION_URL,
  S3_ACCESS_KEY_ID,
  S3_ACCESS_KEY_SECRET,
  S3_BUCKET_NAME,
  S3_SERVER_REGION,
  S3_SERVER_URL,
} from "./lib/constants";
import { richTextEditor } from "./lib/payload";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

function pathFromConfig(
  config: SanitizedCollectionConfig,
  data: Record<string, unknown>,
) {
  console.log("Previewing", data);
  switch (config.slug) {
    case "projects":
      return "projects";
    case "pages":
      return "";
    default:
      return "";
  }
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    livePreview: {
      url: ({ data, collectionConfig, locale }) =>
        `${PRODUCTION_URL}/${locale.code}/${collectionConfig == null ? "" : pathFromConfig(collectionConfig, data)}?draftMode=true`,
      collections: [Projects.slug, Pages.slug, Emails.slug],
    },
  },
  collections: [
    Users,
    Media,
    Projects,
    Pages,
    ProjectCategories,
    Technologies,
    OgImages,
    Emails,
  ],
  blocks: [BlockEmailButton],
  editor: richTextEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || "",
    },
  }),
  sharp,
  plugins: [
    s3Storage({
      collections: {
        media: true,
      },
      bucket: S3_BUCKET_NAME,
      acl: "public-read",
      config: {
        credentials: {
          accessKeyId: S3_ACCESS_KEY_ID,
          secretAccessKey: S3_ACCESS_KEY_SECRET,
        },
        region: S3_SERVER_REGION,
        endpoint: S3_SERVER_URL,
        forcePathStyle: true,
      },
    }),
  ],
  localization: {
    locales: ["en", "pl"],
    defaultLocale: "en",
  },
  email: nodemailerAdapter({
    defaultFromAddress: EMAIL_FROM_ADDRESS,
    defaultFromName: EMAIL_FROM_NAME,
    transportOptions: {
      host: "smtp.resend.com",
      port: 465,
      secure: true,
      auth: {
        user: "resend",
        pass: process.env.RESEND_API_KEY,
      },
    },
  }),
  serverURL: PRODUCTION_URL,
});
