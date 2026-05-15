import * as React from "react";
import { cn } from "../lib/utils";

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  tone?: "default" | "danger" | "muted";
  padding?: "none" | "sm" | "md" | "lg";
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ tone = "default", padding = "md", className, ...props }, ref) => {
    const tones: Record<NonNullable<CardProps["tone"]>, string> = {
      default: "border-gray-200 bg-white text-black",
      muted: "border-gray-200 bg-gray-50 text-black",
      danger: "border-red-200 bg-red-50 text-red-950",
    };

    const paddings: Record<NonNullable<CardProps["padding"]>, string> = {
      none: "p-0",
      sm: "p-4",
      md: "p-5 sm:p-6",
      lg: "p-6 sm:p-8",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border",
          tones[tone],
          paddings[padding],
          className,
        )}
        {...props}
      />
    );
  },
);

Card.displayName = "Card";
