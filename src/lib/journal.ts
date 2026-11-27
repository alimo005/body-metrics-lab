// Journal helpers (DESIGN-SPEC.md 9): one place that decides which articles are published, in which order, and whether an
// article file is valid. Used by the Journal listing, the article pages, the home page and the calculator pages.
// The pure rules (publication status, validation, pagination, reading time) live in article-rules.ts and are unit-tested.
//
// Publication rule: `draft: true` is NEVER public. Only getPublishedArticles() feeds the listing, the home page, the related-article
// banners, the sitemap and the production article routes. Drafts can be previewed only on the local dev server (see getArticlesForRoutes).
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import type { CalculatorSlug } from '../config/site';
import { articleProblems, isPublished, listingHref, pageItems, readMinutesFromBody, totalPages } from './article-rules';

export type Article = CollectionEntry<'journal'>;
export { listingHref, pageItems, totalPages };

// With no article files the content collection is empty, and Astro prints a warning for that. Checking the folder first lets the
// Journal work (and the build stay quiet) with zero articles. Files starting with "_" (the template) are not articles.
const articleFiles = import.meta.glob('../content/journal/[!_]*.md');

/** Everything that must be fixed before this article can be published (an empty list means it is valid). */
export function problemsOf(article: Article): string[] {
  return articleProblems({
    slug: article.id,
    body: article.body ?? '',
    pubDate: article.data.pubDate,
    updatedDate: article.data.updatedDate,
    hasImage: Boolean(article.data.image),
    hasImageAlt: Boolean(article.data.imageAlt),
    reviewDate: article.data.medicalReview?.reviewDate,
  });
}

/** Throws a clear error for an invalid PUBLISHED article, so a bad file can never reach the built site. */
function validate(article: Article): void {
  const problems = problemsOf(article);
  if (problems.length > 0) throw new Error(`Journal article "${article.id}": ${problems.join(' ')}`);
}

async function allArticles(): Promise<Article[]> {
  // Only in the production build: the dev server must always ask the collection, because articles can be added while it runs.
  if (import.meta.env.PROD && Object.keys(articleFiles).length === 0) return [];
  return getCollection('journal');
}

const newestFirst = (a: Article, b: Article) => b.data.pubDate.getTime() - a.data.pubDate.getTime() || a.id.localeCompare(b.id);

/**
 * Published articles, newest first by pubDate. Drafts and future-dated articles are excluded (DESIGN-SPEC.md 9.3, 19.1 item 5).
 * Every published article is validated, so a bad file fails the build with a clear message. Drafts are not validated here.
 */
export async function getPublishedArticles(): Promise<Article[]> {
  const now = new Date();
  const published = (await allArticles()).filter((a) => isPublished(a.data.draft, a.data.pubDate, now));
  published.forEach(validate);
  return published.sort(newestFirst);
}

/**
 * Articles that get an article page. In the production build this is exactly the published articles. On the local dev server
 * (`npm run dev`) drafts and future-dated articles also get a page, so the owner can preview them before publishing; they are still
 * excluded from every list, banner and sitemap, and they are never part of the built site.
 */
export async function getArticlesForRoutes(): Promise<Article[]> {
  if (!import.meta.env.DEV) return getPublishedArticles();
  const all = await allArticles();
  // Published articles must be valid. A draft may be unfinished: it is previewed with its list of problems instead of failing.
  const now = new Date();
  all.filter((a) => isPublished(a.data.draft, a.data.pubDate, now)).forEach(validate);
  return all.sort(newestFirst);
}

/** True when an article is shown only as a local preview (a draft or a future-dated article). */
export const isPreviewOnly = (article: Article): boolean => !isPublished(article.data.draft, article.data.pubDate, new Date());

/** The most recent published article for a calculator, or undefined (the related-article banner is then omitted). */
export async function getRelatedArticle(calculator: CalculatorSlug): Promise<Article | undefined> {
  return (await getPublishedArticles()).find((a) => a.data.relatedCalculator === calculator);
}

export const articleHref = (article: Article): string => `/journal/${article.id}/`;

export const readMinutes = (article: Article): number => readMinutesFromBody(article.body ?? '');

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
}

/** True when an "Updated" date should be shown (only when it differs from the publication date). */
export const hasUpdate = (article: Article): boolean =>
  Boolean(article.data.updatedDate) && article.data.updatedDate!.getTime() !== article.data.pubDate.getTime();
