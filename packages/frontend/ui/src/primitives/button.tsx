import * as React from "react";
import { cn } from "../lib/utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", type, ...props }, ref) => {
  const base =
    "inline-flex cursor-pointer flex-row items-center justify-center gap-2 whitespace-nowrap rounded-full border text-center font-bold uppercase tracking-[0.18em] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-black disabled:cursor-not-allowed disabled:opacity-60";

  const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary: "border-black bg-black text-white hover:opacity-80",
    secondary: "border-gray-200 bg-white text-black hover:bg-gray-50",
    outline: "border-black bg-white text-black hover:bg-black hover:text-white",
    ghost: "border-transparent bg-transparent text-black hover:bg-gray-100",
    danger:
      "border-red-600 bg-red-600 text-white hover:bg-white hover:text-red-600",
  };

  const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
    sm: "px-4 py-2 text-[10px]",
    md: "px-6 py-4 text-[10px]",
    lg: "px-8 py-5 text-xs",
  };

    return (
      <button
        ref={ref}
        type={type ?? "button"}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
