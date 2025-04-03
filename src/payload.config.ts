import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import { FixedToolbarFeature, lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import sharp from "sharp";

import { BlockEmailButton } from "./collections/blocks/BlockEmailButton";
import { BlockEmailTemplate } from "./collections/blocks/BlockEmailTemplate";
import { BlockRichText } from "./collections/blocks/BlockRichText";
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
  S3_ACCESS_KEY_ID,
  S3_ACCESS_KEY_SECRET,
  S3_BUCKET_NAME,
  S3_SERVER_REGION,
  S3_SERVER_URL,
} from "./lib/constants";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
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
  blocks: [BlockEmailTemplate, BlockEmailButton, BlockRichText],
  editor: lexicalEditor({
    features: ({ defaultFeatures, rootFeatures }) => [
      ...defaultFeatures,
      ...rootFeatures,
      FixedToolbarFeature(),
    ],
  }),
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
});
