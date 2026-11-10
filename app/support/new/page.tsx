import type { Metadata } from "next";
import { SupportRequestPageClient } from "@/components/support/SupportRequestPageClient";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { PageHeader } from "@/components/ui/PageHeader";
import { accounts } from "@/data/accounts";
import { transactions } from "@/data/transactions";
import { supportTopicOrder } from "@/lib/labels";
import { firstParam, type RawSearchParams } from "@/lib/search-params";
import type { SupportTopic } from "@/types";
import type { SupportPrefill } from "@/components/support/SupportRequestWizard";

export const metadata: Metadata = {
  title: "New Support Request",
  description: "Send ClearMember a question in four short steps. Your progress is saved in this browser.",
};

function parsePrefill(params: RawSearchParams): SupportPrefill {
  const prefill: SupportPrefill = {};
  const topic = firstParam(params, "topic");
  if (topic && (supportTopicOrder as string[]).includes(topic)) prefill.topic = topic as SupportTopic;

  const transactionId = firstParam(params, "transaction");
  const transaction = transactions.find((item) => item.id === transactionId);
  if (transaction) {
    prefill.transactionId = transaction.id;
    prefill.accountId = transaction.accountId;
  }

  const accountId = firstParam(params, "account");
  if (!prefill.accountId && accounts.some((account) => account.id === accountId)) prefill.accountId = accountId;
  return prefill;
}

export default async function NewSupportRequestPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const prefill = parsePrefill(await searchParams);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Support Requests"
        title="Send us a question"
        description="Four short steps, no phone call needed. Your progress saves automatically, so you can come back to it later."
      />
      <div className="mb-5">
        <DemoNotice>
          Demonstration form: submitting creates a sample reference number but doesn&apos;t send anything.
        </DemoNotice>
      </div>
      <SupportRequestPageClient prefill={prefill} />
    </div>
  );
}
