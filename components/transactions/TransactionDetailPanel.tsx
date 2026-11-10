"use client";

import { BookOpen, ChevronRight, LifeBuoy, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import { TransactionExplanationView } from "@/components/explanations/TransactionExplanationView";
import { TransferTimeline } from "@/components/explanations/TransferTimeline";
import { buttonClasses } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { TransactionStatusBadge } from "@/components/ui/StatusBadge";
import { getArticleBySlug } from "@/data/articles";
import { transactions as allTransactions } from "@/data/transactions";
import { getAccountLabel } from "@/lib/accounts";
import { transactionStatusMeta, transactionTypeLabels } from "@/lib/labels";
import { getTransactionExplanation } from "@/lib/transaction-explanations";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Transaction } from "@/types";
import { TransactionAmount } from "./TransactionAmount";

interface TransactionDetailPanelProps {
  transaction: Transaction | null;
  onClose: () => void;
  onSelectTransaction: (transaction: Transaction) => void;
  transactions?: Transaction[];
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:gap-4">
      <dt className="text-sm text-muted sm:w-40 sm:shrink-0">{label}</dt>
      <dd className="min-w-0 break-words text-[0.9375rem] font-medium text-ink">{children}</dd>
    </div>
  );
}

export function TransactionDetailPanel({
  transaction,
  onClose,
  onSelectTransaction,
  transactions = allTransactions,
}: TransactionDetailPanelProps) {
  const explanation = useMemo(() => (transaction ? getTransactionExplanation(transaction) : null), [transaction]);

  const related = useMemo(
    () =>
      (transaction?.relatedTransactionIds ?? [])
        .map((id) => transactions.find((candidate) => candidate.id === id))
        .filter((candidate): candidate is Transaction => Boolean(candidate)),
    [transaction, transactions],
  );

  if (!transaction || !explanation) return null;

  const relatedArticles = explanation.relatedArticleSlugs
    .map((slug) => getArticleBySlug(slug))
    .filter((article) => article !== undefined);

  const supportHref = `/support/new?${new URLSearchParams({
    topic: explanation.suggestedSupportTopic,
    account: transaction.accountId,
    transaction: transaction.id,
  }).toString()}`;
  const relatedSearchHref = `/activity?${new URLSearchParams({ q: transaction.merchantName }).toString()}`;

  return (
    <Sheet
      open
      onClose={onClose}
      title={transaction.merchantName}
      description="Transaction details"
      contentKey={transaction.id}
    >
      <div className="space-y-6 px-5 py-5 sm:px-6">
        {/* Summary */}
        <div>
          <TransactionAmount transaction={transaction} className="text-3xl" />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <TransactionStatusBadge status={transaction.status} />
            <span className="text-sm text-muted">{transactionStatusMeta[transaction.status].description}</span>
          </div>
        </div>

        {/* Explanation: the signature feature, shown before the raw details */}
        <TransactionExplanationView explanation={explanation} />

        {transaction.transfer ? <TransferTimeline transfer={transaction.transfer} /> : null}

        {/* Raw details */}
        <section aria-labelledby="details-heading">
          <h3 id="details-heading" className="font-semibold text-navy">
            Transaction details
          </h3>
          <dl className="mt-2 divide-y divide-line">
            <DetailRow label="Merchant">{transaction.merchantName}</DetailRow>
            <DetailRow label="Amount">{formatCurrency(Math.abs(transaction.amount))}</DetailRow>
            {transaction.hold ? (
              <DetailRow label="Authorized hold">{formatCurrency(transaction.hold.authorizedAmount)}</DetailRow>
            ) : null}
            <DetailRow label="Transaction date">{formatDate(transaction.transactionDate)}</DetailRow>
            <DetailRow label="Posting date">
              {transaction.postedDate ? formatDate(transaction.postedDate) : "Not posted"}
            </DetailRow>
            <DetailRow label="Status">{transactionStatusMeta[transaction.status].label}</DetailRow>
            <DetailRow label="Account">{getAccountLabel(transaction.accountId)}</DetailRow>
            <DetailRow label="Category">{transaction.category}</DetailRow>
            <DetailRow label="Type">{transactionTypeLabels[transaction.type].singular}</DetailRow>
            <DetailRow label="Reference">
              <span className="font-mono text-sm">{transaction.reference}</span>
            </DetailRow>
            <DetailRow label="Statement descriptor">
              <span className="font-mono text-sm">{transaction.descriptor}</span>
            </DetailRow>
            <DetailRow label="Description">{transaction.description}</DetailRow>
          </dl>
        </section>

        {/* Related transactions */}
        {related.length > 0 ? (
          <section aria-labelledby="related-transactions-heading">
            <h3 id="related-transactions-heading" className="font-semibold text-navy">
              Related transactions
            </h3>
            <ul className="mt-2 space-y-2">
              {related.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSelectTransaction(item)}
                    className="flex w-full items-center gap-3 rounded-xl border border-line px-3 py-2.5 text-left hover:bg-canvas"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-ink">{item.merchantName}</span>
                      <span className="text-sm text-muted">
                        {formatDate(item.transactionDate)} · {transactionStatusMeta[item.status].label}
                      </span>
                    </span>
                    <TransactionAmount transaction={item} />
                    <ChevronRight aria-hidden="true" className="size-4 text-muted" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* Helpful articles */}
        {relatedArticles.length > 0 ? (
          <section aria-labelledby="related-articles-heading">
            <h3 id="related-articles-heading" className="font-semibold text-navy">
              Learn more in the Help Center
            </h3>
            <ul className="mt-2 space-y-1">
              {relatedArticles.map((article) => (
                <li key={article.slug}>
                  <Link
                    href={`/help/${article.slug}`}
                    className="inline-flex min-h-9 items-center gap-2 text-[0.9375rem] font-medium text-brand underline-offset-2 hover:underline"
                  >
                    <BookOpen aria-hidden="true" className="size-4 shrink-0" />
                    {article.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* Contextual actions */}
        <section aria-labelledby="actions-heading" className="border-t border-line pt-5">
          <h3 id="actions-heading" className="sr-only">
            Actions
          </h3>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Link href={relatedSearchHref} onClick={onClose} className={buttonClasses({ variant: "secondary" })}>
              <Search aria-hidden="true" className="size-4" />
              View related transactions
            </Link>
            <Link href="/help" onClick={onClose} className={buttonClasses({ variant: "secondary" })}>
              <BookOpen aria-hidden="true" className="size-4" />
              Visit the Help Center
            </Link>
            <Link href={supportHref} onClick={onClose} className={buttonClasses({ variant: "primary" })}>
              <LifeBuoy aria-hidden="true" className="size-4" />
              Submit a support request
            </Link>
          </div>
        </section>
      </div>
    </Sheet>
  );
}
