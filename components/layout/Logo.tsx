import { cn } from "@/lib/utils";

/** ClearMember mark: a simple institution façade inside a rounded tile. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" focusable="false" className={cn("size-10 shrink-0", className)}>
      <rect width="40" height="40" rx="10" fill="#1F5FD6" />
      <path d="M8 15.5 20 8.5l12 7z" fill="#FFFFFF" />
      <rect x="11" y="17.5" width="3.2" height="10" rx="1" fill="#FFFFFF" />
      <rect x="18.4" y="17.5" width="3.2" height="10" rx="1" fill="#FFFFFF" />
      <rect x="25.8" y="17.5" width="3.2" height="10" rx="1" fill="#FFFFFF" />
      <rect x="8" y="29" width="24" height="3" rx="1.5" fill="#5EEAD4" />
    </svg>
  );
}

export function Logo({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className={cn("text-lg font-bold tracking-tight", tone === "dark" ? "text-white" : "text-navy")}>
          ClearMember
        </span>
        <span
          className={cn(
            "mt-1 text-[0.6875rem] font-semibold uppercase tracking-[0.14em]",
            tone === "dark" ? "text-teal-50/85" : "text-teal-text",
          )}
        >
          Credit Union
        </span>
      </span>
    </span>
  );
}
