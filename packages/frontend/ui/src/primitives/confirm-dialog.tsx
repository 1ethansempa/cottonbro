"use client";

import * as React from "react";
import { Button } from "./button";
import { Modal } from "./modal";

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  eyebrow?: string;
  description: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  confirming?: boolean;
  tone?: "default" | "danger";
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
};

export function ConfirmDialog({
  open,
  title,
  eyebrow,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  confirming = false,
  tone = "default",
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      title={title}
      eyebrow={eyebrow}
      tone={tone}
      onClose={onCancel}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={confirming}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            disabled={confirming}
          >
            {confirming ? "Working..." : confirmLabel}
          </Button>
        </>
      }
    >
      <div className="text-xs font-medium leading-relaxed text-gray-600">
        {description}
      </div>
    </Modal>
  );
}
