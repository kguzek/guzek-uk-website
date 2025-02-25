import type { CollectionConfig } from "payload";

import { ALPHANUMERIC_PATTERN, isAdmin, validateUrl } from "@/lib/payload";

export const Projects: CollectionConfig = {
  slug: "projects",
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
      validate: (value?: string | null) =>
        ALPHANUMERIC_PATTERN.test(value ?? "") || "Invalid slug",
    },
    {
      name: "title",
      type: "text",
      localized: true,
      required: true,
    },
    {
      name: "description",
      type: "richText",
      localized: true,
      required: true,
    },
    {
      name: "repository",
      label: "Repository URL",
      type: "text",
      validate: validateUrl,
    },
    {
      name: "url",
      label: "Showcase URL",
      type: "text",
      validate: validateUrl,
    },
    {
      name: "mainImage",
      type: "relationship",
      relationTo: "media",
      required: true,
    },
    {
      name: "extraImages",
      type: "relationship",
      relationTo: "media",
      hasMany: true,
    },
  ],
};
