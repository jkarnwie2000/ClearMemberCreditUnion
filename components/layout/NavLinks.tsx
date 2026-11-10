"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { isNavItemActive, navItems } from "./navigation";

interface NavLinksProps {
  tone: "dark" | "light";
  onNavigate?: () => void;
}

export function NavLinks({ tone, onNavigate }: NavLinksProps) {
  const pathname = usePathname() ?? "/";

  return (
    <ul className="flex flex-col gap-1">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = isNavItemActive(pathname, href);
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-xl px-3 text-[0.9375rem] font-medium transition-colors",
                tone === "dark"
                  ? active
                    ? "bg-brand text-white shadow-[inset_3px_0_0_var(--color-accent-on-dark)]"
                    : "text-slate-200 hover:bg-white/10 hover:text-white"
                  : active
                    ? "bg-brand-50 text-brand-dark shadow-[inset_3px_0_0_var(--color-brand)]"
                    : "text-ink hover:bg-canvas",
              )}
            >
              <Icon aria-hidden="true" className="size-5 shrink-0" />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
