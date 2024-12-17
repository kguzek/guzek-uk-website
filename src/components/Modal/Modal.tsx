import React, { useEffect, useState } from "react";
import "./Modal.css";

export type ModalHandler = (primary: boolean) => void;

// const MODAL_DISAPPEARS_AFTER_MS = 10_000;

export default function Modal({
  value,
  onClick,
  labelPrimary = "Ok",
  labelSecondary,
  className = "",
}: {
  value?: string;
  onClick: ModalHandler;
  labelPrimary?: string;
  labelSecondary?: string;
  className?: string;
}) {
  const [oldValue, setOldValue] = useState(value);

  useEffect(() => {
    if (value) {
      setOldValue(value);
    } else {
      setTimeout(() => setOldValue(value), 300);
    }
  }, [value]);

  return (
    <div className={`modal-background ${value ? "" : "hidden"}`}>
      <div className={`modal ${className}`}>
        <p>{value || oldValue}</p>
        <div className="modal-buttons">
          <button
            type="button"
            className={labelSecondary ? "btn-primary" : ""}
            onClick={() => onClick(true)}
          >
            {labelPrimary}
          </button>
          {labelSecondary && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => onClick(false)}
            >
              {labelSecondary}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

