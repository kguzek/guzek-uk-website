"use client";

import type { ClassValue } from "clsx";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import type { ModalHandler } from "@/lib/types";
import { TextWithUrl } from "@/components/text-with-url";
import { cn } from "@/lib/utils";

// const MODAL_DISAPPEARS_AFTER_MS = 10_000;

function ModalButton({
  classValue,
  onClick,
  children,
}: {
  classValue: ClassValue;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={cn(
        "bg-background-soft text-primary-strong min-w-[100px] rounded-md border-none px-3 py-1 uppercase transition-opacity duration-200 hover:opacity-100 sm:rounded-lg sm:opacity-75",
        classValue,
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

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
    // className={cn(
    //   "visible fixed left-0 top-0 z-30 h-screen w-full opacity-100 backdrop-blur-xs transition-all duration-300",
    //   { "modal-hidden invisible opacity-0": !value },
    // )}
    >
      <div
        className={cn(
          "bg-accent-soft text-background fixed top-0 right-0 left-0 z-40 mx-auto mt-20 w-[95%] rounded-lg px-2 py-1 font-serif font-normal transition-[transform,margin] duration-300 sm:w-[90%] sm:rounded-xl sm:px-5 sm:py-2 md:box-border lg:w-3/4 xl:w-1/2",
          {
            "bg-error text-primary-strong": variant === "error",
            "mt-0 -translate-y-[100%]": !value,
          },
        )}
      >
        <TextWithUrl>{value || oldValue}</TextWithUrl>
        <div className="flex justify-end gap-2 font-bold">
          <ModalButton
            classValue={{
              "bg-success": !!labelSecondary,
              "bg-primary-strong text-background-soft": variant === "error",
            }}
            onClick={() => onClick(true)}
          >
            {labelPrimary}
          </ModalButton>
          {labelSecondary && (
            <ModalButton classValue={"bg-error"} onClick={() => onClick(false)}>
              {labelSecondary}
            </ModalButton>
          )}
        </div>
      </div>
    </div>
  );
}
