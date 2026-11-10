"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  side?: "left" | "right";
  children: ReactNode;
  widthClassName?: string;
  /** Changing this value moves focus back to the top of the sheet (e.g. when showing a different record). */
  contentKey?: string;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessible slide-over dialog.
 * - Moves focus into the dialog when it opens and returns it on close.
 * - Keeps Tab/Shift+Tab focus inside the dialog.
 * - Closes on Escape or when the backdrop is clicked.
 */
export function Sheet({
  open,
  onClose,
  title,
  description,
  side = "right",
  children,
  widthClassName = "max-w-xl",
  contentKey,
}: SheetProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Focus management, keyboard handling, and scroll locking while open.
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    headingRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => !element.hasAttribute("hidden") && element.closest("[hidden]") === null,
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === headingRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused && document.contains(previouslyFocused)) previouslyFocused.focus();
    };
  }, [open]);

  // When the content changes while open, start reading from the top again.
  useEffect(() => {
    if (open && contentKey) {
      panelRef.current?.querySelector("[data-sheet-body]")?.scrollTo?.({ top: 0 });
      headingRef.current?.focus();
    }
  }, [contentKey, open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-navy/40" aria-hidden="true" onClick={onClose} data-testid="sheet-backdrop" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          "relative flex h-full w-full flex-col bg-white shadow-raised",
          widthClassName,
          side === "right" ? "ml-auto" : "mr-auto",
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 ref={headingRef} id={titleId} tabIndex={-1} className="text-lg font-semibold text-navy focus:outline-none">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-0.5 text-sm text-muted">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 flex size-10 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-canvas hover:text-ink"
            aria-label="Close"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>
        <div data-sheet-body className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
