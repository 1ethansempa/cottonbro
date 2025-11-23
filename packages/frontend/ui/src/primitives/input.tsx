import * as React from "react";
import { cn } from "../lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className = "", ...props }, ref) => {
        return (
            <input
                ref={ref}
                suppressHydrationWarning
                className={cn(
                    "w-full border-2 border-black bg-white px-4 py-4 text-base font-medium text-black placeholder:text-zinc-400 outline-none focus:border-street-red transition-colors rounded-none",
                    className
                )}
                {...props}
            />
        );
    }
);

Input.displayName = "Input";
