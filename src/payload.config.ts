import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import { FixedToolbarFeature, lexicalEditor } from "@payloadcms/richtext-lexical";
import sharp from "sharp";

import { Media } from "./collections/Media";
import { OgImages } from "./collections/OgImages";
import { Pages } from "./collections/Pages";
import { ProjectCategories } from "./collections/ProjectCategories";
import { Projects } from "./collections/Projects";
import { Technologies } from "./collections/Technologies";
import { Users } from "./collections/Users";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Projects, Pages, ProjectCategories, Technologies, OgImages],
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
  plugins: [],
  localization: {
    locales: ["en", "pl"],
    defaultLocale: "en",
  },
  email: nodemailerAdapter({
    defaultFromAddress: "noreply@guzek.uk",
    defaultFromName: "Guzek UK",
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
