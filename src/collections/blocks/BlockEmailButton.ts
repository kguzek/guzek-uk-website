import type { Block } from "payload";

import { validateUrl } from "@/lib/payload";

export const BlockEmailButton: Block = {
  slug: "email-button",
  fields: [
    {
      name: "label",
      type: "text",
      required: true,
    },
    {
      name: "url",
      type: "text",
      required: true,
      validate: validateUrl,
    },
  ],
};
