"use client";

import { ChangeEvent, ReactNode, createRef, useEffect } from "react";

import { cn } from "@/lib/cn";

export function InputBox({
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
  disabled = false,
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
  disabled?: boolean;
}) {
  const ref = createRef<HTMLInputElement>();
  const isDropdown = type === "dropdown";
  const isCheckbox = type === "checkbox";

  function handleChange(
    evt: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    predicate: Function,
  ) {
    const val = isCheckbox
      ? (evt.target as HTMLInputElement).checked
      : predicate(evt.target.value);
    setValue(val);
  }

  if (isDropdown && !options) {
    throw Error(
      "'options' prop must be provided when using 'dropdown' InputBox type.",
    );
  }

  useEffect(() => {
    if (autofocus) ref.current?.select();
  }, []);

  return (
    <label
      className={cn(`input-box input-${type}`, {
        "sm:whitespace-nowrap": isCheckbox,
      })}
    >
      <div className="flex gap-2">
        {required && value === "" && (
          <span className="required-asterisk">*</span>
        )}
        <span>{label}</span>
        {info}
      </div>
      {isDropdown ? (
        <select
          className="h-7 cursor-pointer rounded-xl px-3"
          value={value as string | number}
          onChange={(evt) => handleChange(evt, parseInt)}
          disabled={disabled || undefined}
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
          disabled={disabled || undefined}
        />
      ) : (
        <input
          className="h-7 rounded-md px-1"
          ref={ref}
          value={value as string | number}
          type={type}
          onChange={(evt) => handleChange(evt, (val: string) => val)}
          required={required}
          placeholder={placeholder}
          name={name}
          autoFocus={autofocus}
          disabled={disabled || undefined}
        />
      )}
    </label>
  );
}
