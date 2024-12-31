"use client";

import { useEffect, useState } from "react";
import "./modal.css";

export type ModalHandler = (primary: boolean) => void;

// const MODAL_DISAPPEARS_AFTER_MS = 10_000;

const VALUE_URL_PATTERN = /^(.+)(https:\/\/[^\s]+)(\s.+)?$/g;

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

  let before = (value || oldValue) ?? "";
  let url = "";
  let after = "";
  const match = VALUE_URL_PATTERN.exec(before);
  if (match) {
    [before, url, after] = match.slice(1);
  }

  return (
    <div className={`modal-background ${value ? "" : "hidden"} z-30`}>
      <div className={`modal ${className} z-40`}>
        <p>
          {before}
          {url && (
            <a href={url} target="_blank">
              {url}
            </a>
          )}
          {after || (url && ".")}
        </p>
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
