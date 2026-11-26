// Structured data rules: only facts the site states, valid JSON, correct node types, and no invented credentials or reviews.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  ORGANIZATION_ID,
  WEBSITE_ID,
  absoluteUrl,
  articleNode,
  breadcrumbNode,
  buildGraph,
  calculatorNode,
  organizationNode,
  pageKindFor,
  serializeJsonLd,
  webPageNode,
  websiteNode,
} from './seo.ts';
import { CONTACT_EMAIL, calculators } from '../config/site.ts';

const types = (graph: { '@graph': Array<Record<string, unknown>> }) => graph['@graph'].map((n) => n['@type']);

describe('urls and page kinds', () => {
  it('builds absolute canonical URLs on the production domain', () => {
    assert.equal(absoluteUrl('/'), 'https://bodymetricslab.uk/');
    assert.equal(absoluteUrl('/calculators/bmi/'), 'https://bodymetricslab.uk/calculators/bmi/');
  });
  it('uses the specific page types where they exist', () => {
    assert.equal(pageKindFor('/about/'), 'AboutPage');
    assert.equal(pageKindFor('/contact/'), 'ContactPage');
    assert.equal(pageKindFor('/journal/'), 'CollectionPage');
    assert.equal(pageKindFor('/journal/page/2/'), 'CollectionPage');
    assert.equal(pageKindFor('/calculators/'), 'CollectionPage');
    assert.equal(pageKindFor('/privacy/'), 'WebPage');
    assert.equal(pageKindFor('/journal/some-article/'), 'WebPage');
  });
});

describe('Organization and WebSite', () => {
  it('uses only the site name, URL, logo and the public contact address', () => {
    const org = organizationNode();
    assert.equal(org['@type'], 'Organization');
    assert.equal(org.name, 'BodyMetrics Lab');
    assert.equal(org.email, CONTACT_EMAIL);
    assert.equal(org['@id'], ORGANIZATION_ID);
    assert.match(JSON.stringify(org), /apple-touch-icon\.png/);
  });
  it('WebSite is English and published by the Organization', () => {
    const site = websiteNode();
    assert.equal(site['@id'], WEBSITE_ID);
    assert.equal(site.inLanguage, 'en');
    assert.deepEqual(site.publisher, { '@id': ORGANIZATION_ID });
  });
});

describe('page graphs', () => {
  it('the home page carries Organization, WebSite and WebPage', () => {
    assert.deepEqual(types(buildGraph({ pathname: '/', title: 'Home', description: 'd' })), ['Organization', 'WebSite', 'WebPage']);
  });
  it('other pages carry only their own page node (they reference the site by id)', () => {
    const g = buildGraph({ pathname: '/about/', title: 'About', description: 'd' });
    assert.deepEqual(types(g), ['AboutPage']);
    assert.deepEqual((g['@graph'][0].isPartOf as Record<string, string>)['@id'], WEBSITE_ID);
  });
  it('each of the three calculators also carries a free WebApplication, and nothing else is a calculator', () => {
    for (const c of calculators) {
      const g = buildGraph({ pathname: c.href, title: c.label, description: c.description });
      assert.deepEqual(types(g), ['WebPage', 'WebApplication']);
      const app = g['@graph'][1];
      assert.equal(app.isAccessibleForFree, true);
      assert.equal(app.applicationCategory, 'HealthApplication');
      assert.deepEqual((g['@graph'][0].mainEntity as Record<string, string>)['@id'], `https://bodymetricslab.uk${c.href}#calculator`);
    }
    assert.deepEqual(types(buildGraph({ pathname: '/calculators/', title: 't', description: 'd' })), ['CollectionPage']);
  });
  it('adds extra nodes, for example an Article', () => {
    const article = articleNode({ url: 'https://bodymetricslab.uk/journal/x/', headline: 'H', description: 'd', datePublished: '2026-11-01' });
    assert.deepEqual(types(buildGraph({ pathname: '/journal/x/', title: 't', description: 'd', extra: [article] })), ['WebPage', 'Article']);
  });
});

describe('BreadcrumbList', () => {
  it('numbers the items and points the last one at the current page', () => {
    const b = breadcrumbNode([{ label: 'Home', href: '/' }, { label: 'Calculators', href: '/calculators/' }, { label: 'BMI Calculator' }], 'https://bodymetricslab.uk/calculators/bmi/');
    const items = b.itemListElement as Array<Record<string, unknown>>;
    assert.deepEqual(items.map((i) => i.position), [1, 2, 3]);
    assert.deepEqual(items.map((i) => i.item), ['https://bodymetricslab.uk/', 'https://bodymetricslab.uk/calculators/', 'https://bodymetricslab.uk/calculators/bmi/']);
    assert.deepEqual(items.map((i) => i.name), ['Home', 'Calculators', 'BMI Calculator']);
  });
});

describe('Article (published articles only; the author is the editorial label, never a person)', () => {
  const a = articleNode({ url: 'https://bodymetricslab.uk/journal/x/', headline: 'Headline', description: 'Description', datePublished: '2026-11-01' });
  it('has the required fields and an Organization author', () => {
    assert.equal(a['@type'], 'Article');
    assert.equal(a.headline, 'Headline');
    assert.equal(a.datePublished, '2026-11-01');
    assert.equal(a.dateModified, '2026-11-01');
    assert.deepEqual(a.author, { '@type': 'Organization', name: 'BodyMetrics Lab Editorial Team' });
    assert.equal(a.image, undefined);
  });
  it('uses the update date and an image only when they exist', () => {
    const b = articleNode({ url: 'https://bodymetricslab.uk/journal/x/', headline: 'H', description: 'd', datePublished: '2026-11-01', dateModified: '2026-12-01', imageUrl: 'https://bodymetricslab.uk/_astro/x.webp' });
    assert.equal(b.dateModified, '2026-12-01');
    assert.equal(b.image, 'https://bodymetricslab.uk/_astro/x.webp');
  });
});

describe('safety: no invented credentials, reviews, ratings or contact details', () => {
  const forbiddenKeys = ['aggregateRating', 'review', 'reviewRating', 'rating', 'reviewedBy', 'medicalSpecialty', 'sameAs', 'address', 'telephone', 'founder', 'employee', 'award', 'hasCredential', 'ratingValue'];
  const collect = (value: unknown, found: Set<string> = new Set()): Set<string> => {
    if (Array.isArray(value)) value.forEach((v) => collect(v, found));
    else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) { found.add(k); collect(v, found); }
    return found;
  };
  it('no produced node uses any such property', () => {
    const nodes = [
      organizationNode(),
      websiteNode(),
      ...calculators.map((c) => calculatorNode({ url: `https://bodymetricslab.uk${c.href}`, name: c.label, description: c.description })),
      articleNode({ url: 'https://bodymetricslab.uk/journal/x/', headline: 'H', description: 'd', datePublished: '2026-11-01' }),
      webPageNode({ url: 'https://bodymetricslab.uk/', name: 'n', description: 'd' }),
    ];
    const keys = collect(nodes);
    for (const key of forbiddenKeys) assert.equal(keys.has(key), false, key);
    for (const n of nodes) assert.notEqual(n['@type'], 'Person');
  });
  it('the author of an article is never a Person', () => {
    const a = articleNode({ url: 'https://bodymetricslab.uk/journal/x/', headline: 'H', description: 'd', datePublished: '2026-11-01' });
    assert.notEqual((a.author as Record<string, unknown>)['@type'], 'Person');
  });
});

describe('serializeJsonLd', () => {
  it('produces valid JSON that cannot close a script tag', () => {
    const data = { '@context': 'https://schema.org', name: 'A </script><script>alert(1)</script> & B' };
    const out = serializeJsonLd(data);
    assert.doesNotMatch(out, /<|>|&/);
    assert.deepEqual(JSON.parse(out), data);
  });
  it('round-trips a full page graph', () => {
    const g = buildGraph({ pathname: '/', title: 'T', description: 'D' });
    assert.deepEqual(JSON.parse(serializeJsonLd(g)), g);
  });
});
