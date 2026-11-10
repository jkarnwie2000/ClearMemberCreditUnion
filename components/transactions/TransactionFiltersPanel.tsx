"use client";

import { useId } from "react";
import { accounts } from "@/data/accounts";
import {
  transactionCategories,
  transactionStatusMeta,
  transactionStatusOrder,
  transactionTypeLabels,
  transactionTypeOrder,
} from "@/lib/labels";
import type { TransactionFilters } from "@/lib/transactions";

interface TransactionFiltersPanelProps {
  filters: TransactionFilters;
  onChange: <K extends keyof TransactionFilters>(key: K, value: TransactionFilters[K]) => void;
  rangeIssues: string[];
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold text-ink">
        {label}
      </label>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className="input">
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function TransactionFiltersPanel({ filters, onChange, rangeIssues }: TransactionFiltersPanelProps) {
  const fromId = useId();
  const toId = useId();
  const minId = useId();
  const maxId = useId();
  const issuesId = useId();
  const hasIssues = rangeIssues.length > 0;

  return (
    <div className="space-y-4">
      <SelectField
        label="Account"
        value={filters.accountId}
        onChange={(value) => onChange("accountId", value)}
        options={[
          { value: "all", label: "All accounts" },
          ...accounts.map((account) => ({ value: account.id, label: `${account.name} ${account.maskedNumber}` })),
        ]}
      />
      <SelectField
        label="Status"
        value={filters.status}
        onChange={(value) => onChange("status", value as TransactionFilters["status"])}
        options={[
          { value: "all", label: "All statuses" },
          ...transactionStatusOrder.map((status) => ({ value: status, label: transactionStatusMeta[status].label })),
        ]}
      />
      <SelectField
        label="Type"
        value={filters.type}
        onChange={(value) => onChange("type", value as TransactionFilters["type"])}
        options={[
          { value: "all", label: "All types" },
          ...transactionTypeOrder.map((type) => ({ value: type, label: transactionTypeLabels[type].plural })),
        ]}
      />
      <SelectField
        label="Category"
        value={filters.category}
        onChange={(value) => onChange("category", value as TransactionFilters["category"])}
        options={[
          { value: "all", label: "All categories" },
          ...transactionCategories.map((category) => ({ value: category, label: category })),
        ]}
      />

      <fieldset>
        <legend className="mb-1 text-sm font-semibold text-ink">Date range</legend>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor={fromId} className="mb-1 block text-xs text-muted">
              From
            </label>
            <input
              id={fromId}
              type="date"
              value={filters.dateFrom}
              onChange={(event) => onChange("dateFrom", event.target.value)}
              className="input"
              aria-describedby={hasIssues ? issuesId : undefined}
            />
          </div>
          <div>
            <label htmlFor={toId} className="mb-1 block text-xs text-muted">
              To
            </label>
            <input
              id={toId}
              type="date"
              value={filters.dateTo}
              onChange={(event) => onChange("dateTo", event.target.value)}
              className="input"
              aria-describedby={hasIssues ? issuesId : undefined}
            />
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-1 text-sm font-semibold text-ink">Amount range</legend>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor={minId} className="mb-1 block text-xs text-muted">
              Minimum ($)
            </label>
            <input
              id={minId}
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={filters.amountMin}
              onChange={(event) => onChange("amountMin", event.target.value)}
              className="input"
              aria-describedby={hasIssues ? issuesId : undefined}
            />
          </div>
          <div>
            <label htmlFor={maxId} className="mb-1 block text-xs text-muted">
              Maximum ($)
            </label>
            <input
              id={maxId}
              type="text"
              inputMode="decimal"
              placeholder="Any"
              value={filters.amountMax}
              onChange={(event) => onChange("amountMax", event.target.value)}
              className="input"
              aria-describedby={hasIssues ? issuesId : undefined}
            />
          </div>
        </div>
        <p className="mt-1 text-xs text-muted">Amounts match money in and money out.</p>
      </fieldset>

      {hasIssues ? (
        <div id={issuesId} role="alert" className="rounded-xl border border-error/40 bg-error-50 p-3 text-sm text-error-text">
          <p className="font-semibold">Check your filters:</p>
          <ul className="mt-1 list-disc pl-5">
            {rangeIssues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
