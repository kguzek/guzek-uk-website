import type { CollectionConfig } from "payload";

import { isAdmin } from "@/lib/payload";

export const OgImages: CollectionConfig = {
  slug: "og-images",
  labels: {
    singular: "OpenGraph Image",
    plural: "OpenGraph Images",
  },
  access: {
    create: isAdmin,
    read: () => true,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      required: true,
    },
  ],
};
