"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { TransactionDetailPanel } from "@/components/transactions/TransactionDetailPanel";
import { TransactionList } from "@/components/transactions/TransactionList";
import { ButtonLink } from "@/components/ui/Button";
import type { Transaction } from "@/types";

export function RecentActivity({ transactions }: { transactions: Transaction[] }) {
  const [selected, setSelected] = useState<Transaction | null>(null);

  return (
    <section aria-labelledby="recent-activity-heading" className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <h2 id="recent-activity-heading" className="text-lg font-semibold text-navy">
            Recent account activity
          </h2>
          <p className="text-sm text-muted">Select a transaction to see what it means.</p>
        </div>
        <ButtonLink href="/activity" variant="secondary" size="sm">
          View all transactions
          <ArrowRight aria-hidden="true" className="size-4" />
        </ButtonLink>
      </div>
      <TransactionList transactions={transactions} onSelect={setSelected} label="Recent transactions" />
      <TransactionDetailPanel transaction={selected} onClose={() => setSelected(null)} onSelectTransaction={setSelected} />
    </section>
  );
}
