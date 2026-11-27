// Pure rules for Journal articles and listing pages (DESIGN-SPEC.md 9). No Astro imports, so they are unit-tested with node:test.
// src/lib/journal.ts applies them to the content collection.
import { JOURNAL_PAGE_SIZE } from '../config/site.ts';

/** Phrases the site never uses (AGENTS.md "Trust claims"); an article containing one fails the build. */
export const FORBIDDEN_PHRASES = [
  'medically reviewed',
  'doctor-reviewed',
  'clinically reviewed',
  'clinical grade',
  'clinical-grade',
  'clinical validation',
  'peer-reviewed physiological methodology',
] as const;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export interface ArticleFacts {
  slug: string;
  body: string;
  pubDate: Date;
  updatedDate?: Date;
  hasImage: boolean;
  hasImageAlt: boolean;
  /** Review date from `medicalReview`, when the article has one. */
  reviewDate?: Date;
  /** Clock for the future-date check (tests pass a fixed value). */
  now?: Date;
}

/** Returns a list of problems (empty when the article is valid). Drafts are not checked. */
export function articleProblems(a: ArticleFacts): string[] {
  const problems: string[] = [];
  if (a.slug === 'page') problems.push('the slug "page" is reserved for the pagination routes (/journal/page/<n>/).');
  if (!SLUG_PATTERN.test(a.slug)) problems.push('the file name (the slug) must be lowercase kebab-case.');
  if (a.updatedDate && a.updatedDate < a.pubDate) problems.push('updatedDate is earlier than pubDate.');
  if (a.hasImage && !a.hasImageAlt) problems.push('imageAlt is required when image is set.');
  if (a.reviewDate && a.reviewDate.getTime() > (a.now ?? new Date()).getTime()) problems.push('medicalReview.reviewDate is in the future: use the real date the review took place.');

  if (/^# /m.test(a.body)) problems.push('the body must not contain an H1; the template renders the title as the only H1.');
  const h2s = [...a.body.matchAll(/^## (.+?)\s*$/gm)].map((m) => ({ text: m[1].trim(), index: m.index ?? 0 }));
  const last = h2s[h2s.length - 1];
  if (!last || last.text !== 'Sources') {
    problems.push('the last H2 must be titled exactly "Sources".');
  } else {
    const sources = a.body.slice(last.index);
    if (!/\]\(https:\/\/[^)\s]+\)/.test(sources)) problems.push('the Sources section must contain at least one external https link.');
    if (!/^\s*1\.\s/m.test(sources)) problems.push('the Sources section must be an ordered list.');
  }
  for (const h of h2s) if (/^(introduction|conclusion)$/i.test(h.text)) problems.push(`the heading "${h.text}" is not allowed (no standalone Introduction or Conclusion).`);
  const lower = a.body.toLowerCase();
  for (const phrase of FORBIDDEN_PHRASES) if (lower.includes(phrase)) problems.push(`the phrase "${phrase}" is not allowed.`);
  return problems;
}

/**
 * Publication status (the single rule for the whole site):
 * - `draft: true` is never published, whatever the date;
 * - `draft: false` is published once its pubDate has been reached (a future date keeps it hidden until the build after that day).
 */
export const isPublished = (draft: boolean, pubDate: Date, now: Date): boolean => !draft && pubDate.getTime() <= now.getTime();

/** Number of listing pages: always at least one; the tenth article creates page two (nine per page). */
export const totalPages = (count: number): number => Math.max(1, Math.ceil(count / JOURNAL_PAGE_SIZE));

export const pageItems = <T>(items: readonly T[], page: number): T[] => items.slice((page - 1) * JOURNAL_PAGE_SIZE, page * JOURNAL_PAGE_SIZE);

/** Listing URL: page 1 is /journal/, later pages are /journal/page/<n>/ (never /journal/page/1/). */
export const listingHref = (page: number): string => (page <= 1 ? '/journal/' : `/journal/page/${page}/`);

/** Reading time from the Markdown body at about 200 words per minute, at least one minute. */
export function readMinutesFromBody(body: string): number {
  const words = body.replace(/```[\s\S]*?```/g, ' ').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
