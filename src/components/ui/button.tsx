"use client";

import type { CSSProperties, EventHandler, MouseEvent, TouchEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { Glow } from "@codaworks/react-glow";
import { Slot } from "@radix-ui/react-slot";
import { Loader, Lock } from "lucide-react";

import { cn } from "@/lib/utils";

import type { ButtonProps } from "./config";
import { buttonVariants } from "./config";

export function Button({
  className,
  variant,
  size,
  loading = false,
  asChild = false,
  ...props
}: ButtonProps & { loading?: boolean; onClick?: EventHandler<MouseEvent | TouchEvent> }) {
  const Comp = asChild ? Slot : "button";
  const clickProtectionEnabled = variant === "super-destructive";
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [sliderProgress, setSliderProgress] = useState(0);
  const [canClick, setCanClick] = useState(!clickProtectionEnabled);
  const [isHovering, setIsHovering] = useState(false);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sliderRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const ref = hoverTimerRef.current;
    if (ref == null) {
      return;
    }
    return () => {
      clearInterval(ref);
    };
  }, [hoverTimerRef]);

  function startHoverTimer() {
    stopHoverTimer();
    setIsHovering(true);
    if (hoverTimerRef.current != null) {
      clearTimeout(hoverTimerRef.current);
    }
    hoverTimerRef.current = setTimeout(() => {
      setCanClick(true);
    }, 2000);
  }

  function stopHoverTimer() {
    setIsHovering(false);
    if (clickProtectionEnabled) {
      setCanClick(false);
    }
    if (hoverTimerRef.current != null) {
      clearTimeout(hoverTimerRef.current);
    }
  }

  function click(event_: MouseEvent | TouchEvent) {
    if (!canClick) {
      return;
    }
    stopHoverTimer();
    return props.onClick?.(event_);
  }

  function getColorMixStyle(
    percentage: number,
    from: string,
    to: string,
  ): CSSProperties | undefined {
    if (isHovering || !clickProtectionEnabled) {
      return props.style;
    }
    const mixAmount = Math.min(100, percentage * 1.4);
    return {
      ...props.style,
      transition: "all 300ms ease, background 0ms",
      backgroundColor: `color-mix(in hsl, var(--color-${from}) ${100 - mixAmount}%, var(--color-${to}) ${mixAmount}%)`,
    };
  }

  const content = (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }), {
        "bg-error [transition:all_300ms_ease,background_2s_linear]":
          clickProtectionEnabled && isHovering,
        "cursor-not-allowed": clickProtectionEnabled && !canClick,
      })}
      {...props}
      style={getColorMixStyle(sliderProgress, "success", "error")}
      disabled={loading || props.disabled}
      // use comma notation to return using the original event handler
      onMouseEnter={(event_) => (startHoverTimer(), props.onMouseEnter?.(event_))}
      onMouseLeave={(event_) => (stopHoverTimer(), props.onMouseLeave?.(event_))}
      onFocus={(event_) => (startHoverTimer(), props.onFocus?.(event_))}
      onBlur={(event_) => (stopHoverTimer(), props.onBlur?.(event_))}
      onClick={(event_) => click(event_)}
      onTouchMove={(event_) => {
        const touch = event_.touches[0];
        if (touchStart == null) {
          setTouchStart(touch.clientX);
          setSliderProgress(0);
          return;
        }
        const progress = Math.round(
          100 *
            Math.min(
              1,
              (1.5 * Math.max(touch.clientX - touchStart, 0)) /
                (sliderRef.current?.clientWidth ?? 1),
            ),
        );
        if (progress >= 90) {
          setSliderProgress(100);
          setCanClick(true);
        } else {
          setSliderProgress(progress);
        }
      }}
      onTouchEnd={(event_) => {
        setTouchStart(null);
        if (sliderProgress < 100) {
          setSliderProgress(0);
        }
        props.onTouchEnd?.(event_);
      }}
      ref={(element) => {
        sliderRef.current = element;
        if (props.ref == null) {
          return;
        }
        if (typeof props.ref === "function") {
          props.ref(element);
        } else {
          props.ref.current = element;
        }
      }}
    >
      {loading ? (
        <Loader className="animate-spin" />
      ) : clickProtectionEnabled ? (
        <>
          <div
            className={cn(
              "bg-background absolute inset-0 grid h-full w-full place-items-center border-l border-transparent",
              {
                "transition-[border,transform,translate] duration-300":
                  sliderProgress === 0,
                "border-primary-strong translate-x-full [transition:border_300ms_ease,transform_2s_linear,translate_2s_linear]":
                  isHovering && sliderProgress === 0,
                "border-primary-strong": sliderProgress > 0,
              },
            )}
            style={{
              transform: `translateX(${sliderProgress}%)`,
            }}
          >
            <Lock />
          </div>
          {props.children}
        </>
      ) : (
        props.children
      )}
    </Comp>
  );

  return variant?.endsWith("glow") ? <Glow>{content}</Glow> : content;
}
