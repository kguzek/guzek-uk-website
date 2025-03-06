import type { CollectionConfig } from "payload";

import { isAdmin } from "@/lib/payload";

export const ProjectCategories: CollectionConfig = {
  slug: "project-categories",
  access: {
    create: isAdmin,
    read: () => true,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: "label",
  },
  fields: [
    {
      name: "label",
      type: "text",
      required: true,
      unique: true,
      localized: true,
    },
  ],
};
