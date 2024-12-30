"use client";

import { ChangeEvent, createRef, ReactNode, useEffect } from "react";

export default function InputBox({
  label,
  value,
  setValue,
  type = "text",
  required = true,
  options,
  placeholder,
  name,
  autofocus = false,
  info,
}: {
  label: string;
  value: string | number | boolean;
  setValue: Function;
  type?: string;
  required?: boolean;
  options?: Map<number | string, string>;
  placeholder?: string;
  name?: string;
  autofocus?: boolean;
  info?: ReactNode;
}) {
  const ref = createRef<HTMLInputElement>();
  const isDropdown = type === "dropdown";
  const isCheckbox = type === "checkbox";

  function handleChange(
    evt: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    predicate: Function
  ) {
    const val = isCheckbox
      ? (evt.target as HTMLInputElement).checked
      : predicate(evt.target.value);
    setValue(val);
  }

  if (isDropdown && !options) {
    throw Error(
      "'options' prop must be provided when using 'dropdown' InputBox type."
    );
  }

  useEffect(() => {
    if (autofocus) ref.current?.select();
  }, []);

  return (
    <label className={`input-box input-${type} ${isCheckbox ? "nowrap" : ""}`}>
      <div className="flex gap-10">
        {required && value === "" && (
          <span className="required-asterisk">*</span>
        )}
        <span>{label}</span>
        {info}
      </div>
      {isDropdown ? (
        <select
          value={value as string | number}
          onChange={(evt) => handleChange(evt, parseInt)}
        >
          {[...(options?.entries() ?? [])].map(([key, value], idx) => (
            <option key={idx} value={key}>
              ID {key}: {value}
            </option>
          ))}
        </select>
      ) : isCheckbox ? (
        <input
          ref={ref}
          checked={value as boolean}
          type={type}
          onChange={(evt) => handleChange(evt, (val: string) => val)}
          required={required}
          autoFocus={autofocus}
        />
      ) : (
        <input
          ref={ref}
          value={value as string | number}
          type={type}
          onChange={(evt) => handleChange(evt, (val: string) => val)}
          required={required}
          placeholder={placeholder}
          name={name}
          autoFocus={autofocus}
        />
      )}
    </label>
  );
}
