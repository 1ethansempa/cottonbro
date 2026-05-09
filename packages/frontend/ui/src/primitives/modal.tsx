"use client";

import * as React from "react";
import { cn } from "../lib/utils";

export type ModalProps = {
  open: boolean;
  title: string;
  eyebrow?: string;
  tone?: "default" | "danger";
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClose: () => void;
  closeLabel?: string;
  className?: string;
};

export function Modal({
  open,
  title,
  eyebrow,
  tone = "default",
  children,
  footer,
  onClose,
  closeLabel = "Close",
  className = "",
}: ModalProps) {
  const dialogRef = React.useRef<HTMLDivElement | null>(null);
  const titleId = React.useId();

  React.useEffect(() => {
    if (!open) return;

    const previousActiveElement = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.setTimeout(() => {
      dialogRef.current
        ?.querySelector<HTMLElement>(
          "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
        )
        ?.focus();
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      if (previousActiveElement instanceof HTMLElement) {
        previousActiveElement.focus();
      }
    };
  }, [onClose, open]);

  if (!open) return null;

  const eyebrowClass = tone === "danger" ? "text-red-600" : "text-gray-500";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
      <button
        type="button"
        aria-label={closeLabel}
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "relative w-full max-w-lg overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl shadow-black/10",
          className,
        )}
      >
        <div className="flex items-start justify-between border-b border-gray-200 bg-gray-50 p-5 sm:p-6">
          <div>
            {eyebrow && (
              <p
                className={cn(
                  "text-[10px] font-bold uppercase tracking-[0.2em]",
                  eyebrowClass,
                )}
              >
                {eyebrow}
              </p>
            )}
            <h2
              id={titleId}
              className="mt-1 text-xl font-black uppercase tracking-tight text-black"
            >
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="flex h-7 w-7 items-center justify-center rounded-full text-sm font-black text-gray-400 transition-colors hover:text-black"
          >
            <span aria-hidden="true">X</span>
          </button>
        </div>

        <div className="p-5 sm:p-6">{children}</div>
        {footer && (
          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 p-5 sm:flex-row sm:justify-end sm:p-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
