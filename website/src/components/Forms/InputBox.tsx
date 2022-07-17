import React, { ChangeEvent } from "react";

export default function InputBox({
  label,
  value,
  setValue,
  type = "text",
  required = true,
  options,
}: {
  label: string;
  value: string | number | boolean;
  setValue: Function;
  type?: string;
  required?: boolean;
  options?: Map<number | string, string>;
}) {
  function handleChange(
    evt: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    predicate: Function
  ) {
    const val =
      type === "checkbox"
        ? (evt.target as HTMLInputElement).checked
        : predicate(evt.target.value);
    setValue(val);
  }

  const isDropdown = type === "dropdown";

  if (isDropdown && !options) {
    throw Error(
      "'options' prop must be provided when using 'dropdown' InputBox type."
    );
  }

  return (
    <label className={`input-box input-${type}`}>
      <span>
        {required && value === "" && (
          <span className="required-asterisk">*</span>
        )}
        {label}
      </span>
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
      ) : (
        <input
          value={value as string | number}
          type={type}
          onChange={(evt) => handleChange(evt, (val: string) => val)}
          required={required}
        />
      )}
    </label>
  );
}
