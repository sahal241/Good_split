"use client";
import { useEffect, useRef } from "react";

interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}: Props) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="bg-[#FFFFFF] rounded-2xl shadow-2xl border border-[#E2D6C8] w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-150">
        <h2
          id="confirm-dialog-title"
          className="text-lg font-bold text-[#1A1A1A] mb-2 tracking-tight"
        >
          {title}
        </h2>
        <p className="text-[#6B7280] text-sm mb-6 leading-relaxed">
          {message}
        </p>
        <div className="flex gap-2.5 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-[#E2D6C8] text-[#1A1A1A] text-sm font-semibold hover:bg-[#FAF5ED] active:scale-[0.98] transition-all"
          >
            Cancel
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-[#C0392B] text-white text-sm font-semibold hover:bg-[#A93226] active:scale-[0.98] transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C0392B]/40"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
