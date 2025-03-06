import type { CollectionConfig } from "payload";

import { isAdmin } from "@/lib/payload";

export const Pages: CollectionConfig = {
  slug: "pages",
  access: {
    create: isAdmin,
    read: () => true,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: "title",
      type: "text",
      localized: true,
      required: true,
    },
    {
      name: "seoTitle",
      type: "text",
      localized: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
    },
    {
      name: "content",
      type: "richText",
      localized: true,
      required: true,
    },
  ],
};
