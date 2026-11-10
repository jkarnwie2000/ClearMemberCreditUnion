import { articles as allArticles } from "@/data/articles";
import { normalizeText } from "@/lib/utils";
import type { ArticleCategory, SupportArticle } from "@/types";

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "can",
  "do",
  "does",
  "for",
  "how",
  "i",
  "in",
  "is",
  "it",
  "me",
  "my",
  "of",
  "on",
  "or",
  "the",
  "to",
  "what",
  "when",
  "where",
  "why",
  "with",
]);

const FIELD_WEIGHTS = { title: 5, keywords: 4, summary: 3, category: 2, body: 1 } as const;

export function tokenize(query: string): string[] {
  return normalizeText(query)
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 0 && !STOP_WORDS.has(token));
}

/** Simple plural/suffix variants so "fees" finds "fee" and "delayed" finds "delay". */
function variants(token: string): string[] {
  const forms = new Set([token]);
  if (token.length > 3 && token.endsWith("s")) forms.add(token.slice(0, -1));
  if (token.length > 4 && token.endsWith("ed")) forms.add(token.slice(0, -2));
  if (token.length > 5 && token.endsWith("ing")) forms.add(token.slice(0, -3));
  return [...forms];
}

interface ScoredArticle {
  article: SupportArticle;
  matchedTokens: number;
  score: number;
}

function scoreArticle(article: SupportArticle, tokens: string[]): ScoredArticle {
  const fields = {
    title: normalizeText(article.title),
    keywords: normalizeText(article.keywords.join(" ")),
    summary: normalizeText(article.summary),
    category: normalizeText(article.category),
    body: normalizeText([...article.body, ...article.nextSteps].join(" ")),
  };

  let matchedTokens = 0;
  let score = 0;
  for (const token of tokens) {
    let tokenScore = 0;
    for (const [field, text] of Object.entries(fields) as Array<[keyof typeof fields, string]>) {
      if (variants(token).some((form) => text.includes(form))) tokenScore += FIELD_WEIGHTS[field];
    }
    if (tokenScore > 0) matchedTokens += 1;
    score += tokenScore;
  }
  return { article, matchedTokens, score };
}

/**
 * Keyword search across titles, keywords, summaries, categories, and article
 * text. Articles matching more of the query's words rank first.
 */
export function searchArticles(
  query: string,
  options: { category?: ArticleCategory | "all"; articles?: SupportArticle[] } = {},
): SupportArticle[] {
  const { category = "all", articles = allArticles } = options;
  const inCategory = category === "all" ? articles : articles.filter((article) => article.category === category);
  const tokens = tokenize(query);
  if (tokens.length === 0) return inCategory;

  return inCategory
    .map((article) => scoreArticle(article, tokens))
    .filter((result) => result.matchedTokens > 0)
    .sort((a, b) => b.matchedTokens - a.matchedTokens || b.score - a.score)
    .map((result) => result.article);
}

export function getRelatedArticles(article: SupportArticle, articles: SupportArticle[] = allArticles): SupportArticle[] {
  return article.relatedSlugs
    .map((slug) => articles.find((candidate) => candidate.slug === slug))
    .filter((candidate): candidate is SupportArticle => Boolean(candidate));
}
