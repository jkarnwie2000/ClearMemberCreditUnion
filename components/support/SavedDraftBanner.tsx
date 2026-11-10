"use client";

import { PencilLine } from "lucide-react";
import { useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { useIsClient } from "@/hooks/useIsClient";
import { getBrowserStorage, readDraft, type ReadDraftResult } from "@/hooks/useLocalDraft";
import { parseSupportDraft, SUPPORT_DRAFT_KEY, SUPPORT_DRAFT_VERSION, type SupportDraft } from "@/lib/support-draft";

function DraftBannerContent() {
  const [result] = useState<ReadDraftResult<SupportDraft>>(() =>
    readDraft(getBrowserStorage(), SUPPORT_DRAFT_KEY, SUPPORT_DRAFT_VERSION, parseSupportDraft),
  );
  if (!result.draft) return null;
  const subject = result.draft.data.values.subject?.trim();

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-brand/25 bg-brand-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="flex items-start gap-2 text-[0.9375rem] text-ink">
        <PencilLine aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand" />
        <span>
          <span className="font-semibold">You have an unfinished request</span>
          {subject ? <>: &ldquo;{subject}&rdquo;</> : null}. It&apos;s saved in this browser.
        </span>
      </p>
      <ButtonLink href="/support/new" size="sm">
        Continue your draft
      </ButtonLink>
    </div>
  );
}

export function SavedDraftBanner() {
  const isClient = useIsClient();
  return isClient ? <DraftBannerContent /> : null;
}
