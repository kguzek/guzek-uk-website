import type { Block } from "payload";

export const BlockRichText: Block = {
  slug: "rich-text",
  fields: [{ name: "content", type: "richText", required: true }],
};
