import type { Block, Payload } from "payload";

import type {
  EmailButton,
  EmailRecipients,
  EmailTemplate,
  RichText,
} from "@/payload-types";
import { PRODUCTION_URL } from "@/lib/constants";
import { convertLexicalToHtmlWithPayload } from "@/lib/lexical";

// TODO: is there a provided factory for serialized rich text nodes?
const DEFAULT_RICH_TEXT_CONTENT = {
  root: {
    type: "root",
    format: "",
    indent: 0,
    version: 1,
    children: [
      {
        type: "paragraph",
        format: "",
        indent: 0,
        version: 1,
        children: [
          {
            mode: "normal",
            text: "Hello{USERNAME},",
            type: "text",
            style: "",
            detail: 0,
            format: 0,
            version: 1,
          },
        ],
        direction: "ltr",
        textStyle: "",
        textFormat: 0,
      },
      {
        type: "paragraph",
        format: "",
        indent: 0,
        version: 1,
        children: [
          {
            mode: "normal",
            text: "You are receiving this email because ",
            type: "text",
            style: "",
            detail: 0,
            format: 0,
            version: 1,
          },
        ],
        direction: "ltr",
        textStyle: "",
        textFormat: 0,
      },
    ],
    direction: "ltr",
  },
};

export const BlockEmailTemplate: Block = {
  slug: "email-template",
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "paragraphs",
      type: "blocks",
      required: true,
      blocks: [],
      blockReferences: ["email-button", "rich-text"],
      defaultValue: [
        {
          blockType: "rich-text",
          blockName: "Introduction",
          content: DEFAULT_RICH_TEXT_CONTENT,
        },
      ],
    },
  ],
};

const EMAIL_TEMPLATE_CONTENT = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{EMAIL_TITLE}</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333333;
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
      }
      .container {
        max-width: 600px;
        margin: 20px auto;
        padding: 20px;
        background-color: #ffffff;
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }
      h1 {
        color: #2596be;
        text-align: center;
        font-size: 40px;
      }
      .content {
        text-align: start;
        font-size: 20px;
      }
      .button-container {
        text-align: center;
      }
      .button {
        display: inline-block;
        padding: 10px 20px;
        margin: 20px 0;
        background-color: #2596be;
        text-decoration: none;
        border-radius: 5px;
        font-weight: bold;
      }
      .footer {
        margin-top: 20px;
        text-align: center;
        font-size: 12px;
        color: #666666;
      }
      .footer hr {
        border: none;
        border-top: 1px solid #dddddd;
        margin: 20px 0;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>{EMAIL_TITLE}</h1>
      <div class="content">
        {EMAIL_PARAGRAPHS}
      </div>
      <div class="footer">
        <hr />
        <p>{CURRENT_YEAR} &copy;&nbsp;<a href="{WEBSITE_URL}">Konrad Guzek</a></p>
      </div>
    </div>
  </body>
</html>`;

const EMAIL_BUTTON_CONTENT = `
<div class="button-container">
  <a style="color: #fff !important" href="{BUTTON_URL}" class="button">
    {BUTTON_LABEL}
  </a>
</div>`;

async function serializeEmailParagraph(
  paragraph: EmailButton | RichText,
  payload: Payload,
) {
  switch (paragraph.blockType) {
    case "email-button":
      return EMAIL_BUTTON_CONTENT.replaceAll("{BUTTON_URL}", paragraph.url).replaceAll(
        "{BUTTON_LABEL}",
        paragraph.label,
      );
    case "rich-text":
      return await convertLexicalToHtmlWithPayload(paragraph.content, payload);
    default:
      return "";
  }
}

export async function serializeEmailTemplate(
  block: EmailTemplate,
  payload: Payload,
  recipient: EmailRecipients[number],
) {
  const replacements: Record<string, string> = {
    "{EMAIL_TITLE}": block.title,
    "{EMAIL_PARAGRAPHS}": (
      await Promise.all(
        block.paragraphs.map((paragraph) => serializeEmailParagraph(paragraph, payload)),
      )
    ).join("\n"),
    "{CURRENT_YEAR}": new Date().getFullYear().toString(),
    "{WEBSITE_URL}": PRODUCTION_URL,
    "{USERNAME}": recipient.name ? ` @${recipient.name}` : "",
    "{EMAIL}": recipient.email,
  };
  let content = EMAIL_TEMPLATE_CONTENT;
  for (const [key, value] of Object.entries(replacements)) {
    content = content.replaceAll(key, value);
  }
  return content;
}
