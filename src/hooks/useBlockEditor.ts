import { useEditor } from "@tiptap/react";
import type { Editor } from "@tiptap/core";

import { ExtensionKit } from "@/extensions/extension-kit";
import { initialContent } from "@/lib/data/initialContent";
import { Transaction } from "@tiptap/pm/state";

declare global {
  interface Window {
    editor: Editor | null;
  }
}

export const useBlockEditor = ({
  value,
  onUpdate,
}: {
  value: string;
  onUpdate: (ctx: { editor: Editor; transaction: Transaction }) => void;
}) => {
  const editor = useEditor({
    content: value,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    autofocus: true,
    onCreate: (ctx) => {
      if (ctx.editor.isEmpty) {
        ctx.editor.commands.setContent(initialContent);
        ctx.editor.commands.focus("start", { scrollIntoView: true });
      }
    },
    onUpdate,
    extensions: ExtensionKit(),
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        class: "min-h-full",
      },
    },
  });

  try {
    window.editor = editor;
  } catch {}

  return { editor };
};
