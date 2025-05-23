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
        description:
          "https://github.com/marwin1991/profile-technology-icons/tree/main/icons/",
      },
    },
    {
      name: "isSimpleIcon",
      type: "checkbox",
      defaultValue: false,
      required: true,
      admin: {
        description:
          "Use SimpleIcons instead of marwin1991's icons: https://simpleicons.org",
      },
    },
  ],
};
