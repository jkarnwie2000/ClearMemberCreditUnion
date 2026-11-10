import { ArrowRight, FileText } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { InfoDisclosure } from "@/components/ui/InfoDisclosure";
import { getPendingTotal, getPendingTransactions } from "@/lib/accounts";
import { formatCurrency, formatDate, pluralize } from "@/lib/utils";
import type { Account } from "@/types";

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="mt-0.5 font-semibold text-ink">{children}</dd>
    </div>
  );
}

export function AccountDetailsCard({ account }: { account: Account }) {
  const pendingCount = getPendingTransactions(account.id).length;
  const pendingTotal = getPendingTotal(account.id);
  const headingId = `${account.id}-details-heading`;
  const terms = account.feeTerms;

  return (
    <article aria-labelledby={headingId} className="card overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-line p-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 id={headingId} className="text-lg font-semibold text-navy">
            {account.name}
          </h2>
          <p className="text-sm text-muted">
            {account.type === "checking" ? "Checking" : "Savings"} account ending in {account.maskedNumber.slice(-4)}
          </p>
          <p className="mt-2 max-w-xl text-[0.9375rem] text-ink">{account.description}</p>
        </div>
        <div className="sm:text-right">
          <p className="text-sm text-muted">Available balance</p>
          <p className="tabular text-3xl font-bold tracking-tight text-navy">{formatCurrency(account.availableBalance)}</p>
        </div>
      </div>

      <div className="p-5">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Detail label="Current balance">
            <span className="tabular">{formatCurrency(account.currentBalance)}</span>
          </Detail>
          <Detail label="Pending items">
            {pendingCount > 0 ? `${pluralize(pendingCount, "item")} · ${formatCurrency(pendingTotal)}` : "None"}
          </Detail>
          <Detail label="Account number">{account.maskedNumber}</Detail>
          <Detail label="Opened">{formatDate(account.openedDate)}</Detail>
          {account.dividendRate ? <Detail label="Dividend rate (demo)">{account.dividendRate.toFixed(2)}% APY</Detail> : null}
          {account.goal ? (
            <Detail label="Savings goal">
              {formatCurrency(account.goal.targetAmount)} by {formatDate(account.goal.targetDate)}
            </Detail>
          ) : null}
        </dl>

        {account.type === "checking" ? (
          <InfoDisclosure label="Why are my balances different?" className="mt-5">
            <p>
              Your current balance includes posted transactions. Your available balance reflects money you can
              currently spend, including adjustments for pending transactions and holds.
            </p>
            {pendingCount > 0 ? (
              <p className="mt-2">
                Right now, {pluralize(pendingCount, "pending item")} totaling {formatCurrency(pendingTotal)} explain the
                difference.{" "}
                <Link href={`/activity?account=${account.id}&status=pending`} className="font-semibold text-brand underline">
                  See pending items
                </Link>
              </p>
            ) : null}
          </InfoDisclosure>
        ) : null}

        {terms ? (
          <section aria-labelledby={`${account.id}-fees`} className="mt-5 rounded-xl bg-canvas p-4">
            <h3 id={`${account.id}-fees`} className="font-semibold text-navy">
              Fee schedule (demo terms)
            </h3>
            <ul className="mt-2 space-y-1 text-sm text-ink">
              {terms.monthlyMaintenanceFee ? (
                <li>
                  Monthly maintenance fee: {formatCurrency(terms.monthlyMaintenanceFee)}. {terms.maintenanceFeeWaiver}
                </li>
              ) : null}
              {terms.overdraftFee ? <li>Overdraft fee: {formatCurrency(terms.overdraftFee)} per item.</li> : null}
              {terms.returnedPaymentFee ? (
                <li>Returned payment fee: {formatCurrency(terms.returnedPaymentFee)} per item.</li>
              ) : null}
              {terms.nonNetworkAtmFee ? (
                <li>Non-network ATM fee: {formatCurrency(terms.nonNetworkAtmFee)} per withdrawal. ClearMember ATMs are free.</li>
              ) : null}
            </ul>
          </section>
        ) : null}

        <div className="mt-5 flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2 text-sm text-muted">
            <FileText aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <span>
              October 2026 statement is ready. {account.statementCycle} Statement documents aren&apos;t included in
              this demo.
            </span>
          </p>
          <Link
            href={`/activity?account=${account.id}`}
            aria-label={`View activity for ${account.name}`}
            className="inline-flex min-h-9 shrink-0 items-center gap-1 text-sm font-semibold text-brand underline-offset-2 hover:underline"
          >
            View activity
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
