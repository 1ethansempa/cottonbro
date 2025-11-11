// packages/ui/src/components/logo/Logo.tsx
"use client";
import * as React from "react";
import { Wordmark } from "./wordmark";

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export type LogoProps = {
  /** purely wordmark */
  name?: string;
  color?: "white" | "black" | "current";
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  weight?: "normal" | "semibold" | "bold";
  tracking?: string;
  className?: string;
  ariaLabel?: string;
  fontClassName?: string;
};

export function Logo({
  name = "CottonBro",
  color = "white",
  size = "lg",
  weight = "semibold",
  tracking = "tracking-tight",
  className,
  ariaLabel,
  fontClassName = "font-jamino",
}: LogoProps) {
  return (
    <Wordmark
      text={name}
      color={color}
      size={size}
      weight={weight}
      tracking={tracking}
      className={className}
      ariaLabel={ariaLabel}
      fontClassName={fontClassName}
    />
  );
}

export default Logo;
