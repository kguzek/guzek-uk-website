"use client";

import { useEffect, useState } from "react";
import "./modal.css";
import { cn } from "@/lib/utils";
import { TextWithUrl } from "../text-with-url";

export type ModalHandler = (primary: boolean) => void;

// const MODAL_DISAPPEARS_AFTER_MS = 10_000;

export function Modal({
  value = "",
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
    <div className={cn("modal-background z-30", { "modal-hidden": !value })}>
      <div className={cn("modal z-40", className)}>
        <TextWithUrl>{value || oldValue}</TextWithUrl>
        <div className="modal-buttons">
          <button
            type="button"
            className={cn({ "btn-primary": !!labelSecondary })}
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
