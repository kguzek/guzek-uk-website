import React from "react";
import RichTextEditor, { EditorValue } from "react-rte";

export const getEmptyMarkdown = RichTextEditor.createEmptyValue;

export default function InputArea({
  value,
  setValue,
}: {
  value: EditorValue;
  setValue: Function;
}) {
  function handleChange(newValue: any) {
    setValue(newValue);
  }

  return <RichTextEditor value={value} onChange={handleChange} />;
}
