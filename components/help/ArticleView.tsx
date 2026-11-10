import { ArrowLeft, ArrowRight, BookOpen, ListChecks, LifeBuoy } from "lucide-react";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { getRelatedArticles } from "@/lib/articles";
import type { SupportArticle, SupportTopic } from "@/types";

/** Where an article connects to the member's own transactions. */
const activityLinks: Record<string, { label: string; href: string }> = {
  "available-balance": { label: "See your pending transactions", href: "/activity?status=pending" },
  "current-balance": { label: "See your posted transactions", href: "/activity?status=posted" },
  "pending-debit-card-transactions": { label: "See your pending transactions", href: "/activity?status=pending" },
  "authorization-holds": { label: "See your pending transactions", href: "/activity?status=pending" },
  "unfamiliar-merchant-names": { label: "Search your transactions", href: "/activity" },
  "internal-transfers": { label: "See your transfers", href: "/activity?type=transfer" },
  "external-transfer-delays": { label: "See your transfers", href: "/activity?type=transfer" },
  "ach-processing": { label: "See your transfers", href: "/activity?type=transfer" },
  "scheduled-payments": { label: "See your transfers", href: "/activity?type=transfer" },
  "monthly-maintenance-fees": { label: "See fees on your accounts", href: "/activity?type=fee" },
  "overdraft-fees": { label: "See fees on your accounts", href: "/activity?type=fee" },
  "atm-fees": { label: "See fees on your accounts", href: "/activity?type=fee" },
  "returned-payment-fees": { label: "See reversed and returned items", href: "/activity?status=reversed" },
  "suspicious-transactions": { label: "Review your recent activity", href: "/activity" },
};

const topicBySlug: Record<string, SupportTopic> = {
  "pending-debit-card-transactions": "pending-transaction",
  "authorization-holds": "pending-transaction",
  "unfamiliar-merchant-names": "unrecognized-merchant",
  "suspicious-transactions": "unrecognized-merchant",
};

const topicByCategory: Record<SupportArticle["category"], SupportTopic> = {
  "Account Management": "general-inquiry",
  "Debit Cards": "debit-card-issue",
  "Transfers and Payments": "transfer-delay",
  "Fees and Charges": "account-fee",
  Security: "general-inquiry",
};

export function ArticleView({ article }: { article: SupportArticle }) {
  const related = getRelatedArticles(article);
  const activityLink = activityLinks[article.slug];
  const topic = topicBySlug[article.slug] ?? topicByCategory[article.category];

  return (
    <article className="mx-auto max-w-3xl">
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
          <li>
            <Link href="/help" className="inline-flex min-h-9 items-center gap-1 font-semibold text-brand hover:underline">
              <ArrowLeft aria-hidden="true" className="size-4" />
              Help Center
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>{article.category}</li>
        </ol>
      </nav>

      <header>
        <p className="text-sm font-semibold text-teal-text">{article.category}</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-navy sm:text-3xl">{article.title}</h1>
        <p className="mt-3 text-lg leading-relaxed text-muted">{article.summary}</p>
      </header>

      <div className="card mt-6 space-y-4 p-5 text-[1.0625rem] leading-relaxed text-ink sm:p-7">
        {article.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <section aria-labelledby="next-steps-heading" className="mt-6 rounded-2xl border border-teal/25 bg-teal-50/60 p-5 sm:p-6">
        <h2 id="next-steps-heading" className="flex items-center gap-2 text-lg font-semibold text-navy">
          <ListChecks aria-hidden="true" className="size-5 text-teal-text" />
          Helpful next steps
        </h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 leading-relaxed">
          {article.nextSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        {activityLink ? (
          <Link
            href={activityLink.href}
            className="mt-4 inline-flex min-h-9 items-center gap-1 font-semibold text-brand underline-offset-2 hover:underline"
          >
            {activityLink.label}
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        ) : null}
      </section>

      {related.length > 0 ? (
        <section aria-labelledby="related-heading" className="mt-8">
          <h2 id="related-heading" className="text-lg font-semibold text-navy">
            Related articles
          </h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {related.map((item) => (
              <li key={item.slug}>
                <Link href={`/help/${item.slug}`} className="card flex h-full items-start gap-3 p-4 hover:shadow-raised">
                  <BookOpen aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-teal-text" />
                  <span>
                    <span className="block font-semibold text-navy">{item.title}</span>
                    <span className="mt-1 block text-sm text-muted">{item.summary}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <aside aria-labelledby="still-need-help" className="card mt-8 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="still-need-help" className="font-semibold text-navy">
            Still have a question?
          </h2>
          <p className="mt-1 text-sm text-muted">Send a support request online. No phone call needed.</p>
        </div>
        <ButtonLink href={`/support/new?topic=${topic}`}>
          <LifeBuoy aria-hidden="true" className="size-4" />
          Submit a support request
        </ButtonLink>
      </aside>
    </article>
  );
}
