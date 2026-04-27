import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
};

export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Delete",
  onCancel,
  onConfirm,
  loading = false
}: Props) {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const el = dialogRef.current;
    const focusable = el?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable?.[0];
    const last = focusable?.[focusable.length - 1];
    first?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onCancel();
        return;
      }
      if (e.key === "Tab" && focusable && focusable.length) {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          (last as HTMLElement)?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          (first as HTMLElement)?.focus();
        }
      }
    }

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/45 grid place-items-center z-[9999]"
      onMouseDown={onCancel}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onMouseDown={(e) => e.stopPropagation()}
        className="panel w-[min(680px,92%)] p-5"
      >
        <h2 id="confirm-title">{title}</h2>
        {description ? <p>{description}</p> : null}
        <div className="flex justify-end gap-3 mt-4">
          <button className="ghost" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button
            onClick={() => onConfirm()}
            disabled={loading}
            className="bg-brick text-cream rounded-xl py-[0.6rem] px-4 font-extrabold border-0"
          >
            {loading ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
