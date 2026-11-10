"use client";

import { Bell } from "lucide-react";
import { useNotifications } from "./NotificationsProvider";

export function NotificationBell() {
  const { unreadCount, openPanel } = useNotifications();
  const label = unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications";

  return (
    <button
      type="button"
      onClick={openPanel}
      aria-label={label}
      aria-haspopup="dialog"
      className="relative flex size-11 items-center justify-center rounded-xl text-ink hover:bg-canvas"
    >
      <Bell aria-hidden="true" className="size-5" />
      {unreadCount > 0 ? (
        <span
          aria-hidden="true"
          className="absolute right-1.5 top-1.5 flex min-w-5 items-center justify-center rounded-full bg-error-text px-1 text-[0.6875rem] font-bold leading-5 text-white ring-2 ring-white"
        >
          {unreadCount}
        </span>
      ) : null}
    </button>
  );
}
