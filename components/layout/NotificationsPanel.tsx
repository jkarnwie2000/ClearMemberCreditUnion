"use client";

import { ArrowLeftRight, CircleAlert, CircleCheck, FileText } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Sheet } from "@/components/ui/Sheet";
import { formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { NotificationKind } from "@/types";
import { useNotifications } from "./NotificationsProvider";

const kindIcons: Record<NotificationKind, { icon: LucideIcon; className: string }> = {
  "transaction-posted": { icon: CircleCheck, className: "bg-success-50 text-success-text" },
  "transfer-processing": { icon: ArrowLeftRight, className: "bg-brand-50 text-brand" },
  statement: { icon: FileText, className: "bg-teal-50 text-teal-text" },
  "transfer-delayed": { icon: CircleAlert, className: "bg-error-50 text-error-text" },
};

export function NotificationsPanel() {
  const { notifications, unreadCount, isPanelOpen, closePanel, markRead, markAllRead } = useNotifications();

  return (
    <Sheet
      open={isPanelOpen}
      onClose={closePanel}
      title="Notifications"
      description={unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up."}
      widthClassName="max-w-md"
    >
      <div className="flex items-center justify-between px-5 py-3 sm:px-6">
        <p className="text-xs text-muted">Demonstration notifications only.</p>
        <button
          type="button"
          onClick={markAllRead}
          disabled={unreadCount === 0}
          className="min-h-9 rounded-lg px-2 text-sm font-semibold text-brand hover:bg-brand-50 disabled:cursor-not-allowed disabled:text-muted disabled:hover:bg-transparent"
        >
          Mark all as read
        </button>
      </div>
      <ul className="divide-y divide-line border-t border-line">
        {notifications.map((notification) => {
          const { icon: Icon, className } = kindIcons[notification.kind];
          return (
            <li key={notification.id}>
              <Link
                href={notification.href}
                onClick={() => {
                  markRead(notification.id);
                  closePanel();
                }}
                className={cn(
                  "flex gap-3 px-5 py-4 hover:bg-canvas sm:px-6",
                  !notification.read && "bg-brand-50/40",
                )}
              >
                <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", className)}>
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="font-semibold text-ink">{notification.title}</span>
                    {!notification.read ? (
                      <span className="rounded-full bg-brand px-1.5 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wide text-white">
                        New
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block text-sm leading-relaxed text-muted">{notification.message}</span>
                  <span className="mt-1 block text-xs text-muted">{formatDateTime(notification.createdAt)}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Sheet>
  );
}
