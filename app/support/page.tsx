import { Plus } from "lucide-react";
import type { Metadata } from "next";
import { SavedDraftBanner } from "@/components/support/SavedDraftBanner";
import { SupportRequestHistory } from "@/components/support/SupportRequestHistory";
import { ButtonLink } from "@/components/ui/Button";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { PageHeader } from "@/components/ui/PageHeader";
import { supportRequests } from "@/data/supportRequests";

export const metadata: Metadata = {
  title: "Support Requests",
  description: "Track your support requests and send a new question without calling.",
};

export default function SupportPage() {
  const sorted = [...supportRequests].sort((a, b) => b.submittedOn.localeCompare(a.submittedOn));

  return (
    <>
      <PageHeader
        title="Support Requests"
        description="Send a question online and track its status here. Many questions are answered instantly in the Help Center, too."
        actions={
          <ButtonLink href="/support/new">
            <Plus aria-hidden="true" className="size-4" />
            New support request
          </ButtonLink>
        }
      />
      <SavedDraftBanner />
      <section aria-labelledby="history-heading">
        <h2 id="history-heading" className="mb-3 text-lg font-semibold text-navy">
          Request history
        </h2>
        <div className="mb-4">
          <DemoNotice>These are demonstration records. They don&apos;t represent real support tickets.</DemoNotice>
        </div>
        <SupportRequestHistory requests={sorted} />
      </section>
    </>
  );
}
