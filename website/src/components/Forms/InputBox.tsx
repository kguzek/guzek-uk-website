import React, { ChangeEvent } from "react";

export default function InputBox({
  label,
  value,
  setValue,
  type = "text",
  required = true,
}: {
  label: string;
  value: string;
  setValue: Function;
  type?: string;
  required?: boolean;
}) {
  function handleChange(evt: ChangeEvent<HTMLInputElement>) {
    setValue(evt.target.value);
  }

  return (
    <label className="input-box">
      {label}
      <input
        value={value}
        type={type}
        onChange={handleChange}
        required={required}
      />
    </label>
  );
}
