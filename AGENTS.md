# AGENTS.md — BodyMetrics Lab

## Project
Free health calculators + "Journal" articles, in English only, for Western readers. Static site on Cloudflare Workers. Domain: bodymetricslab.uk. Revenue plan: Google AdSense (later).

## Stack
Astro (static), TypeScript strict, plain CSS with variables, vanilla TS for calculators. No other frameworks or libraries without explicit approval.

## Structure
- src/pages: routes. src/layouts: page templates. src/components: UI parts.
- src/content/journal: articles as Markdown (one file per article).
- src/calculators: calculator logic, one file per calculator, with tests.
- src/styles: tokens.css and base.css (all colors/fonts/spacing live in tokens).
- legacy/: old site, reference only. Never edit or import.

## Rules
1. One task at a time. Only change files needed for the current task; list every file you changed.
2. No new dependencies, frameworks, or analytics without asking.
3. Never commit or push unless asked. Never touch `main`.
4. Every page: unique <title> and meta description, canonical URL, one H1, real URL (no hash routes, no ?lang=/?theme=).
5. Content must exist in the HTML at build time (no client-side-only content).
6. No health data is stored or sent anywhere. Calculators run in the browser.
7. Do not invent medical facts, formulas, statistics, or sources. If unsure, leave a clear TODO and tell me.
8. Accessibility: AA contrast in light and dark, 44px touch targets, keyboard navigation, labeled inputs.
9. Keep Cloudflare Worker name `body-metrics-lab`. Do not touch DNS or domain settings.
10. When finished, report: files changed, commands run, results, and anything you were unsure about.

## Articles (for later tasks)
Author is always "BodyMetrics Lab Editorial Team". Frontmatter: title, description, pubDate, updatedDate, image, imageAlt, relatedCalculator, draft. Each article ends with a Sources section.
