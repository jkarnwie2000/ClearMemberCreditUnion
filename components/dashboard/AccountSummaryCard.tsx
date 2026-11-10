import { ArrowRight, Landmark, PiggyBank, Gift } from "lucide-react";
import Link from "next/link";
import { InfoDisclosure } from "@/components/ui/InfoDisclosure";
import { getPendingTransactions } from "@/lib/accounts";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Account } from "@/types";

const BALANCE_EXPLANATION =
  "Your current balance includes posted transactions. Your available balance reflects money you can currently spend, including adjustments for pending transactions and holds.";

function AccountIcon({ account }: { account: Account }) {
  const Icon = account.type === "checking" ? Landmark : account.goal ? Gift : PiggyBank;
  const tile = account.type === "checking" ? "bg-brand" : account.goal ? "bg-teal-text" : "bg-teal";
  return (
    <span className={`flex size-10 items-center justify-center rounded-xl text-white shadow-sm ${tile}`}>
      <Icon aria-hidden="true" className="size-5" />
    </span>
  );
}

function PendingBreakdown({ account }: { account: Account }) {
  const pending = getPendingTransactions(account.id);
  const difference = account.currentBalance - account.availableBalance;
  if (pending.length === 0 || difference <= 0) return null;

  return (
    <div className="mt-3 border-t border-brand/15 pt-3">
      <p className="font-semibold">
        Why your available balance is {formatCurrency(difference)} lower right now:
      </p>
      <ul className="mt-2 space-y-1">
        {pending.map((transaction) => (
          <li key={transaction.id} className="flex justify-between gap-3">
            <Link href={`/activity?txn=${transaction.id}`} className="text-brand underline underline-offset-2 hover:text-brand-dark">
              {transaction.merchantName}
              {transaction.hold ? " (temporary hold)" : " (pending)"}
            </Link>
            <span className="tabular whitespace-nowrap">{formatCurrency(Math.abs(transaction.amount))}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AccountSummaryCard({ account }: { account: Account }) {
  const isChecking = account.type === "checking";
  const headingId = `account-${account.id}-heading`;

  return (
    <article aria-labelledby={headingId} className="card flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 id={headingId} className="font-semibold text-navy">
            {account.name}
          </h3>
          <p className="text-sm text-muted">
            <span className="sr-only">Account ending in </span>
            <span aria-hidden="true">{account.maskedNumber}</span>
            <span className="sr-only">{account.maskedNumber.slice(-4)}</span>
          </p>
        </div>
        <AccountIcon account={account} />
      </div>

      {isChecking ? (
        <dl className="mt-5 grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-muted">Available balance</dt>
            <dd className="tabular mt-1 text-2xl font-bold tracking-tight text-navy">
              {formatCurrency(account.availableBalance)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Current balance</dt>
            <dd className="tabular mt-1 text-2xl font-bold tracking-tight text-ink">
              {formatCurrency(account.currentBalance)}
            </dd>
          </div>
        </dl>
      ) : (
        <dl className="mt-5">
          <dt className="text-sm text-muted">Balance</dt>
          <dd className="tabular mt-1 text-2xl font-bold tracking-tight text-navy">
            {formatCurrency(account.currentBalance)}
          </dd>
          {account.dividendRate ? (
            <>
              <dt className="sr-only">Dividend rate</dt>
              <dd className="mt-1 text-sm text-muted">Earning {account.dividendRate.toFixed(2)}% APY (demo rate)</dd>
            </>
          ) : null}
        </dl>
      )}

      {account.goal ? <GoalProgress account={account} /> : null}

      <div className="mt-auto pt-4">
        {isChecking ? (
          <InfoDisclosure label="What's the difference?" className="mb-3">
            <p>{BALANCE_EXPLANATION}</p>
            <PendingBreakdown account={account} />
          </InfoDisclosure>
        ) : null}
        <Link
          href={`/activity?account=${account.id}`}
            aria-label={`View activity for ${account.name}`}
          className="inline-flex min-h-9 items-center gap-1 text-sm font-semibold text-brand underline-offset-2 hover:underline"
        >
          View activity
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </article>
  );
}

function GoalProgress({ account }: { account: Account }) {
  const goal = account.goal!;
  const percent = Math.min(100, Math.round((account.currentBalance / goal.targetAmount) * 100));
  return (
    <div className="mt-4">
      <div className="flex justify-between text-sm">
        <span className="text-muted">{goal.label}</span>
        <span className="font-semibold text-ink">{percent}%</span>
      </div>
      <div
        role="progressbar"
        aria-label={`Savings goal progress: ${goal.label}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={`${formatCurrency(account.currentBalance)} of ${formatCurrency(goal.targetAmount)} saved`}
        className="mt-1.5 h-2 overflow-hidden rounded-full bg-teal-50"
      >
        <div className="h-full rounded-full bg-teal" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-1 text-xs text-muted">
        {formatCurrency(goal.targetAmount - account.currentBalance)} to go by {formatDate(goal.targetDate)}
      </p>
    </div>
  );
}
