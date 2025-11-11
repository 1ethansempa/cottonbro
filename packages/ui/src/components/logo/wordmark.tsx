// packages/ui/src/components/logo/Wordmark.tsx
"use client";
import * as React from "react";

// Framework-agnostic wordmark (no next/font dependency)
function cn(...p: Array<string | false | null | undefined>) {
  return p.filter(Boolean).join(" ");
}

export type WordmarkProps = {
  /** Text to display, defaults to CottonBro */
  text?: string;
  /** Text color: white, black, or current */
  color?: "white" | "black" | "current";
  /** Visual size preset mapped to Tailwind text classes */
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  /** Font weight */
  weight?: "normal" | "semibold" | "bold";
  /** Tracking or letter spacing utility */
  tracking?: string;
  /** Extra classes */
  className?: string;
  /** Accessible label override */
  ariaLabel?: string;
  /** Font class override (defaults to font-jamino) */
  fontClassName?: string;
};

const sizes: Record<NonNullable<WordmarkProps["size"]>, string> = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-2xl",
  xl: "text-3xl",
  "2xl": "text-4xl",
};

export function Wordmark({
  text = "CottonBro",
  color = "white",
  size = "lg",
  weight = "semibold",
  tracking = "tracking-tight",
  className,
  ariaLabel,
  fontClassName = "font-jamino",
}: WordmarkProps) {
  return (
    <span
      role="img"
      aria-label={ariaLabel ?? text}
      className={cn(
        fontClassName,
        "select-none leading-none",
        sizes[size],
        weight === "bold"
          ? "font-bold"
          : weight === "semibold"
            ? "font-semibold"
            : "font-normal",
        tracking,
        color === "white"
          ? "text-white"
          : color === "black"
            ? "text-black"
            : "text-current",
        className
      )}
    >
      {text}
    </span>
  );
}

export default Wordmark;
