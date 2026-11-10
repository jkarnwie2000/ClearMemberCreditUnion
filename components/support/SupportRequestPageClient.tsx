"use client";

import { useIsClient } from "@/hooks/useIsClient";
import { SupportRequestWizard, type SupportPrefill } from "./SupportRequestWizard";

/**
 * Drafts live in localStorage, which only exists in the browser. Rendering the
 * wizard after hydration lets it restore a draft on its very first render.
 */
export function SupportRequestPageClient({ prefill }: { prefill: SupportPrefill }) {
  const isClient = useIsClient();

  if (!isClient) {
    return (
      // Sized to match the rendered step 1 so the page doesn't shift when the form appears.
      <div className="card min-h-[1300px] p-7 sm:min-h-[840px]" aria-busy="true">
        <p role="status" className="text-sm text-muted">
          Loading your support request…
        </p>
        <div className="mt-6 h-64 rounded-xl bg-canvas" />
      </div>
    );
  }

  return <SupportRequestWizard prefill={prefill} />;
}
