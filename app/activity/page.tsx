import type { Metadata } from "next";
import { TransactionActivity } from "@/components/transactions/TransactionActivity";
import { PageHeader } from "@/components/ui/PageHeader";
import { parseActivityParams, type RawSearchParams } from "@/lib/search-params";

export const metadata: Metadata = {
  title: "Account Activity",
  description: "Search, filter, and understand every transaction on your ClearMember accounts.",
};

export default async function ActivityPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const params = await searchParams;
  const { filters, selectedId } = parseActivityParams(params);
  // Remount when the URL changes so links like "View related transactions" apply fresh filters.
  const key = JSON.stringify(params);

  return (
    <>
      <PageHeader
        title="Account Activity"
        description="Search, sort, and filter your transactions. Select any transaction for a plain-language explanation of what it means and what to do next."
      />
      <TransactionActivity key={key} initialFilters={filters} initialSelectedId={selectedId} />
    </>
  );
}
