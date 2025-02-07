import type { CollectionConfig } from "payload";

import { isAdmin, validateUrl } from "@/lib/payload";

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
      name: "title",
      type: "text",
      localized: true,
      required: true,
    },
    {
      name: "description",
      type: "text",
      localized: true,
      required: true,
    },
    {
      name: "url",
      label: "URL",
      type: "text",
      validate: validateUrl,
    },
    {
      name: "repository",
      type: "text",
      validate: validateUrl,
    },
    {
      name: "images",
      type: "array",
      fields: [
        {
          name: "image",
          type: "relationship",
          relationTo: "media",
        },
        {
          name: "isMain",
          label: "Main image",
          type: "checkbox",
          defaultValue: false,
        },
      ],
      validate: (images) => {
        if (!images) return "You must upload at least one image.";
        let numMainImages = 0;
        for (const image of images) {
          const isMain = (image as { isMain: boolean }).isMain;
          if (isMain) numMainImages++;
          if (numMainImages > 1) {
            return "You can only have one main image.";
          }
        }
        return numMainImages === 1 || "There must a main image selected.";
      },
    },
  ],
};
