// Single source for site-wide facts and navigation, so the header, drawer,
// footer and pages can never disagree (DESIGN-SPEC.md sections 5, 6 and 11).

export const SITE_NAME = 'BodyMetrics Lab';
export const SITE_URL = 'https://bodymetricslab.uk';

/** Official public contact address (final, owner-approved). Defined once, used everywhere. */
export const CONTACT_EMAIL = 'contact@bodymetricslab.uk';

/**
 * Release switch (owner decision): while false, EVERY page carries `noindex`, robots.txt disallows crawling and the sitemap is
 * empty. It is now true (2026-11-26): every finished public page is indexable, robots.txt allows crawling and names the sitemap.
 * Only the 404 page keeps an explicit `noindex`.
 */
export const INDEXING_ENABLED = true;

export interface NavLink {
  label: string;
  href: string;
}

export interface Calculator extends NavLink {
  /** Short label used in the footer. */
  short: string;
  /** Slug used by the Journal's `relatedCalculator` field. */
  slug: 'bmi' | 'bmr-tdee' | 'body-fat';
  /** Small category tag on the card. */
  tag: string;
  /** One-line description for cards (must not claim more than the calculator does). */
  description: string;
  /** Call-to-action text on the card. */
  cta: string;
  icon: 'scale' | 'flame' | 'person';
}

/**
 * Version 1 calculators (owner decision 2026-11-25): BMI, BMR & TDEE and Body Fat only, in this order.
 * Ideal Weight, Macros and Water Intake are deferred to Version 2; their specifications are kept in DESIGN-SPEC.md and
 * CALCULATION-SPEC.md, and no page, card or link exists for them.
 */
export const calculators: readonly Calculator[] = [
  {
    label: 'BMI Calculator',
    short: 'BMI',
    slug: 'bmi',
    href: '/calculators/bmi/',
    tag: 'Body Mass Index',
    description: 'Calculate adult body mass index from height and weight, with the CDC weight category and the formula used.',
    cta: 'Calculate BMI',
    icon: 'scale',
  },
  {
    label: 'BMR & TDEE Calculator',
    short: 'BMR & TDEE',
    slug: 'bmr-tdee',
    href: '/calculators/bmr-tdee/',
    tag: 'Energy Expenditure',
    description: 'Estimate resting and total daily energy expenditure from age, sex, height, weight and activity category.',
    cta: 'Estimate energy needs',
    icon: 'flame',
  },
  {
    label: 'Body Fat Calculator',
    short: 'Body Fat',
    slug: 'body-fat',
    href: '/calculators/body-fat/',
    tag: 'Body Composition',
    description: 'Estimate body fat percentage from height and neck, waist and hip measurements.',
    cta: 'Estimate body fat',
    icon: 'person',
  },
];

export type CalculatorSlug = Calculator['slug'];
export const calculatorSlugs = calculators.map((c) => c.slug) as [CalculatorSlug, ...CalculatorSlug[]];

/** Header links after the Calculators dropdown (the drawer adds Home in front). */
export const mainLinks: readonly NavLink[] = [
  { label: 'Health Journal', href: '/journal/' },
  { label: 'About Us', href: '/about/' },
  { label: 'Contact', href: '/contact/' },
];

export const footerNavigation: readonly NavLink[] = [
  { label: 'Home', href: '/' },
  ...mainLinks,
];

export const footerLegal: readonly NavLink[] = [
  { label: 'Privacy Policy', href: '/privacy/' },
  { label: 'Terms of Use', href: '/terms/' },
  { label: 'Medical Disclaimer', href: '/medical-disclaimer/' },
];

/** Journal listing size (DESIGN-SPEC.md 9.1, owner-approved): nine articles per page. */
export const JOURNAL_PAGE_SIZE = 9;
