import { FlaskConical } from "lucide-react";
import type { ReactNode } from "react";

/** A consistent note reminding visitors that records are synthetic. */
export function DemoNotice({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-xl border border-teal/30 bg-teal-50 px-3 py-2.5 text-sm leading-relaxed text-teal-text">
      <FlaskConical aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
