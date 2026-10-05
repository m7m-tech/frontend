import React, { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const Modal = ({ open, onClose, title, description, children, footer, width = "max-w-lg" }) => {
  const titleId = useId();
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Depends on `open` only — callers pass inline onClose handlers, and
  // re-running this on every render would yank focus back to the first field.
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const onKey = (e) => e.key === "Escape" && onCloseRef.current();
    document.addEventListener("keydown", onKey);
    const panel = panelRef.current;
    (panel?.querySelector("input, select, textarea") || panel?.querySelector("button"))?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/30 p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative flex max-h-[92dvh] w-full ${width} flex-col rounded-t-[22px] bg-white shadow-2xl sm:rounded-[22px]`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div>
            <h2 id={titleId} className="text-lg font-medium text-black">
              {title}
            </h2>
            {description && <p className="mt-0.5 text-[13px] text-gray">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-full text-gray hover:bg-canvas hover:text-black"
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-line px-6 py-4">{footer}</div>}
      </div>
    </div>,
    document.body
  );
};

export default Modal;

export const Field = ({ label, error, hint, children }) => (
  <label className="block space-y-1.5">
    <span className="block text-[13px] font-medium text-black">{label}</span>
    {children}
    {error ? <span className="block text-xs text-alert">{error}</span> : hint && <span className="block text-xs text-gray">{hint}</span>}
  </label>
);

export const inputClass =
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-black outline-none transition placeholder:text-black/35 focus:border-brand focus:ring-2 focus:ring-brand/20";
