/**
 * Shared domain types for the ClearMember demo.
 * All data that uses these types is synthetic.
 */

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  memberSince: string; // ISO date
  email: string;
  phone: string;
  preferredName: string;
}

export type AccountType = "checking" | "savings";

export interface AccountFeeTerms {
  monthlyMaintenanceFee?: number;
  maintenanceFeeWaiver?: string;
  overdraftFee?: number;
  nonNetworkAtmFee?: number;
  returnedPaymentFee?: number;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  /** Masked number, e.g. "****4821". Never a full account number. */
  maskedNumber: string;
  currentBalance: number;
  availableBalance: number;
  /** Annual percentage yield expressed as a percentage, e.g. 3.75 */
  dividendRate?: number;
  openedDate: string;
  description: string;
  statementCycle: string;
  feeTerms?: AccountFeeTerms;
  goal?: { label: string; targetAmount: number; targetDate: string };
}

export type TransactionStatus = "posted" | "pending" | "processing" | "reversed";

export type TransactionType = "deposit" | "withdrawal" | "purchase" | "transfer" | "fee";

export type TransactionCategory =
  | "Groceries"
  | "Gas & Fuel"
  | "Dining"
  | "Subscriptions"
  | "Shopping"
  | "Travel"
  | "Utilities"
  | "Health & Fitness"
  | "Home"
  | "Cash & ATM"
  | "Income"
  | "Dividends"
  | "Transfers"
  | "Fees";

export type HoldKind = "fuel" | "hotel" | "restaurant" | "car-rental";

export interface TransactionHold {
  kind: HoldKind;
  authorizedAmount: number;
  /** Set when the hold was released and replaced by a final charge. */
  releasedOn?: string;
}

export type TransferDirection = "internal" | "external";

export type TransferStage = "initiated" | "processing" | "completed" | "delayed";

export interface TransferTimelineEvent {
  stage: TransferStage;
  date: string;
  note: string;
}

export interface TransferDetails {
  direction: TransferDirection;
  flow: "incoming" | "outgoing";
  stage: TransferStage;
  counterparty: string;
  timeline: TransferTimelineEvent[];
}

export type FeeType = "monthly-maintenance" | "overdraft" | "atm" | "returned-payment";

export type DescriptorReason =
  | "payment-processor"
  | "parent-company"
  | "shortened-name"
  | "billing-location"
  | "online-descriptor";

export interface UnfamiliarMerchantDetails {
  reason: DescriptorReason;
  /** A synthetic hint about the business this descriptor may belong to. */
  possibleBusiness?: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  /** Friendly name shown first in lists. */
  merchantName: string;
  /** The raw descriptor as it would appear on a statement. */
  descriptor: string;
  description: string;
  /** Signed amount. Negative values are money leaving the account. */
  amount: number;
  transactionDate: string;
  postedDate?: string;
  status: TransactionStatus;
  type: TransactionType;
  category: TransactionCategory;
  reference: string;
  hold?: TransactionHold;
  transfer?: TransferDetails;
  feeType?: FeeType;
  unfamiliarMerchant?: UnfamiliarMerchantDetails;
  relatedTransactionIds?: string[];
}

export type ExplanationKind =
  | "pending"
  | "hold"
  | "transfer"
  | "fee"
  | "unfamiliar-merchant"
  | "reversed"
  | "deposit"
  | "posted";

export interface TransactionExplanation {
  kind: ExplanationKind;
  headline: string;
  whatHappened: string;
  whyItMightHaveHappened: string[];
  whatItMeans: string;
  whatToDoNext: string[];
  /** Optional safety note, e.g. for possibly unauthorized activity. */
  securityNote?: string;
  relatedArticleSlugs: string[];
  suggestedSupportTopic: SupportTopic;
}

export type ArticleCategory =
  | "Account Management"
  | "Debit Cards"
  | "Transfers and Payments"
  | "Fees and Charges"
  | "Security";

export interface SupportArticle {
  slug: string;
  title: string;
  category: ArticleCategory;
  summary: string;
  body: string[];
  nextSteps: string[];
  relatedSlugs: string[];
  keywords: string[];
}

export type SupportTopic =
  | "transaction-question"
  | "pending-transaction"
  | "account-fee"
  | "transfer-delay"
  | "debit-card-issue"
  | "unrecognized-merchant"
  | "account-access"
  | "general-inquiry";

export type SupportRequestStatus = "submitted" | "in-review" | "resolved";

export interface SupportRequest {
  referenceNumber: string;
  subject: string;
  topic: SupportTopic;
  submittedOn: string;
  status: SupportRequestStatus;
  accountId?: string;
  transactionId?: string;
  lastUpdate: string;
}

export type NotificationKind = "transaction-posted" | "transfer-processing" | "statement" | "transfer-delayed";

export interface Notification {
  id: string;
  kind: NotificationKind;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  href: string;
}
