"use client";

import { CircleHelp, Menu } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { member } from "@/data/member";
import { Sheet } from "@/components/ui/Sheet";
import { Logo } from "./Logo";
import { NavLinks } from "./NavLinks";
import { NotificationBell } from "./NotificationBell";
import { NotificationsPanel } from "./NotificationsPanel";
import { NotificationsProvider } from "./NotificationsProvider";

function MemberChip() {
  return (
    <span className="flex items-center gap-2">
      <span
        aria-hidden="true"
        className="flex size-9 items-center justify-center rounded-full bg-teal-50 text-sm font-bold text-teal-text"
      >
        {member.firstName[0]}
        {member.lastName[0]}
      </span>
      <span className="hidden text-sm font-medium text-ink sm:block">
        {member.firstName} {member.lastName}
      </span>
    </span>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <NotificationsProvider>
      <nav aria-label="Skip links">
        <a
          href="#main-content"
          className="sr-only z-[60] rounded-lg bg-white px-4 py-2 font-semibold text-brand shadow-raised focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to main content
        </a>
      </nav>

      {/* Desktop sidebar */}
      <aside className="focus-on-dark fixed inset-y-0 left-0 z-30 hidden w-72 flex-col bg-navy px-4 py-6 lg:flex">
        <Link href="/" className="mb-8 rounded-lg px-2">
          <Logo tone="dark" />
        </Link>
        <nav aria-label="Main navigation" className="flex-1">
          <NavLinks tone="dark" />
        </nav>
        <div className="rounded-2xl bg-white/8 p-4 text-sm text-slate-200">
          <p className="flex items-center gap-2 font-semibold text-white">
            <CircleHelp aria-hidden="true" className="size-4" />
            Have a question?
          </p>
          <p className="mt-1 leading-relaxed">
            Most answers are a search away. Our Help Center explains holds, fees, and transfers in plain language.
          </p>
          <Link href="/help" className="mt-3 inline-block font-semibold text-accent-on-dark underline-offset-2 hover:underline">
            Visit the Help Center
          </Link>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
          <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation menu"
              aria-haspopup="dialog"
              className="-ml-2 flex size-11 items-center justify-center rounded-xl text-ink hover:bg-canvas lg:hidden"
            >
              <Menu aria-hidden="true" className="size-6" />
            </button>
            <Link href="/" className="rounded-lg lg:hidden">
              <Logo />
            </Link>
            <p className="hidden text-sm text-muted lg:block">
              <span className="font-semibold text-ink">Demo environment</span> · All accounts and transactions are
              synthetic
            </p>
            <div className="ml-auto flex items-center gap-1 sm:gap-3">
              <NotificationBell />
              <MemberChip />
            </div>
          </div>
        </header>

        <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 focus:outline-none sm:px-6 lg:px-8 lg:py-10">
          {children}
        </main>

        <footer className="border-t border-line bg-white">
          <div className="mx-auto max-w-6xl px-4 py-6 text-sm leading-relaxed text-muted sm:px-6 lg:px-8">
            <p>
              <span className="font-semibold text-ink">ClearMember Credit Union is fictional.</span> This is a
              portfolio demonstration. Every member, account, balance, and transaction is synthetic, and no real
              financial institution, banking API, or payment processor is connected.
            </p>
          </div>
        </footer>
      </div>

      <Sheet open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} title="Menu" side="left" widthClassName="max-w-xs">
        <nav aria-label="Main navigation" className="p-4">
          <NavLinks tone="light" onNavigate={() => setMobileNavOpen(false)} />
        </nav>
      </Sheet>

      <NotificationsPanel />
    </NotificationsProvider>
  );
}
