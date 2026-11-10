import { ChevronRight } from "lucide-react";
import { TransactionStatusBadge } from "@/components/ui/StatusBadge";
import { getAccountById } from "@/lib/accounts";
import { formatDate } from "@/lib/utils";
import type { Transaction } from "@/types";
import { CategoryIcon } from "./CategoryIcon";
import { TransactionAmount } from "./TransactionAmount";

interface TransactionListProps {
  transactions: Transaction[];
  onSelect: (transaction: Transaction) => void;
  showAccount?: boolean;
  label: string;
}

export function TransactionList({ transactions, onSelect, showAccount = true, label }: TransactionListProps) {
  return (
    <ul aria-label={label} className="divide-y divide-line">
      {transactions.map((transaction) => (
        <li key={transaction.id}>
          <TransactionRow transaction={transaction} onSelect={onSelect} showAccount={showAccount} />
        </li>
      ))}
    </ul>
  );
}

function TransactionRow({
  transaction,
  onSelect,
  showAccount,
}: {
  transaction: Transaction;
  onSelect: (transaction: Transaction) => void;
  showAccount: boolean;
}) {
  const account = getAccountById(transaction.accountId);

  return (
    <button
      type="button"
      onClick={() => onSelect(transaction)}
      aria-haspopup="dialog"
      className="group flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-canvas focus-visible:bg-canvas sm:gap-4 sm:px-5"
    >
      <CategoryIcon category={transaction.category} />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="truncate font-semibold text-ink">{transaction.merchantName}</span>
          <TransactionStatusBadge status={transaction.status} />
        </span>
        <span className="mt-0.5 flex flex-wrap gap-x-2 text-sm text-muted">
          <span>{formatDate(transaction.transactionDate)}</span>
          <span aria-hidden="true">·</span>
          <span>{transaction.category}</span>
          {showAccount && account ? (
            <>
              <span aria-hidden="true">·</span>
              <span>
                {account.name} {account.maskedNumber}
              </span>
            </>
          ) : null}
        </span>
      </span>
      <TransactionAmount transaction={transaction} className="text-right text-[0.9375rem]" />
      <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-line-strong group-hover:text-muted" />
    </button>
  );
}
