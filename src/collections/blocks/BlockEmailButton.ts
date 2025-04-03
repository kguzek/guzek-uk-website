import type { Block } from "payload";

import type { EmailButton } from "@/payload-types";
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

export const serializeEmailButton = (data: EmailButton) => `
<div class="button-container">
  <a style="color: #fff !important" href="${data.url}" class="button">
    ${data.label}
  </a>
</div>`;
