import type { SupportRequest } from "@/types";

/** Synthetic support request history. These are demonstration records only. */
export const supportRequests: SupportRequest[] = [
  {
    referenceNumber: "CM-SR-20261109-4821",
    subject: "Hotel hold on my debit card",
    topic: "pending-transaction",
    submittedOn: "2026-11-09",
    status: "submitted",
    accountId: "acc-checking",
    transactionId: "txn-1002",
    lastUpdate: "We received your request. A member service representative will review it.",
  },
  {
    referenceNumber: "CM-SR-20261103-2207",
    subject: "Transfer from Summit Federal hasn't arrived",
    topic: "transfer-delay",
    submittedOn: "2026-11-03",
    status: "in-review",
    accountId: "acc-checking",
    transactionId: "txn-1018",
    lastUpdate: "We're reviewing the transfer with the sending institution.",
  },
  {
    referenceNumber: "CM-SR-20261030-1185",
    subject: "Returned payment fee on October 28",
    topic: "account-fee",
    submittedOn: "2026-10-30",
    status: "resolved",
    accountId: "acc-checking",
    transactionId: "txn-1021",
    lastUpdate: "We explained the fee and the returned Cityline Fitness payment by secure message.",
  },
];
