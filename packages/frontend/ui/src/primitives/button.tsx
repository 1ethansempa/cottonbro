import * as React from "react";
import { cn } from "../lib/utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline";
};

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  className = "",
  ...props
}) => {
  const base =
    "inline-flex flex-row items-center justify-center gap-2 whitespace-nowrap px-6 py-4 text-sm font-bold uppercase tracking-widest transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-black disabled:opacity-60 disabled:cursor-not-allowed";

  let variantStyles = "";
  switch (variant) {
    case "primary":
      variantStyles = "bg-black border-2 border-black text-white hover:bg-white hover:text-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]";
      break;
    case "outline":
      variantStyles = "bg-white border-2 border-black text-black hover:bg-black hover:text-white";
      break;
    case "ghost":
      variantStyles = "bg-transparent border-2 border-black text-black hover:bg-black hover:text-white";
      break;
  }

  return <button className={cn(base, variantStyles, className)} {...props} />;
};

