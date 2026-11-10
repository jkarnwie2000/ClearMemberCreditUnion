import { CircleCheck, FlaskConical } from "lucide-react";
import { forwardRef } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { supportTopicMeta } from "@/lib/labels";
import { responseMethodLabels, type SupportRequestFormValues } from "@/lib/validation";
import type { SupportTopic } from "@/types";

interface SubmissionConfirmationProps {
  referenceNumber: string;
  values: SupportRequestFormValues;
  onStartOver: () => void;
}

export const SubmissionConfirmation = forwardRef<HTMLHeadingElement, SubmissionConfirmationProps>(
  function SubmissionConfirmation({ referenceNumber, values, onStartOver }, ref) {
    return (
      <section aria-labelledby="confirmation-heading" className="card p-6 text-center sm:p-10">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-success-50 text-success-text">
          <CircleCheck aria-hidden="true" className="size-8" />
        </span>
        <h2
          id="confirmation-heading"
          ref={ref}
          tabIndex={-1}
          className="mt-4 text-2xl font-bold text-navy focus:outline-none"
        >
          Request submitted (demonstration)
        </h2>
        <p className="mt-2 text-muted">
          {supportTopicMeta[values.topic as SupportTopic]?.label ?? "Support request"} · {values.subject}
        </p>

        <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-line bg-canvas p-4">
          <p className="text-sm text-muted">Demonstration reference number</p>
          <p className="mt-1 font-mono text-xl font-bold tracking-wide text-navy" data-testid="reference-number">
            {referenceNumber}
          </p>
        </div>

        <div
          role="note"
          className="mx-auto mt-6 flex max-w-xl items-start gap-3 rounded-xl border border-teal/30 bg-teal-50 p-4 text-left text-sm leading-relaxed text-ink"
        >
          <FlaskConical aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-teal-text" />
          <p>
            <span className="font-semibold text-teal-text">This is a demonstration.</span> No support ticket was
            created or transmitted, and nothing you entered left this browser. In a real credit union app, a
            representative would reply by {responseMethodLabels[values.responseMethod].toLowerCase()}. Your saved
            draft has been cleared.
          </p>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/support" variant="secondary">
            View support requests
          </ButtonLink>
          <Button onClick={onStartOver}>Start another request</Button>
        </div>
      </section>
    );
  },
);
