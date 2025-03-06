import type { CollectionConfig } from "payload";

import { isAdmin } from "@/lib/payload";

export const Technologies: CollectionConfig = {
  slug: "technologies",
  access: {
    create: isAdmin,
    read: () => true,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: "name",
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      unique: true,
    },
    {
      name: "hasLogo",
      type: "checkbox",
      defaultValue: true,
      required: true,
      admin: {
        description: "https://simpleicons.org",
      },
    },
  ],
};
