import * as React from "react";
import { cn } from "../lib/utils";

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  tone?: "default" | "danger";
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ tone = "default", className = "", ...props }, ref) => {
    const tones: Record<NonNullable<CardProps["tone"]>, string> = {
      default: "border-gray-200 bg-white",
      danger: "border-red-200 bg-red-50/40",
    };

    return (
      <div
        ref={ref}
        className={cn("rounded-2xl border p-5 sm:p-6 md:p-8", tones[tone], className)}
        {...props}
      />
    );
  },
);

Card.displayName = "Card";
