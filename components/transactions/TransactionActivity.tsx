"use client";

import { SearchX, Search, SlidersHorizontal, X } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { accounts } from "@/data/accounts";
import { transactions as allTransactions } from "@/data/transactions";
import { transactionStatusMeta, transactionTypeLabels } from "@/lib/labels";
import {
  countActiveFilters,
  defaultFilters,
  filterTransactions,
  getFilterRangeIssues,
  hasActiveCriteria,
  sortOptionLabels,
  sortTransactions,
  type SortOption,
  type TransactionFilters,
} from "@/lib/transactions";
import { cn, formatDate, pluralize } from "@/lib/utils";
import type { Transaction } from "@/types";
import { TransactionDetailPanel } from "./TransactionDetailPanel";
import { TransactionFiltersPanel } from "./TransactionFiltersPanel";
import { TransactionList } from "./TransactionList";

interface TransactionActivityProps {
  transactions?: Transaction[];
  initialFilters?: Partial<TransactionFilters>;
  initialSort?: SortOption;
  initialSelectedId?: string;
}

function describeFilter(key: keyof TransactionFilters, filters: TransactionFilters): string {
  switch (key) {
    case "accountId":
      return accounts.find((account) => account.id === filters.accountId)?.name ?? "Account";
    case "status":
      return filters.status === "all" ? "" : `Status: ${transactionStatusMeta[filters.status].label}`;
    case "type":
      return filters.type === "all" ? "" : `Type: ${transactionTypeLabels[filters.type].plural}`;
    case "category":
      return `Category: ${filters.category}`;
    case "dateFrom":
      return `From ${formatDate(filters.dateFrom)}`;
    case "dateTo":
      return `To ${formatDate(filters.dateTo)}`;
    case "amountMin":
      return `Min $${filters.amountMin}`;
    case "amountMax":
      return `Max $${filters.amountMax}`;
    default:
      return "";
  }
}

const CHIP_KEYS: Array<keyof TransactionFilters> = [
  "accountId",
  "status",
  "type",
  "category",
  "dateFrom",
  "dateTo",
  "amountMin",
  "amountMax",
];

export function TransactionActivity({
  transactions = allTransactions,
  initialFilters,
  initialSort = "newest",
  initialSelectedId,
}: TransactionActivityProps) {
  const [filters, setFilters] = useState<TransactionFilters>({ ...defaultFilters, ...initialFilters });
  const [sort, setSort] = useState<SortOption>(initialSort);
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<Transaction | null>(
    () => transactions.find((transaction) => transaction.id === initialSelectedId) ?? null,
  );

  const searchId = useId();
  const sortId = useId();
  const filtersPanelId = useId();

  const rangeIssues = useMemo(() => getFilterRangeIssues(filters), [filters]);
  const results = useMemo(
    () => sortTransactions(filterTransactions(transactions, filters), sort),
    [transactions, filters, sort],
  );
  const activeFilterCount = countActiveFilters(filters);
  const isFiltered = hasActiveCriteria(filters);

  function updateFilter<K extends keyof TransactionFilters>(key: K, value: TransactionFilters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function clearAll() {
    setFilters(defaultFilters);
  }

  const activeChips = CHIP_KEYS.filter((key) => filters[key] !== defaultFilters[key]);

  return (
    <div className="grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
      {/* Filters column */}
      <div className="lg:order-1">
        <Button
          variant="secondary"
          className="w-full lg:hidden"
          aria-expanded={showFilters}
          aria-controls={filtersPanelId}
          onClick={() => setShowFilters((value) => !value)}
        >
          <SlidersHorizontal aria-hidden="true" className="size-4" />
          {showFilters ? "Hide filters" : "Show filters"}
          {activeFilterCount > 0 ? ` (${activeFilterCount} active)` : ""}
        </Button>
        <section
          id={filtersPanelId}
          aria-labelledby={`${filtersPanelId}-heading`}
          className={cn("card mt-3 p-4 lg:sticky lg:top-24 lg:mt-0 lg:block", showFilters ? "block" : "hidden")}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 id={`${filtersPanelId}-heading`} className="font-semibold text-navy">
              Filters
            </h2>
            <button
              type="button"
              onClick={clearAll}
              disabled={!isFiltered}
              className="min-h-9 rounded-lg px-2 text-sm font-semibold text-brand hover:bg-brand-50 disabled:cursor-not-allowed disabled:text-muted disabled:hover:bg-transparent"
            >
              Clear all filters
            </button>
          </div>
          <TransactionFiltersPanel filters={filters} onChange={updateFilter} rangeIssues={rangeIssues} />
        </section>
      </div>

      {/* Results column */}
      <div className="min-w-0 lg:order-2">
        <div className="card p-4">
          <label htmlFor={searchId} className="mb-1 block text-sm font-semibold text-ink">
            Search transactions
          </label>
          <div className="relative">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted" />
            <input
              id={searchId}
              type="search"
              value={filters.query}
              onChange={(event) => updateFilter("query", event.target.value)}
              placeholder="Merchant, amount, category, or reference"
              aria-describedby={`${searchId}-hint`}
              autoComplete="off"
              className="input pl-10"
            />
          </div>
          <p id={`${searchId}-hint`} className="mt-1.5 text-xs text-muted">
            Try &ldquo;FreshMart&rdquo;, &ldquo;86.43&rdquo;, &ldquo;Fees&rdquo;, or a reference like &ldquo;CM2611070114&rdquo;.
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p aria-live="polite" aria-atomic="true" className="text-sm text-muted">
            <span className="font-semibold text-ink">
              Showing {results.length} of {pluralize(transactions.length, "transaction")}
            </span>
            {isFiltered ? " matching your search and filters" : ""}
          </p>
          <div className="flex items-center gap-2">
            <label htmlFor={sortId} className="whitespace-nowrap text-sm font-semibold text-ink">
              Sort by
            </label>
            <select id={sortId} value={sort} onChange={(event) => setSort(event.target.value as SortOption)} className="input w-auto">
              {(Object.keys(sortOptionLabels) as SortOption[]).map((option) => (
                <option key={option} value={option}>
                  {sortOptionLabels[option]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {activeChips.length > 0 ? (
          <ul aria-label="Active filters" className="mt-3 flex flex-wrap gap-2">
            {activeChips.map((key) => {
              const text = describeFilter(key, filters);
              return (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => updateFilter(key, defaultFilters[key])}
                    className="inline-flex min-h-8 items-center gap-1 rounded-full border border-brand/30 bg-brand-50 px-3 text-sm font-medium text-brand-dark hover:bg-brand-100"
                    aria-label={`Remove filter: ${text}`}
                  >
                    {text}
                    <X aria-hidden="true" className="size-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}

        <section aria-label="Transaction results" className="card mt-4 overflow-hidden">
          {results.length > 0 ? (
            <TransactionList transactions={results} onSelect={setSelected} label="Transactions" />
          ) : (
            <EmptyState
              icon={SearchX}
              title={
                filters.query.trim()
                  ? `No transactions match “${filters.query.trim()}”`
                  : "No transactions match these filters"
              }
              description={
                <>
                  <p>Try a different spelling, a shorter search, or fewer filters.</p>
                  <p className="mt-2">
                    Merchant names on your account can look different from store signs. Searching by amount (for
                    example, &ldquo;42.00&rdquo;) often helps.
                  </p>
                </>
              }
              actions={
                <>
                  {filters.query ? (
                    <Button variant="secondary" onClick={() => updateFilter("query", "")}>
                      Clear search
                    </Button>
                  ) : null}
                  <Button onClick={clearAll}>Clear all filters</Button>
                </>
              }
            />
          )}
        </section>
      </div>

      <TransactionDetailPanel
        transaction={selected}
        onClose={() => setSelected(null)}
        onSelectTransaction={setSelected}
        transactions={transactions}
      />
    </div>
  );
}
