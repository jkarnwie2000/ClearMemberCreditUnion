import type { Notification } from "@/types";

/** Synthetic notifications shown in the notification panel. */
export const notifications: Notification[] = [
  {
    id: "ntf-01",
    kind: "transaction-posted",
    title: "A transaction has posted",
    message: "Your $86.43 purchase at FreshMart Grocery #118 has posted to Everyday Checking.",
    createdAt: "2026-11-08T09:15:00",
    read: false,
    href: "/activity?txn=txn-1005",
  },
  {
    id: "ntf-02",
    kind: "transfer-processing",
    title: "A transfer is processing",
    message: "Your $250.00 transfer to Riverbend Bank ****5530 is processing.",
    createdAt: "2026-11-07T14:02:00",
    read: false,
    href: "/activity?txn=txn-1006",
  },
  {
    id: "ntf-03",
    kind: "statement",
    title: "Your monthly statement is available",
    message: "Your October statements for all three accounts are ready to view.",
    createdAt: "2026-11-01T06:00:00",
    read: false,
    href: "/accounts",
  },
  {
    id: "ntf-04",
    kind: "transfer-delayed",
    title: "An incoming transfer is delayed",
    message: "Your $400.00 transfer from Summit Federal ****2207 is taking longer than usual.",
    createdAt: "2026-11-04T11:30:00",
    read: true,
    href: "/activity?txn=txn-1018",
  },
];
