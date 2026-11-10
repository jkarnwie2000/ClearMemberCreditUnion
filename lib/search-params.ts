import { accounts } from "@/data/accounts";
import { transactionCategories, transactionStatusOrder, transactionTypeOrder } from "@/lib/labels";
import type { TransactionFilters } from "@/lib/transactions";
import type { TransactionCategory, TransactionStatus, TransactionType } from "@/types";

export type RawSearchParams = Record<string, string | string[] | undefined>;

export function firstParam(params: RawSearchParams, key: string): string | undefined {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Turn URL query parameters into safe, validated activity filters. Unknown values are ignored. */
export function parseActivityParams(params: RawSearchParams): {
  filters: Partial<TransactionFilters>;
  selectedId?: string;
} {
  const filters: Partial<TransactionFilters> = {};
  const query = firstParam(params, "q");
  if (query) filters.query = query.slice(0, 100);

  const account = firstParam(params, "account");
  if (account && accounts.some((item) => item.id === account)) filters.accountId = account;

  const status = firstParam(params, "status");
  if (status && (transactionStatusOrder as string[]).includes(status)) filters.status = status as TransactionStatus;

  const type = firstParam(params, "type");
  if (type && (transactionTypeOrder as string[]).includes(type)) filters.type = type as TransactionType;

  const category = firstParam(params, "category");
  if (category && (transactionCategories as string[]).includes(category)) {
    filters.category = category as TransactionCategory;
  }

  const from = firstParam(params, "from");
  if (from && DATE_PATTERN.test(from)) filters.dateFrom = from;
  const to = firstParam(params, "to");
  if (to && DATE_PATTERN.test(to)) filters.dateTo = to;

  const selectedId = firstParam(params, "txn");
  return { filters, selectedId: selectedId && /^txn-\d+$/.test(selectedId) ? selectedId : undefined };
}
