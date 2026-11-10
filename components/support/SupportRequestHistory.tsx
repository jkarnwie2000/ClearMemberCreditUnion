import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { SupportStatusBadge } from "@/components/ui/StatusBadge";
import { transactions } from "@/data/transactions";
import { supportRequestStatusMeta, supportTopicMeta } from "@/lib/labels";
import { formatDate } from "@/lib/utils";
import type { SupportRequest } from "@/types";

export function SupportRequestHistory({ requests }: { requests: SupportRequest[] }) {
  return (
    <ul aria-label="Support request history" className="space-y-3">
      {requests.map((request) => {
        const transaction = transactions.find((item) => item.id === request.transactionId);
        return (
          <li key={request.referenceNumber} className="card p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h3 className="font-semibold text-navy">{request.subject}</h3>
                <p className="mt-0.5 text-sm text-muted">{supportTopicMeta[request.topic].label}</p>
              </div>
              <div className="flex items-center gap-2">
                <SupportStatusBadge status={request.status} />
              </div>
            </div>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-muted">Reference number</dt>
                <dd className="mt-0.5 font-mono font-semibold text-ink">{request.referenceNumber}</dd>
              </div>
              <div>
                <dt className="text-muted">Submitted</dt>
                <dd className="mt-0.5 font-semibold text-ink">{formatDate(request.submittedOn)}</dd>
              </div>
              <div>
                <dt className="text-muted">Status</dt>
                <dd className="mt-0.5 font-semibold text-ink">
                  {supportRequestStatusMeta[request.status].label}
                  <span className="block font-normal text-muted">{supportRequestStatusMeta[request.status].description}</span>
                </dd>
              </div>
            </dl>
            <p className="mt-4 rounded-xl bg-canvas p-3 text-sm leading-relaxed text-ink">
              <span className="font-semibold">Latest update: </span>
              {request.lastUpdate}
            </p>
            {transaction ? (
              <Link
                href={`/activity?txn=${transaction.id}`}
                className="mt-3 inline-flex min-h-9 items-center gap-1 text-sm font-semibold text-brand underline-offset-2 hover:underline"
              >
                View related transaction: {transaction.merchantName}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
