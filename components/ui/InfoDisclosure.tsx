"use client";

import { ChevronDown, Info } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface InfoDisclosureProps {
  label: string;
  children: ReactNode;
  className?: string;
  defaultOpen?: boolean;
}

/** A small, keyboard-accessible "What does this mean?" toggle. */
export function InfoDisclosure({ label, children, className, defaultOpen = false }: InfoDisclosureProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className={className}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-1 text-sm font-semibold text-brand hover:text-brand-dark hover:underline"
      >
        <Info aria-hidden="true" className="size-4" />
        {label}
        <ChevronDown aria-hidden="true" className={cn("size-4 transition-transform", open && "rotate-180")} />
      </button>
      <div id={panelId} hidden={!open} className="mt-2 rounded-xl bg-brand-50 p-3 text-sm leading-relaxed text-ink">
        {children}
      </div>
    </div>
  );
}
