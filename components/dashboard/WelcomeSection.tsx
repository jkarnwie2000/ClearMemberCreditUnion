"use client";

import { Bell, CalendarDays } from "lucide-react";
import { useNotifications } from "@/components/layout/NotificationsProvider";
import { member } from "@/data/member";
import { useIsClient } from "@/hooks/useIsClient";
import { formatLongDate } from "@/lib/utils";

export function WelcomeSection() {
  const { unreadCount, openPanel } = useNotifications();
  const isClient = useIsClient();

  return (
    <section aria-labelledby="welcome-heading" className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="flex min-h-5 items-center gap-1.5 text-sm font-medium text-teal-text">
          <CalendarDays aria-hidden="true" className="size-4" />
          {/* Today's date comes from the visitor's browser, so it renders after hydration. */}
          <span>{isClient ? formatLongDate(new Date()) : ""}</span>
        </p>
        <h1 id="welcome-heading" className="mt-1 text-2xl font-bold tracking-tight text-navy sm:text-3xl">
          Welcome back, {member.preferredName}.
        </h1>
        <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed text-muted">
          Here&apos;s where your money stands today. Anything pending or on hold is explained in plain language, so
          you always know what&apos;s happening and what to do next.
        </p>
      </div>
      <button
        type="button"
        onClick={openPanel}
        aria-haspopup="dialog"
        className="inline-flex min-h-11 items-center gap-2 self-start rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink shadow-card hover:bg-canvas sm:self-auto"
      >
        <span className="relative">
          <Bell aria-hidden="true" className="size-5 text-brand" />
          {unreadCount > 0 ? (
            <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-error-text ring-2 ring-white" />
          ) : null}
        </span>
        {unreadCount > 0 ? `${unreadCount} new notifications` : "No new notifications"}
      </button>
    </section>
  );
}
