"use client";

import * as React from "react";
import { cn } from "../lib/utils";

export type SwitchProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "checked" | "onChange"
> & {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
};

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      checked,
      disabled = false,
      label,
      onCheckedChange,
      className = "",
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "group relative inline-flex h-7 min-h-7 w-12 min-w-12 max-w-12 shrink-0 cursor-pointer items-center rounded-full border p-0 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed",
          checked
            ? "border-black bg-black disabled:border-black/35 disabled:bg-white"
            : "border-black/25 bg-white disabled:border-black/20 disabled:bg-white",
          className,
        )}
        {...props}
      >
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute left-0.5 block h-6 min-h-6 w-6 min-w-6 rounded-full shadow-sm transition-transform duration-200",
            checked
              ? "translate-x-5 bg-white group-disabled:bg-black/25"
              : "translate-x-0 bg-black",
          )}
        />
      </button>
    );
  },
);

Switch.displayName = "Switch";
