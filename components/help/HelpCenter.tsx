"use client";

import { BookOpen, ChevronRight, Search, SearchX } from "lucide-react";
import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { articleCategories, articles as allArticles } from "@/data/articles";
import { searchArticles } from "@/lib/articles";
import { cn, pluralize } from "@/lib/utils";
import type { ArticleCategory, SupportArticle } from "@/types";

const SUGGESTED_SEARCHES = ["pending", "hold", "transfer delayed", "overdraft", "unfamiliar merchant", "phishing"];

interface HelpCenterProps {
  initialQuery?: string;
  articles?: SupportArticle[];
}

function ArticleCard({ article }: { article: SupportArticle }) {
  return (
    <li>
      <Link
        href={`/help/${article.slug}`}
        className="card group flex h-full items-start gap-3 p-4 transition-shadow hover:shadow-raised"
      >
        <BookOpen aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-teal-text" />
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-navy group-hover:text-brand group-hover:underline">{article.title}</span>
          <span className="mt-1 block text-sm leading-relaxed text-muted">{article.summary}</span>
          <span className="mt-2 inline-block text-xs font-semibold uppercase tracking-wide text-teal-text">
            {article.category}
          </span>
        </span>
        <ChevronRight aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-muted" />
      </Link>
    </li>
  );
}

export function HelpCenter({ initialQuery = "", articles = allArticles }: HelpCenterProps) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<ArticleCategory | "all">("all");
  const searchId = useId();

  const results = useMemo(() => searchArticles(query, { category, articles }), [query, category, articles]);
  const isSearching = query.trim().length > 0;

  return (
    <div>
      <div role="search" className="card p-5 sm:p-6">
        <label htmlFor={searchId} className="block text-lg font-semibold text-navy">
          How can we help?
        </label>
        <p id={`${searchId}-hint`} className="mt-1 text-sm text-muted">
          Search by keyword or describe your question, for example &ldquo;why is my transfer late&rdquo;.
        </p>
        <div className="relative mt-3">
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted" />
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-describedby={`${searchId}-hint`}
            placeholder="Search help articles"
            autoComplete="off"
            className="input min-h-12 pl-10 text-base"
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted">Popular:</span>
          {SUGGESTED_SEARCHES.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setQuery(suggestion)}
              className="min-h-8 rounded-full border border-line bg-canvas px-3 text-sm text-ink hover:border-brand/40 hover:bg-brand-50"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6" role="group" aria-label="Filter by category">
        <div className="flex flex-wrap gap-2">
          {(["all", ...articleCategories] as const).map((option) => {
            const active = category === option;
            return (
              <button
                key={option}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(option)}
                className={cn(
                  "min-h-9 rounded-full px-3.5 text-sm font-semibold ring-1 ring-inset transition-colors",
                  active ? "bg-brand text-white ring-brand" : "bg-white text-ink ring-line-strong hover:bg-brand-50",
                )}
              >
                {option === "all" ? "All topics" : option}
              </button>
            );
          })}
        </div>
      </div>

      <p aria-live="polite" aria-atomic="true" className="mt-5 text-sm text-muted">
        {isSearching
          ? `${pluralize(results.length, "article")} found for “${query.trim()}”`
          : `${pluralize(results.length, "article")}${category === "all" ? "" : ` in ${category}`}`}
      </p>

      {results.length === 0 ? (
        <div className="card mt-3">
          <EmptyState
            icon={SearchX}
            title="No articles match your search"
            description={
              <p>
                Try different words, like &ldquo;fee&rdquo; or &ldquo;transfer&rdquo;, or choose All topics. If you
                still can&apos;t find an answer, you can send us a support request without calling.
              </p>
            }
            actions={
              <>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setQuery("");
                    setCategory("all");
                  }}
                >
                  Clear search
                </Button>
                <ButtonLink href="/support/new">Submit a support request</ButtonLink>
              </>
            }
          />
        </div>
      ) : isSearching || category !== "all" ? (
        <ul aria-label="Help articles" className="mt-3 grid gap-3 md:grid-cols-2">
          {results.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </ul>
      ) : (
        <div className="mt-3 space-y-8">
          {articleCategories.map((categoryName) => {
            const inCategory = results.filter((article) => article.category === categoryName);
            if (inCategory.length === 0) return null;
            const headingId = `category-${categoryName.replace(/\W+/g, "-").toLowerCase()}`;
            return (
              <section key={categoryName} aria-labelledby={headingId}>
                <h2 id={headingId} className="mb-3 text-lg font-semibold text-navy">
                  {categoryName}
                </h2>
                <ul className="grid gap-3 md:grid-cols-2">
                  {inCategory.map((article) => (
                    <ArticleCard key={article.slug} article={article} />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
