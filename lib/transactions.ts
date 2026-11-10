import { transactionStatusMeta, transactionTypeLabels } from "@/lib/labels";
import { normalizeText } from "@/lib/utils";
import type { Transaction, TransactionCategory, TransactionStatus, TransactionType } from "@/types";

export interface TransactionFilters {
  query: string;
  accountId: string;
  status: TransactionStatus | "all";
  type: TransactionType | "all";
  category: TransactionCategory | "all";
  /** Inclusive start date, YYYY-MM-DD, or empty for no limit. */
  dateFrom: string;
  /** Inclusive end date, YYYY-MM-DD, or empty for no limit. */
  dateTo: string;
  /** Minimum absolute amount, as typed by the member. Empty for no limit. */
  amountMin: string;
  /** Maximum absolute amount, as typed by the member. Empty for no limit. */
  amountMax: string;
}

export type SortOption = "newest" | "oldest" | "highest" | "lowest";

export const sortOptionLabels: Record<SortOption, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  highest: "Highest amount",
  lowest: "Lowest amount",
};

export const defaultFilters: TransactionFilters = {
  query: "",
  accountId: "all",
  status: "all",
  type: "all",
  category: "all",
  dateFrom: "",
  dateTo: "",
  amountMin: "",
  amountMax: "",
};

const AMOUNT_TOKEN = /^\$?\d[\d,]*(\.\d{0,2})?$/;

function parseAmountInput(value: string): number | null {
  const cleaned = value.replace(/[$,\s]/g, "");
  if (cleaned === "") return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function buildSearchText(transaction: Transaction): string {
  return normalizeText(
    [
      transaction.merchantName,
      transaction.descriptor,
      transaction.description,
      transaction.category,
      transaction.reference,
      transactionTypeLabels[transaction.type].singular,
      transactionStatusMeta[transaction.status].label,
      transaction.unfamiliarMerchant?.possibleBusiness ?? "",
    ].join(" "),
  );
}

function tokenMatches(transaction: Transaction, searchText: string, token: string): boolean {
  if (AMOUNT_TOKEN.test(token)) {
    const typed = token.replace(/[$,]/g, "");
    const amountText = Math.abs(transaction.amount).toFixed(2);
    if (amountText.startsWith(typed)) return true;
    // Longer digit strings may be part of a reference number.
    if (typed.length >= 4 && normalizeText(transaction.reference).includes(typed)) return true;
    return false;
  }
  return searchText.includes(token);
}

/**
 * Keyword search across merchant name, descriptor, description, category,
 * reference, and amount. Every word in the query must match.
 */
export function matchesQuery(transaction: Transaction, query: string): boolean {
  const tokens = normalizeText(query).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;
  const searchText = buildSearchText(transaction);
  return tokens.every((token) => tokenMatches(transaction, searchText, token));
}

export function filterTransactions(transactions: Transaction[], filters: TransactionFilters): Transaction[] {
  const amountMin = parseAmountInput(filters.amountMin);
  const amountMax = parseAmountInput(filters.amountMax);

  return transactions.filter((transaction) => {
    if (filters.accountId !== "all" && transaction.accountId !== filters.accountId) return false;
    if (filters.status !== "all" && transaction.status !== filters.status) return false;
    if (filters.type !== "all" && transaction.type !== filters.type) return false;
    if (filters.category !== "all" && transaction.category !== filters.category) return false;
    if (filters.dateFrom && transaction.transactionDate < filters.dateFrom) return false;
    if (filters.dateTo && transaction.transactionDate > filters.dateTo) return false;
    const absoluteAmount = Math.abs(transaction.amount);
    if (amountMin !== null && absoluteAmount < amountMin) return false;
    if (amountMax !== null && absoluteAmount > amountMax) return false;
    return matchesQuery(transaction, filters.query);
  });
}

export function sortTransactions(transactions: Transaction[], sort: SortOption): Transaction[] {
  const sorted = [...transactions];
  // Ties fall back to the record ID so the order is always stable.
  const byIdDesc = (a: Transaction, b: Transaction) => b.id.localeCompare(a.id);
  switch (sort) {
    case "newest":
      return sorted.sort((a, b) => b.transactionDate.localeCompare(a.transactionDate) || byIdDesc(a, b));
    case "oldest":
      return sorted.sort((a, b) => a.transactionDate.localeCompare(b.transactionDate) || byIdDesc(b, a));
    case "highest":
      return sorted.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount) || byIdDesc(a, b));
    case "lowest":
      return sorted.sort((a, b) => Math.abs(a.amount) - Math.abs(b.amount) || byIdDesc(a, b));
  }
}

const FILTER_KEYS: Array<keyof TransactionFilters> = [
  "accountId",
  "status",
  "type",
  "category",
  "dateFrom",
  "dateTo",
  "amountMin",
  "amountMax",
];

/** Number of filters (excluding the search query) that differ from the defaults. */
export function countActiveFilters(filters: TransactionFilters): number {
  return FILTER_KEYS.filter((key) => filters[key] !== defaultFilters[key]).length;
}

export function hasActiveCriteria(filters: TransactionFilters): boolean {
  return filters.query.trim() !== "" || countActiveFilters(filters) > 0;
}

/** Plain-language problems with the amount or date range, if any. */
export function getFilterRangeIssues(filters: TransactionFilters): string[] {
  const issues: string[] = [];
  const amountMin = parseAmountInput(filters.amountMin);
  const amountMax = parseAmountInput(filters.amountMax);
  if (filters.amountMin.trim() && amountMin === null) issues.push("Minimum amount must be a number.");
  if (filters.amountMax.trim() && amountMax === null) issues.push("Maximum amount must be a number.");
  if (amountMin !== null && amountMax !== null && amountMin > amountMax) {
    issues.push("The minimum amount is greater than the maximum amount.");
  }
  if (filters.dateFrom && filters.dateTo && filters.dateFrom > filters.dateTo) {
    issues.push("The start date is after the end date.");
  }
  return issues;
}

export function getTransactionById(transactions: Transaction[], id: string): Transaction | undefined {
  return transactions.find((transaction) => transaction.id === id);
}
