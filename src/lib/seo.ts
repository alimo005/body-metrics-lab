// Structured data (Schema.org JSON-LD) builders. Pure functions with no Astro imports, so they are unit-tested (seo.test.ts).
//
// Only facts the site actually states are used: the site name, URL, language, the public contact address, the page title and
// description, and for articles the headline, dates and the fixed author label "BodyMetrics Lab Editorial Team". Nothing here
// invents a company address, phone number, social profile, person, credential, review, rating or endorsement.
import { CONTACT_EMAIL, SITE_NAME, SITE_URL, calculators } from '../config/site.ts';
import { getReviewer } from '../config/reviewers.ts';
import type { ReviewerId } from '../config/reviewers.ts';

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
/** Logo file for the Organization node (the approved icon, 180 x 180, in /public). */
export const ORGANIZATION_LOGO = { path: '/apple-touch-icon.png', width: 180, height: 180 } as const;

export type JsonLdNode = Record<string, unknown>;
export type BreadcrumbItem = { label: string; href?: string };

export const absoluteUrl = (path: string): string => new URL(path, SITE_URL).href;

export type PageKind = 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage';

/** The more specific Schema.org page type for the pages that have one. */
export function pageKindFor(pathname: string): PageKind {
  if (pathname === '/about/') return 'AboutPage';
  if (pathname === '/contact/') return 'ContactPage';
  if (pathname === '/journal/' || pathname.startsWith('/journal/page/') || pathname === '/calculators/') return 'CollectionPage';
  return 'WebPage';
}

export function organizationNode(): JsonLdNode {
  return {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: { '@type': 'ImageObject', url: absoluteUrl(ORGANIZATION_LOGO.path), width: ORGANIZATION_LOGO.width, height: ORGANIZATION_LOGO.height },
    email: CONTACT_EMAIL,
    contactPoint: { '@type': 'ContactPoint', contactType: 'customer support', email: CONTACT_EMAIL },
  };
}

export function websiteNode(): JsonLdNode {
  return { '@type': 'WebSite', '@id': WEBSITE_ID, url: `${SITE_URL}/`, name: SITE_NAME, inLanguage: 'en', publisher: { '@id': ORGANIZATION_ID } };
}

export function webPageNode(input: { url: string; name: string; description: string; kind?: PageKind; mainEntityId?: string }): JsonLdNode {
  const node: JsonLdNode = {
    '@type': input.kind ?? 'WebPage',
    '@id': `${input.url}#webpage`,
    url: input.url,
    name: input.name,
    description: input.description,
    inLanguage: 'en',
    isPartOf: { '@id': WEBSITE_ID },
  };
  if (input.mainEntityId) node.mainEntity = { '@id': input.mainEntityId };
  return node;
}

/** BreadcrumbList for a page. Items with an href are links; the last item is the current page and uses `currentUrl`. */
export function breadcrumbNode(items: BreadcrumbItem[], currentUrl: string): JsonLdNode {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: index === items.length - 1 || !item.href ? currentUrl : absoluteUrl(item.href),
    })),
  };
}

/** Stable @id of a reviewer's Person node (the same node is referenced from the About page and from reviewed articles). */
export const personId = (id: ReviewerId): string => `${SITE_URL}/about/#${id}`;

/**
 * Person node for a medical reviewer. Only facts the About page itself displays: name, published job title, employer name,
 * medical school, photograph and the official profile as sameAs. No credential, award, specialty, rating or contact property.
 */
export function personNode(id: ReviewerId, imageUrl?: string): JsonLdNode {
  const r = getReviewer(id);
  const node: JsonLdNode = {
    '@type': 'Person',
    '@id': personId(id),
    name: r.name,
    jobTitle: r.title,
    worksFor: { '@type': 'Organization', name: r.workplace.organisation },
    alumniOf: { '@type': 'EducationalOrganization', name: r.education.institution },
    sameAs: r.profileUrl,
  };
  if (imageUrl) node.image = imageUrl;
  return node;
}

/** A free browser-based calculator (WebApplication). No rating, review or price other than "free". */
export function calculatorNode(input: { url: string; name: string; description: string }): JsonLdNode {
  return {
    '@type': 'WebApplication',
    '@id': `${input.url}#calculator`,
    name: input.name,
    url: input.url,
    description: input.description,
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    inLanguage: 'en',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: { '@id': ORGANIZATION_ID },
  };
}

/** Article node for a PUBLISHED Journal article. The author is the fixed editorial label, as an Organization (never a person). */
export function articleNode(input: { url: string; headline: string; description: string; datePublished: string; dateModified?: string; imageUrl?: string }): JsonLdNode {
  const node: JsonLdNode = {
    '@type': 'Article',
    '@id': `${input.url}#article`,
    headline: input.headline,
    description: input.description,
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    inLanguage: 'en',
    author: { '@type': 'Organization', name: 'BodyMetrics Lab Editorial Team' },
    publisher: { '@id': ORGANIZATION_ID },
    mainEntityOfPage: { '@id': `${input.url}#webpage` },
  };
  if (input.imageUrl) node.image = input.imageUrl;
  return node;
}

export interface GraphInput {
  pathname: string;
  title: string;
  description: string;
  /** Extra nodes (for example an Article on an article page). */
  extra?: JsonLdNode[];
  /** Present only when the page's own metadata confirms a medical review (ISO date): adds reviewedBy and lastReviewed. */
  review?: { reviewer: ReviewerId; date: string };
}

/**
 * The JSON-LD graph for one page: the home page carries the Organization and the WebSite; every page carries its WebPage
 * (or AboutPage, ContactPage, CollectionPage), and calculator pages also carry their WebApplication.
 */
export function buildGraph(input: GraphInput): { '@context': string; '@graph': JsonLdNode[] } {
  const url = absoluteUrl(input.pathname);
  const calculator = calculators.find((c) => c.href === input.pathname);
  const graph: JsonLdNode[] = [];
  if (input.pathname === '/') graph.push(organizationNode(), websiteNode());
  const page = webPageNode({
    url,
    name: input.title,
    description: input.description,
    kind: pageKindFor(input.pathname),
    mainEntityId: calculator ? `${url}#calculator` : undefined,
  });
  if (input.review) {
    page.reviewedBy = { '@id': personId(input.review.reviewer) };
    page.lastReviewed = input.review.date;
    graph.push(page, personNode(input.review.reviewer));
  } else {
    graph.push(page);
  }
  if (calculator) graph.push(calculatorNode({ url, name: calculator.label, description: calculator.description }));
  if (input.extra) graph.push(...input.extra);
  return { '@context': 'https://schema.org', '@graph': graph };
}

/** JSON for a <script type="application/ld+json"> block. "<", ">" and "&" are escaped so the data can never close the script tag. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}
