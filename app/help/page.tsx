import type { Metadata } from "next";
import { HelpCenter } from "@/components/help/HelpCenter";
import { PageHeader } from "@/components/ui/PageHeader";
import { firstParam, type RawSearchParams } from "@/lib/search-params";

export const metadata: Metadata = {
  title: "Help Center",
  description: "Plain-language answers about balances, debit cards, transfers, fees, and account security.",
};

export default async function HelpPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const params = await searchParams;
  const query = (firstParam(params, "q") ?? "").slice(0, 100);

  return (
    <>
      <PageHeader
        eyebrow="Help Center"
        title="Answers in plain language"
        description="Find out why a transaction is pending, why a fee appeared, or why a transfer hasn't arrived, without waiting on hold."
      />
      <HelpCenter key={query} initialQuery={query} />
    </>
  );
}
