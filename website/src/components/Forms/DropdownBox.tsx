import { ChangeEvent, useEffect, useId, useState } from "react";

export default function DropdownBox({
  label,
  value,
  setValue,
  options,
}: {
  label: string;
  value: any;
  setValue: Function;
  options: string[];
}) {
  const [id, setID] = useState<string>("");

  useEffect(() => {
    const int = Math.round(Math.random() * 100_000);
    setID(`dropdown-${int}`);
  }, []);

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    setValue(event.target.value);
  }

  return (
    <div className="flex-column">
      <label className="input-label" htmlFor={id}>
        {label}
      </label>
      <select id={id} value={value} onChange={handleChange}>
        {Object.entries(options).map(([key, value]) => (
          <option value={key}>{value}</option>
        ))}
      </select>
    </div>
  );
}
