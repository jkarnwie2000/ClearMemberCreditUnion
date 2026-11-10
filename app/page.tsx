import { AccountSummaryCard } from "@/components/dashboard/AccountSummaryCard";
import { CommonQuestions } from "@/components/dashboard/CommonQuestions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { WelcomeSection } from "@/components/dashboard/WelcomeSection";
import { accounts } from "@/data/accounts";
import { transactions } from "@/data/transactions";
import { getTotalBalance } from "@/lib/accounts";
import { sortTransactions } from "@/lib/transactions";
import { formatCurrency } from "@/lib/utils";

const RECENT_COUNT = 8;

export default function OverviewPage() {
  const recent = sortTransactions(transactions, "newest").slice(0, RECENT_COUNT);

  return (
    <>
      <WelcomeSection />

      <section aria-labelledby="accounts-heading" className="mb-8">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="accounts-heading" className="text-lg font-semibold text-navy">
            Your accounts
          </h2>
          <p className="text-sm text-muted">
            Total current balance:{" "}
            <span className="tabular font-semibold text-ink">{formatCurrency(getTotalBalance())}</span>
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {accounts.map((account) => (
            <AccountSummaryCard key={account.id} account={account} />
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <RecentActivity transactions={recent} />
        <CommonQuestions />
      </div>
    </>
  );
}
