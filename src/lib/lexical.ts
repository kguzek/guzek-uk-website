import type { HTMLConverter } from "@payloadcms/richtext-lexical";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import type { HtmlToTextOptions } from "html-to-text";
import type { Payload } from "payload";
import { getPayload } from "payload";
import config from "@payload-config";
import {
  consolidateHTMLConverters,
  convertLexicalToHTML,
  defaultEditorConfig,
  defaultEditorFeatures,
  HTMLConverterFeature,
  sanitizeServerEditorConfig,
} from "@payloadcms/richtext-lexical";
import { htmlToText } from "html-to-text";

import type { EmailButton } from "@/payload-types";
import { serializeEmailButton } from "@/collections/blocks/BlockEmailButton";

// export function convertLexicalToPlainText(
//   editorStateJSON: SerializedEditorState<SerializedLexicalNode>,
// ) {
//   try {
//     const headlessEditor = createHeadlessEditor({ onError: () => {} });
//     const plainText = headlessEditor.parseEditorState(editorStateJSON).read(() => {
//       return $getRoot().getTextContent();
//     });
//     return plainText;
//   } catch (error) {
//     console.error("Error converting Lexical content:", error);
//     return "";
//   }
// }

const SELECTORS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

interface BlockNode {
  type: "block";
  fields: EmailButton; // add more block types here in the future
  format: "";
  version: 2;
}

const BlockConverter: HTMLConverter = {
  nodeTypes: ["block"],
  converter: ({ node }) => {
    console.log("node is", node);
    const blockNode = node as BlockNode;
    switch (blockNode.fields.blockType) {
      case "email-button":
        return serializeEmailButton(blockNode.fields);
      default:
        return "";
    }
  },
};

export async function convertLexicalToHtmlWithPayload(
  editorStateJSON: SerializedEditorState,
  payload: Payload,
) {
  const editorConfig = defaultEditorConfig;
  editorConfig.features = [...defaultEditorFeatures, HTMLConverterFeature({})];

  const sanitizedEditorConfig = await sanitizeServerEditorConfig(
    editorConfig,
    await config,
  );
  const html = await convertLexicalToHTML({
    data: editorStateJSON,
    converters: [
      ...consolidateHTMLConverters({ editorConfig: sanitizedEditorConfig }),
      BlockConverter,
    ],
    payload,
  });
  return html;
}

export async function convertLexicalToPlainText(
  editorStateJSON: SerializedEditorState,
  wordWrap: HtmlToTextOptions["wordwrap"] = false,
) {
  const payload = await getPayload({ config });
  const html = await convertLexicalToHtmlWithPayload(editorStateJSON, payload);
  return convertHtmlToPlainText(html, wordWrap);
}

export function convertHtmlToPlainText(
  html: string,
  wordWrap: HtmlToTextOptions["wordwrap"] = false,
) {
  const options: HtmlToTextOptions = {
    wordwrap: wordWrap,
    formatters: Object.fromEntries(
      SELECTORS.map((selector) => [
        `${selector}Formatter`,
        (elem, walk, builder, formatOptions) =>
          builder.options.formatters[selector]?.(elem, walk, builder, formatOptions),
      ]),
    ),
    selectors: SELECTORS.map((selector) => ({
      selector: selector,
      format: `${selector}Formatter`,
      options: { uppercase: false },
    })),
  };
  return htmlToText(html, options);
}
