import type { CollectionConfig } from "payload";

import { isAdmin } from "@/lib/payload";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    create: isAdmin,
    read: () => true,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
  ],
  upload: true,
};
