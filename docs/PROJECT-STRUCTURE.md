# BodyMetrics Lab: project structure (Version 1)

A static website built with Astro, strict TypeScript, plain CSS with design tokens, and vanilla TypeScript for the calculators. No framework, no database, no CMS. Hosted on Cloudflare (Worker `body-metrics-lab`, serving the built `dist/` folder).

## Version 1 scope
Three calculators: **BMI**, **BMR & TDEE** and **Body Fat**. Ideal Weight, Macros and Water Intake are deferred to Version 2: their specifications stay in `DESIGN-SPEC.md` and `CALCULATION-SPEC.md`, and the website has no page, card or link for them.

## Commands
| Command | Use |
|---|---|
| `npm run dev` | Local server at `http://localhost:4321` (also previews draft articles) |
| `npm test` | Unit tests (Node's built-in runner) |
| `npm run check` | Astro / TypeScript type check |
| `npm run build` | Build the static site into `dist/` (also validates published articles) |
| `npm run preview` | Serve the built site |

## Folders
| Path | What it holds |
|---|---|
| `src/pages/` | Routes: home, calculators index, the three calculators, `journal/` (list, pages 2+, article), About, Contact, Privacy, Terms, Medical Disclaimer, 404, `robots.txt.ts` |
| `src/layouts/BaseLayout.astro` | The page shell: head, theme script, header, main, footer |
| `src/components/` | Reusable parts (header, footer, cards, form controls, notices, pagination ...) |
| `src/calculators/` | The calculation logic, one pure TypeScript file per calculator, with tests. `fixtures/` holds the independently extracted Navy 2016 table data and its README |
| `src/scripts/` | The small browser scripts that connect each calculator page to its logic |
| `src/content/journal/` | One Markdown file per article, plus `_TEMPLATE.md` |
| `src/lib/` | Journal rules (`article-rules.ts`, tested) and the helpers that apply them (`journal.ts`) |
| `src/config/site.ts` | The single source of site facts: site name, contact email, the list of calculators, navigation, nine-per-page setting and the `INDEXING_ENABLED` release switch |
| `src/styles/` | `tokens.css` (all colours, fonts, spacing), `base.css`, `calculator.css`, `pages.css` |
| `src/assets/` | Brand logos and (later) article images |
| `docs/` | This documentation and the image register |
| `archive/` | Internal material that is not part of the site (unapproved article drafts) |
| `legacy/`, `design-reference/` | Old site and approved Stitch designs. Reference only; never edited or imported |
| `DESIGN-SPEC.md`, `CALCULATION-SPEC.md`, `AGENTS.md` | The design and scientific specifications and the project rules |

## Release control
`INDEXING_ENABLED` in `src/config/site.ts` is `true` since 2026-11-26: pages are indexable, `robots.txt` allows crawling and names the sitemap, and the sitemap lists every indexable canonical page. Setting it to `false` is the emergency off switch (every page `noindex`, `robots.txt` blocks crawlers, empty sitemap). The 404 page always keeps its own `noindex`. Structured data (JSON-LD) is built by `src/lib/seo.ts` and emitted by `Seo.astro` and `Breadcrumb.astro`.

## Adding articles
See `docs/PUBLISHING-ARTICLES.md`.

## Calculators
Their formulas, constants, limits and reference cases are defined in `CALCULATION-SPEC.md` and tested in `src/calculators/*.test.ts`. A change to a formula or constant is made in the specification first, then in the code and tests.

## Privacy by design
Calculators run in the browser; nothing is stored, logged or sent. The only thing the site stores is the light/dark theme choice in the browser's local storage. There are no forms that send data, no cookies set by the site, no analytics and no third-party scripts, fonts or images.

## Expected messages in the build log
While the site is `noindex` and has no published article, `npm run build` prints two harmless warnings: "No files found matching [!_]*.md" (the Journal folder has no article yet) and "No pages found!" from the sitemap tool (every page is noindex, so the sitemap is intentionally empty). Both disappear when articles exist and indexing is enabled. Any line that says `error` is a real problem.
