import { TransferStageBadge } from "@/components/ui/StatusBadge";
import { transferStageMeta } from "@/lib/labels";
import { cn, formatDate } from "@/lib/utils";
import type { TransferDetails } from "@/types";

/** Shows each recorded stage of a transfer in order. No future dates are predicted. */
export function TransferTimeline({ transfer }: { transfer: TransferDetails }) {
  return (
    <section aria-labelledby="transfer-timeline-heading" className="rounded-2xl border border-line p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id="transfer-timeline-heading" className="font-semibold text-navy">
          Transfer status
        </h3>
        <TransferStageBadge stage={transfer.stage} />
      </div>
      <p className="mt-1 text-sm text-muted">
        {transfer.direction === "internal" ? "Internal transfer" : "External transfer"} ·{" "}
        {transfer.flow === "incoming" ? "From" : "To"} {transfer.counterparty}
      </p>
      <ol className="mt-4 space-y-4">
        {transfer.timeline.map((event, index) => {
          const isCurrent = index === transfer.timeline.length - 1;
          return (
            <li key={`${event.stage}-${event.date}`} className="relative flex gap-3">
              <span
                aria-hidden="true"
                className={cn(
                  "mt-1 size-3 shrink-0 rounded-full ring-4",
                  event.stage === "delayed"
                    ? "bg-error ring-error-50"
                    : event.stage === "completed"
                      ? "bg-success ring-success-50"
                      : "bg-brand ring-brand-50",
                )}
              />
              <div>
                <p className="text-sm font-semibold text-ink">
                  {transferStageMeta[event.stage].label}
                  <span className="font-normal text-muted"> · {formatDate(event.date)}</span>
                  {isCurrent ? <span className="sr-only">{" (current stage)"}</span> : null}
                </p>
                <p className="text-sm leading-relaxed text-muted">{event.note}</p>
              </div>
            </li>
          );
        })}
      </ol>
      {transfer.stage !== "completed" ? (
        <p className="mt-4 rounded-xl bg-canvas p-3 text-sm leading-relaxed text-muted">
          Processing times vary by transfer type, processing schedules, weekends, and holidays. This demo doesn&apos;t
          include an expected completion date for this transfer, so we won&apos;t guess one.
        </p>
      ) : null}
    </section>
  );
}
