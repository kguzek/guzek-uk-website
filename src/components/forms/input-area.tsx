"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { BlockEditor } from "./tiptap/BlockEditor";
import { useBlockEditor } from "@/hooks/useBlockEditor";
import { useEffect } from "react";

export function InputAreaOld({
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

  return (
    <>
      <EditorContent editor={editor} />
    </>
  );
}

export function InputArea({
  value,
  setValue,
  contentId,
}: {
  value: string;
  setValue: (value: string) => void;
  contentId: number | string;
}) {
  const { editor } = useBlockEditor({
    value,
    onUpdate,
  });

  useEffect(() => {
    editor?.commands.setContent(value);
  }, [contentId]);

  function onUpdate({ editor }: { editor: Editor }) {
    setValue(editor.getHTML());
  }

  if (!editor) return null;
  return (
    <div className="w-[100vw] bg-background-strong">
      <div className="text bg-background">
        <BlockEditor editor={editor} />
      </div>
    </div>
  );
}
