// Journal rules: DESIGN-SPEC.md 9.1 (pagination), 9.2 and 9.3 (article validation) and the owner's Version 1 editorial rules.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { articleProblems, isPublished, listingHref, pageItems, readMinutesFromBody, totalPages } from './article-rules.ts';
import type { ArticleFacts } from './article-rules.ts';
import { JOURNAL_PAGE_SIZE, calculators, calculatorSlugs, INDEXING_ENABLED } from '../config/site.ts';

const VALID_BODY = `Opening paragraph without a heading.

## A section

Text with a [link](/calculators/bmi/).

## Sources

1. Author. [A real title](https://example.org/paper). Publisher, 2024.
`;
const valid = (over: Partial<ArticleFacts> = {}): ArticleFacts => ({
  slug: 'a-good-slug',
  body: VALID_BODY,
  pubDate: new Date('2026-11-01'),
  hasImage: false,
  hasImageAlt: false,
  ...over,
});

describe('article validation', () => {
  it('accepts a valid article', () => {
    assert.deepEqual(articleProblems(valid()), []);
  });
  it('reserves the slug "page" and requires lowercase kebab-case', () => {
    assert.match(articleProblems(valid({ slug: 'page' })).join(' '), /reserved/);
    for (const slug of ['Bad Slug', 'under_score', 'UPPER', '-x', 'x-', 'a--b']) assert.ok(articleProblems(valid({ slug })).length > 0, slug);
    assert.deepEqual(articleProblems(valid({ slug: 'bmi-2' })), []);
  });
  it('requires the last H2 to be exactly "Sources"', () => {
    assert.match(articleProblems(valid({ body: VALID_BODY.replace('## Sources', '## References') })).join(' '), /last H2/);
    assert.match(articleProblems(valid({ body: `${VALID_BODY}\n## Afterword\n\nText.` })).join(' '), /last H2/);
    assert.match(articleProblems(valid({ body: 'No headings at all.' })).join(' '), /last H2/);
  });
  it('requires an ordered Sources list with at least one https link', () => {
    assert.match(articleProblems(valid({ body: VALID_BODY.replace('https://example.org/paper', 'http://example.org/paper') })).join(' '), /external https link/);
    assert.match(articleProblems(valid({ body: VALID_BODY.replace('1. Author.', '- Author.') })).join(' '), /ordered list/);
  });
  it('rejects an H1 in the body and standalone Introduction or Conclusion headings', () => {
    assert.match(articleProblems(valid({ body: `# Title\n\n${VALID_BODY}` })).join(' '), /H1/);
    assert.match(articleProblems(valid({ body: VALID_BODY.replace('## A section', '## Introduction') })).join(' '), /Introduction/);
    assert.match(articleProblems(valid({ body: VALID_BODY.replace('## A section', '## Conclusion') })).join(' '), /Conclusion/);
    assert.deepEqual(articleProblems(valid({ body: VALID_BODY.replace('## A section', '## Introduction to energy') })), []);
  });
  it('rejects the forbidden trust claims, in any letter case', () => {
    for (const phrase of ['Medically Reviewed', 'clinical grade', 'Clinical Validation', 'peer-reviewed physiological methodology', 'doctor-reviewed', 'clinically reviewed']) {
      assert.match(articleProblems(valid({ body: VALID_BODY.replace('Text with', `This is ${phrase}. Text with`) })).join(' '), /not allowed/, phrase);
    }
  });
  it('rejects an update date before the publication date, and an image without alt text', () => {
    assert.match(articleProblems(valid({ updatedDate: new Date('2026-10-01') })).join(' '), /updatedDate/);
    assert.deepEqual(articleProblems(valid({ updatedDate: new Date('2026-11-02') })), []);
    assert.match(articleProblems(valid({ hasImage: true, hasImageAlt: false })).join(' '), /imageAlt/);
    assert.deepEqual(articleProblems(valid({ hasImage: true, hasImageAlt: true })), []);
  });
});

describe('journal pagination (DESIGN-SPEC.md 9.1: nine per page, the tenth article creates page two)', () => {
  it('uses nine articles per page', () => {
    assert.equal(JOURNAL_PAGE_SIZE, 9);
  });
  it('has one page for 0 to 9 articles and no page two', () => {
    for (const n of [0, 1, 3, 9]) assert.equal(totalPages(n), 1, String(n));
  });
  it('the 10th article creates page two, the 19th page three', () => {
    assert.equal(totalPages(10), 2);
    assert.equal(totalPages(18), 2);
    assert.equal(totalPages(19), 3);
    assert.equal(totalPages(100), 12);
  });
  it('slices nine per page, newest first order preserved, nothing lost or repeated', () => {
    const items = Array.from({ length: 20 }, (_, i) => i + 1);
    assert.deepEqual(pageItems(items, 1), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
    assert.deepEqual(pageItems(items, 2), [10, 11, 12, 13, 14, 15, 16, 17, 18]);
    assert.deepEqual(pageItems(items, 3), [19, 20]);
    assert.deepEqual([...pageItems(items, 1), ...pageItems(items, 2), ...pageItems(items, 3)], items);
    assert.deepEqual(pageItems(items.slice(0, 10), 2), [10]);
  });
  it('page 1 is /journal/ and later pages are /journal/page/<n>/ (no /journal/page/1/)', () => {
    assert.equal(listingHref(1), '/journal/');
    assert.equal(listingHref(0), '/journal/');
    assert.equal(listingHref(2), '/journal/page/2/');
    assert.equal(listingHref(11), '/journal/page/11/');
  });
});

describe('reading time and Version 1 site scope', () => {
  it('is at least one minute and counts about 200 words per minute, ignoring HTML tags and code', () => {
    assert.equal(readMinutesFromBody(''), 1);
    assert.equal(readMinutesFromBody('word '.repeat(200)), 1);
    assert.equal(readMinutesFromBody('word '.repeat(201)), 2);
    assert.equal(readMinutesFromBody(`<div class="x">${'word '.repeat(200)}</div>`), 1);
    assert.equal(readMinutesFromBody('```\n' + 'code '.repeat(500) + '\n```\nfew words'), 1);
  });
  it('Version 1 has exactly the three calculators, and the Journal can only relate to those', () => {
    assert.deepEqual(calculators.map((c) => c.slug), ['bmi', 'bmr-tdee', 'body-fat']);
    assert.deepEqual([...calculatorSlugs], ['bmi', 'bmr-tdee', 'body-fat']);
    assert.deepEqual(calculators.map((c) => c.href), ['/calculators/bmi/', '/calculators/bmr-tdee/', '/calculators/body-fat/']);
    for (const c of calculators) assert.ok(c.href.endsWith('/') && c.href.startsWith('/calculators/'));
  });
  it('the release switch is on: the production site is indexable (2026-11-26 owner decision)', () => {
    assert.equal(INDEXING_ENABLED, true);
  });
});

describe('publication status: draft true is never public, draft false is public from its date (isPublished)', () => {
  const now = new Date('2026-11-25T12:00:00Z');
  it('a draft is never published, whatever its date', () => {
    assert.equal(isPublished(true, new Date('2020-01-01'), now), false);
    assert.equal(isPublished(true, new Date('2026-11-25'), now), false);
    assert.equal(isPublished(true, new Date('2030-01-01'), now), false);
  });
  it('a non-draft with a past or present date is published', () => {
    assert.equal(isPublished(false, new Date('2026-11-24'), now), true);
    assert.equal(isPublished(false, new Date('2026-11-25'), now), true);
    assert.equal(isPublished(false, new Date('2026-11-25T12:00:00Z'), now), true);
  });
  it('a non-draft with a future date stays hidden until its day', () => {
    assert.equal(isPublished(false, new Date('2026-11-26'), now), false);
    assert.equal(isPublished(false, new Date('2026-11-25T12:00:01Z'), now), false);
  });
});
