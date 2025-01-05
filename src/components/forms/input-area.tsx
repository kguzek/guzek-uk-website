"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export default function InputArea({
  value,
  setValue,
}: {
  value: string;
  setValue: (value: string) => void;
}) {
  const editor = useEditor(
    {
      extensions: [StarterKit],
      content: value,
      immediatelyRender: false,
      onUpdate: ({ editor }) => {
        setValue(editor.getHTML());
      },
    },
    [value],
  );

  return <EditorContent editor={editor} />;
}
