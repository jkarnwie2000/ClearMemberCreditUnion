import { ChevronRight, MessageCircleQuestion } from "lucide-react";
import Link from "next/link";
import { getArticleBySlug } from "@/data/articles";

/** The questions members ask most often in the contact center. */
const COMMON_QUESTION_SLUGS: Array<{ question: string; slug: string }> = [
  { question: "Why is a transaction still pending?", slug: "pending-debit-card-transactions" },
  { question: "Why is there a hold on my card?", slug: "authorization-holds" },
  { question: "Why hasn't my transfer arrived?", slug: "external-transfer-delays" },
  { question: "I don't recognize a merchant name", slug: "unfamiliar-merchant-names" },
  { question: "Why was I charged a fee?", slug: "overdraft-fees" },
];

export function CommonQuestions() {
  return (
    <section aria-labelledby="common-questions-heading" className="card p-5">
      <div className="flex items-center gap-2">
        <MessageCircleQuestion aria-hidden="true" className="size-5 text-teal-text" />
        <h2 id="common-questions-heading" className="text-lg font-semibold text-navy">
          Common questions
        </h2>
      </div>
      <p className="mt-1 text-sm text-muted">Quick answers to what members ask us most.</p>
      <ul className="mt-3 divide-y divide-line">
        {COMMON_QUESTION_SLUGS.filter(({ slug }) => getArticleBySlug(slug)).map(({ question, slug }) => (
          <li key={slug}>
            <Link
              href={`/help/${slug}`}
              className="group flex min-h-12 items-center justify-between gap-3 py-2 text-[0.9375rem] font-medium text-ink hover:text-brand"
            >
              {question}
              <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-muted group-hover:text-brand" />
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/help" className="mt-3 inline-flex min-h-9 items-center text-sm font-semibold text-brand underline-offset-2 hover:underline">
        Search all help articles
      </Link>
    </section>
  );
}
