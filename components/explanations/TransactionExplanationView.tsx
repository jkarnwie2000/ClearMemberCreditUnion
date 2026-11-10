import { CircleAlert, Lightbulb, ListChecks, MessageCircleQuestion, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { TransactionExplanation } from "@/types";

function ExplanationStep({
  number,
  icon: Icon,
  title,
  children,
}: {
  number: number;
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <span
        aria-hidden="true"
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-teal-text ring-1 ring-teal/30"
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <h4 className="font-semibold text-navy">
          <span className="sr-only">Step {number}: </span>
          {title}
        </h4>
        <div className="mt-1 text-[0.9375rem] leading-relaxed text-ink">{children}</div>
      </div>
    </div>
  );
}

/** The four-part plain-language explanation shown for every transaction. */
export function TransactionExplanationView({ explanation }: { explanation: TransactionExplanation }) {
  return (
    <section
      aria-labelledby="understanding-heading"
      data-explanation-kind={explanation.kind}
      className="rounded-2xl border border-teal/25 bg-teal-50/60 p-4 sm:p-5"
    >
      <h3 id="understanding-heading" className="text-lg font-bold text-navy">
        Understanding This Transaction
      </h3>
      <p className="mt-1 font-medium text-teal-text">{explanation.headline}</p>

      <div className="mt-5 space-y-5">
        <ExplanationStep number={1} icon={MessageCircleQuestion} title="What happened?">
          <p>{explanation.whatHappened}</p>
        </ExplanationStep>
        <ExplanationStep number={2} icon={Lightbulb} title="Why might this have happened?">
          <ul className="list-disc space-y-1.5 pl-5">
            {explanation.whyItMightHaveHappened.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </ExplanationStep>
        <ExplanationStep number={3} icon={Wallet} title="What does this mean for your account?">
          <p>{explanation.whatItMeans}</p>
        </ExplanationStep>
        <ExplanationStep number={4} icon={ListChecks} title="What should you do next?">
          <ol className="list-decimal space-y-1.5 pl-5">
            {explanation.whatToDoNext.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </ExplanationStep>
      </div>

      {explanation.securityNote ? (
        <div role="note" className="mt-5 flex gap-3 rounded-xl border border-warning/50 bg-warning-50 p-3 text-sm leading-relaxed text-ink">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-warning-text" />
          <p>
            <span className="font-semibold text-warning-text">Don&apos;t recognize this? </span>
            {explanation.securityNote}
          </p>
        </div>
      ) : null}
    </section>
  );
}
