import type {
  FeeType,
  SupportRequestStatus,
  SupportTopic,
  TransactionCategory,
  TransactionStatus,
  TransactionType,
  TransferStage,
} from "@/types";

export const transactionStatusMeta: Record<TransactionStatus, { label: string; description: string }> = {
  posted: { label: "Posted", description: "This transaction has fully posted to your account." },
  pending: {
    label: "Pending",
    description: "Approved but not final yet. It lowers your available balance and may still change.",
  },
  processing: {
    label: "Processing",
    description: "This transaction is moving through processing and hasn't completed yet.",
  },
  reversed: {
    label: "Reversed",
    description: "This transaction was canceled or returned and did not reduce your balance.",
  },
};

export const transactionStatusOrder: TransactionStatus[] = ["posted", "pending", "processing", "reversed"];

export const transactionTypeLabels: Record<TransactionType, { singular: string; plural: string }> = {
  deposit: { singular: "Deposit", plural: "Deposits" },
  withdrawal: { singular: "Withdrawal", plural: "Withdrawals" },
  purchase: { singular: "Purchase", plural: "Purchases" },
  transfer: { singular: "Transfer", plural: "Transfers" },
  fee: { singular: "Fee", plural: "Fees" },
};

export const transactionTypeOrder: TransactionType[] = ["deposit", "withdrawal", "purchase", "transfer", "fee"];

export const transactionCategories: TransactionCategory[] = [
  "Cash & ATM",
  "Dining",
  "Dividends",
  "Fees",
  "Gas & Fuel",
  "Groceries",
  "Health & Fitness",
  "Home",
  "Income",
  "Shopping",
  "Subscriptions",
  "Transfers",
  "Travel",
  "Utilities",
];

export const transferStageMeta: Record<TransferStage, { label: string; description: string }> = {
  initiated: { label: "Initiated", description: "The transfer was requested." },
  processing: { label: "Processing", description: "The transfer is moving through processing." },
  completed: { label: "Completed", description: "The money has arrived." },
  delayed: { label: "Delayed", description: "The transfer is taking longer than usual." },
};

export const feeTypeLabels: Record<FeeType, string> = {
  "monthly-maintenance": "Monthly maintenance fee",
  overdraft: "Overdraft fee",
  atm: "ATM fee",
  "returned-payment": "Returned payment fee",
};

export const supportTopicMeta: Record<SupportTopic, { label: string; description: string }> = {
  "transaction-question": {
    label: "Transaction question",
    description: "Ask about a specific posted transaction.",
  },
  "pending-transaction": {
    label: "Pending transaction",
    description: "A pending charge or hold that hasn't posted or dropped off.",
  },
  "account-fee": { label: "Account fee", description: "Questions about a fee on your account." },
  "transfer-delay": { label: "Transfer delay", description: "A transfer that hasn't arrived or completed." },
  "debit-card-issue": {
    label: "Debit card issue",
    description: "A declined, damaged, or not-yet-received card.",
  },
  "unrecognized-merchant": {
    label: "Unrecognized merchant",
    description: "A merchant name you don't recognize.",
  },
  "account-access": { label: "Account access", description: "Trouble signing in or using online banking." },
  "general-inquiry": { label: "General inquiry", description: "Anything else we can help with." },
};

export const supportTopicOrder: SupportTopic[] = [
  "transaction-question",
  "pending-transaction",
  "account-fee",
  "transfer-delay",
  "debit-card-issue",
  "unrecognized-merchant",
  "account-access",
  "general-inquiry",
];

export const supportRequestStatusMeta: Record<SupportRequestStatus, { label: string; description: string }> = {
  submitted: { label: "Submitted", description: "Received and waiting for review." },
  "in-review": { label: "In Review", description: "A representative is working on it." },
  resolved: { label: "Resolved", description: "This request has been answered." },
};
