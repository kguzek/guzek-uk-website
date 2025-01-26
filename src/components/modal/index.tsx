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
  variant,
}: {
  value?: string;
  onClick: ModalHandler;
  labelPrimary?: string;
  labelSecondary?: string;
  variant?: string;
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
    <div
      className={cn(
        "modal-background visible fixed left-0 top-0 z-30 h-screen w-full opacity-100 transition-all duration-300",
        { "modal-hidden invisible opacity-0": !value },
      )}
    >
      <div
        className={cn(
          "modal fixed left-0 right-0 z-40 mx-auto w-[95%] rounded-lg bg-accent-soft px-2 py-1 font-serif font-normal text-background transition-transform duration-300 sm:w-[90%] sm:rounded-xl sm:px-5 sm:py-2 md:box-border lg:w-3/4 xl:w-1/2",
          {
            "bg-error text-primary-strong": variant === "error",
          },
        )}
      >
        <TextWithUrl>{value || oldValue}</TextWithUrl>
        <div className="flex justify-end gap-2 font-bold">
          <button
            type="button"
            className={cn(
              "min-w-[100px] rounded-md border-none bg-background-soft px-3 py-1 uppercase text-primary-strong transition-opacity duration-200 hover:opacity-100 sm:rounded-lg sm:opacity-75",
              {
                "bg-success": !!labelSecondary,
                "bg-primary-strong text-background-soft": variant === "error",
              },
            )}
            onClick={() => onClick(true)}
          >
            {labelPrimary}
          </button>
          {labelSecondary && (
            <button
              type="button"
              className="bg-error"
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
