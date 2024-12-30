"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export default function InputArea({
  value,
  setValue,
}: {
  value: string;
  setValue: Function;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setValue(editor.getHTML());
    },
  });

  return <EditorContent editor={editor} />;
}
