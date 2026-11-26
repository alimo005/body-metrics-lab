# DESIGN-SPEC.md — BodyMetrics Lab

Main design and implementation reference for the website. It records the owner's decisions made after reviewing the Google Stitch exports in `design-reference/`.

**Precedence.** Owner's latest decisions → `CALCULATION-SPEC.md` for every formula, constant, category, range, rounding rule and health statement → this file for design and UX → `AGENTS.md` (technical, security, Git, deployment and medical-accuracy rules still apply in full) → Stitch exports. The Stitch HTML is a visual and structural reference only. Never copy it into the project. Implementation stays on Astro, strict TypeScript, plain CSS and vanilla TS.

Status legend: **[Approved]** decided by owner · **[Derived]** derived by us from the approved design language, needs owner review · **[TODO]** unresolved, needs owner input. Nothing marked TODO may be invented during implementation.

---

## 1. Source of truth

1. The rendered Stitch screenshots (`screen.png`) and the Tailwind theme config inside each `code.html` are the visual source of truth.
2. The prose of `design-reference/**/DESIGN.md` is **not** authoritative for colours (it conflicts with the rendered designs: `#006654` / `#fbfdfc` there versus `#004c3e` / `#e6fff5` in the rendered designs). Its non-colour guidance (typography scale, spacing, 12-column grid, component behaviour) is used where it does not conflict with the screenshots.
3. The old site CSS (`legacy/`) and the current `src/styles/tokens.css` values (`#217569`, `#fafbf7`, …) are **superseded** by this file. `tokens.css` must be rewritten to the tokens below during implementation.
4. All 15 `DESIGN.md` copies in `design-reference/` are byte-identical (one system, "Clinical Clarity"). There are no per-page specs; page behaviour comes from the screenshots.

## 1.1 Version 1 scope (owner decision 2026-11-25) [Approved]

BodyMetrics Lab Version 1 is a complete website with **three calculators only: BMI, BMR & TDEE and Body Fat**. Ideal Weight, Macros and Water Intake are **deferred to Version 2** (not paused): their sections in this file (10.5, 10.6, 10.7), their Stitch exports in `design-reference/` and their sections in CALCULATION-SPEC.md are kept unchanged so Version 2 can build them without losing work. In Version 1 there is **no page, card, menu item, footer link, "Coming soon" entry or tool-count label for a deferred calculator**: the header dropdown, mobile drawer ("3 Tools"), footer, homepage, calculators index, About copy, Journal `relatedCalculator` values and sitemap all list only the three active calculators, from one list in `src/config/site.ts`. Wherever this file says "six calculators" or lists a deferred calculator in a page, the Version 1 reading is "the three active calculators" (sections 5, 6, 8, 9.3, 10.1, 10.8, 11 and 20.1 are read that way). The homepage preview cluster has three cards (BMI, Energy, Composition) with values produced by the real calculators from one stated example; the Hydration card is not shown.

**Release switch (owner decision):** the whole site stays `noindex` until the owner explicitly authorises publication. One constant, `INDEXING_ENABLED` in `src/config/site.ts` (default `false`), controls the robots meta tag of every page, the generated `robots.txt` (Disallow all while false) and the sitemap (empty while false). Flipping it to `true` makes every finished page indexable at once; it is the owner's decision and is not done in Version 1 development.

**Journal image rule (owner decision 2026-11-25):** `image` and `imageAlt` are optional until a licensed image has been approved. An article without an image shows a neutral token-coloured illustration with the related calculator's icon. No image is added before the owner has seen the candidate and its licence evidence.

## 2. Brand identity [Approved]

- Name: **BodyMetrics Lab**. Wordmark and logo never change; no alternative logos.
- **Approved logo asset:** `design-reference/brand-assets/BodyMetricsLab Health Tech Logo.png` (2508×627 px, RGB PNG, white background). It shows a heart outline containing a figure with arms raised and a pulse line, inside a rounded green square, followed by the wordmark "BodyMetricsLab" ("BodyMetrics" in dark green, "Lab" in a lighter green). It is the approved brand asset. Do not redesign, recolour, redraw or replace it, and do not introduce any alternative logo. The Stitch exports contain only placeholders and a broken image, so this file is the only logo source.
  - The inline mark in `src/components/Logo.astro` (a cross in a green square) and `public/favicon.svg` are placeholders from Task 1 and are superseded by this logo at implementation.
  - **Original asset (preserved):** `design-reference/brand-assets/BodyMetricsLab Health Tech Logo.png` is never edited, renamed or overwritten. At implementation a byte-identical master copy is stored in the project (for example `src/assets/brand/`) with its checksum recorded, and every variant is derived from it.
  - **Measured facts about the asset** (read-only analysis, 2026-11-22): 2508 × 627 px, 24-bit RGB with **no alpha channel**; a near-white, slightly noisy background (corner pixels about #FEFFFF); the non-white artwork occupies x 438–2082 and y 170–478 (about 1645 × 309 px); dominant colours (quantised samples): icon fill about **#087870**, "BodyMetrics" about **#084040**, "Lab" about **#088070**. These differ from the website's palette greens; the logo keeps its own colours.
  - **Variants to prepare at implementation** (technical adaptations only; the artwork, proportions, lettering and colours of the approved logo are not redrawn, retraced, re-typeset or altered):
    1. **Light-theme lockup:** trimmed to the artwork, **transparent background**, original colours. PNG with alpha (and WebP), at 1×/2×/3× of the header height.
    2. **Dark-theme lockup:** the same artwork on a transparent background. The icon is unchanged (the teal square reads on the dark background at about 3.5:1). The dark-green "BodyMetrics" lettering (about 1.6:1 on the dark background) cannot be read on dark surfaces, so it is mapped to the light text colour of the dark palette, and "Lab" to the dark-theme primary tint; the two-tone relationship is kept. **Alternative (if the owner prefers the original colours untouched):** keep the original lockup unchanged on a small light rounded panel behind the logo in dark mode. The owner chooses one option after seeing both on screen (section 21, item A4).
    3. **Icon-only mark:** a square crop of the rounded green square with the heart-and-figure glyph, transparent corners, for the favicon set (32, 48, 180, 192 and 512 px PNG, plus an `.ico` if needed) and for places too small for the lockup. It replaces the placeholder `favicon.svg`.
  - **No vector:** the logo is not converted to SVG unless the owner supplies a vector file (auto-tracing would change the artwork).
  - **Production checks:** remove the background with a colour-key and soft alpha edge (no white halo on the mint `#e6fff5` background and on the dark `#07140f` background); compare each variant against the original at 100% and 200% zoom; check crispness at 1×, 2× and 3× device pixel ratios; verify keyboard focus ring, 44px target and layout stability (explicit width and height to avoid layout shift). Logotypes are exempt from text-contrast rules, but legibility on both themes is still verified.
  - **Use:** the lockup already contains the wordmark, so the header shows the image with `alt="BodyMetrics Lab"` and does not repeat the name as live text beside it (the footer uses the same rule). Whether the drawer and footer use the lockup or the icon plus live text is decided at the implementation review.
  - The inline mark in `Logo.astro` (a cross in a green square) is a placeholder and is replaced. Any visible change to the approved logo needs the owner's approval (19.2 D-LOGO).
- Tone: calm, neutral, evidence-based, educational. Educational resource, not affiliated with or endorsed by CDC, WHO, NIH, EFSA, National Academies or any other organisation. (The word "independent" is not used until the owner confirms it reflects the platform's actual ownership and affiliations.)

## 3. Design tokens [Approved: light palette · Derived: dark palette]

All colours, fonts, spacing and radii live in `src/styles/tokens.css` as CSS custom properties. No hard-coded colours in components or pages.

### 3.1 Light palette (from the Stitch Tailwind config)

| Token | Value | Use |
|---|---|---|
| `--color-bg` | `#e6fff5` | page background (main mint) |
| `--color-surface` | `#ffffff` | cards, panels, inputs on cards |
| `--color-surface-low` | `#dff9f0` | header, footer, tinted bands, result wells |
| `--color-surface-mid` | `#d9f4ea` | inputs, toggle tracks, secondary wells |
| `--color-surface-high` | `#d4eee4` | pressed or hover wells |
| `--color-surface-highest` | `#cee8df` | dividers on tinted areas, bar tracks |
| `--color-on-surface` | `#081f1a` | body text and headings |
| `--color-on-surface-variant` | `#3f4945` | secondary text |
| `--color-outline` | `#6f7975` | control borders (see 3.5) |
| `--color-outline-variant` | `#bec9c4` | decorative card borders (use at about 40% alpha, as in Stitch) |
| `--color-primary` | `#004c3e` | primary buttons, links, headings accents, active states |
| `--color-on-primary` | `#ffffff` | text on primary |
| `--color-primary-hover` | `#006654` (Stitch `primary-container`) | button hover |
| `--color-on-primary-container` | `#90e1ca` | text on dark-green areas |
| `--color-secondary` | `#006b59` | secondary accents, icons |
| `--color-secondary-container` | `#98f4db` | pills, active chips, bar highlight |
| `--color-primary-fixed` | `#a1f2db` | hero glow, soft highlights |
| `--color-primary-fixed-dim` | `#85d6bf` | chart/bar secondary fills |
| `--color-error` / `--color-error-container` / `--color-on-error-container` | `#ba1a1a` / `#ffdad6` / `#93000a` | validation errors only |
| `--color-tertiary` | `#3c4543` | neutral accents (e.g. third macro bar) |

Stitch's remaining Material-style tokens (`inverse-*`, `*-fixed-variant`, `surface-tint`, `surface-dim`, `surface-bright`) are **not** carried over unless a component needs one. Do not add unused tokens.

### 3.2 Dark palette [Derived; adopted for implementation, see 19.1]

Same hue family and hierarchy as light, inverted. The `#17937c` primary from the DESIGN.md prose is **rejected** because white text on it is only 3.82:1.

| Token | Dark value |
|---|---|
| `--color-bg` | `#07140f` |
| `--color-surface` | `#0e211b` |
| `--color-surface-low` | `#0b1b16` |
| `--color-surface-mid` / wells and inputs | `#163029` |
| `--color-surface-high` | `#1c3a31` |
| `--color-surface-highest` | `#244a3f` |
| `--color-on-surface` | `#e8f5f0` |
| `--color-on-surface-variant` | `#a4bdb4` |
| `--color-outline` (control borders) | `#5a8a7c` |
| `--color-outline-variant` (decorative) | `#1f3f35` |
| `--color-primary` (buttons, accents, links) | `#5fd4b8` |
| `--color-on-primary` (text on primary buttons) | `#04140f` |
| `--color-primary-hover` | `#85d6bf` |
| `--color-secondary` | `#7cd7bf` |
| `--color-secondary-container` (pills) | `#14443a` with text `#a1f2db` |
| `--color-error` | `#ffb4ab` |

### 3.3 Contrast verification

Computed with the WCAG 2.x relative-luminance formula before writing this file.

| Pair | Ratio | Requirement | Result |
|---|---|---|---|
| Light: `#081f1a` on `#e6fff5` | 16.37 | 4.5 | pass |
| Light: `#3f4945` on `#e6fff5` / on `#ffffff` | 8.88 / 9.33 | 4.5 | pass |
| Light: white on `#004c3e` | 9.98 | 4.5 | pass |
| Light: `#004c3e` on `#e6fff5` / `#dff9f0` | 9.50 / 9.01 | 4.5 | pass |
| Light: `#006b59` on `#ffffff` / `#dff9f0` | 6.47 / 5.83 | 4.5 | pass |
| Light: `#004c3e` on `#98f4db` | 7.75 | 4.5 | pass |
| Light: `#00725f` on `#98f4db` | 4.56 | 4.5 | pass but marginal. Use `--color-primary` for small text on pills. |
| Light: `#6f7975` on `#ffffff` / `#e6fff5` | 4.50 / 4.28 | 3.0 (UI components) | pass |
| Light: `#ba1a1a` on `#ffffff` | 6.46 | 4.5 | pass |
| Dark: `#e8f5f0` on `#07140f` / `#0e211b` / `#163029` | 16.80 / 14.98 / 12.59 | 4.5 | pass |
| Dark: `#a4bdb4` on `#07140f` / `#0e211b` / `#163029` | 9.42 / 8.40 / 7.06 | 4.5 | pass |
| Dark: `#04140f` on `#5fd4b8` (button text) | 10.43 | 4.5 | pass |
| Dark: `#5fd4b8` on `#07140f` / `#0e211b` / `#163029` | 10.39 / 9.26 / 7.79 | 4.5 | pass |
| Dark: `#5a8a7c` on `#0e211b` (control border) | 4.28 | 3.0 | pass |
| Dark: `#ffb4ab` on `#0e211b` | 9.88 | 4.5 | pass |
| Dark: white on `#17937c` (rejected) | 3.82 | 4.5 | **fail** |
| Dark: `#3d6a5d` on `#0e211b` (rejected as control border) | 2.73 | 3.0 | **fail** |

Every other colour pair introduced during implementation (pill text, bar segments, result badges, dark pill `#a1f2db` on `#14443a`, hover and disabled states) must be checked the same way and listed in the implementation report. Meaning must never rely on colour alone (see 14).

### 3.4 Typography [Approved]

Fonts: **Manrope** (headings, logo, metric numbers) and **DM Sans** (body, controls). Both are already installed as `@fontsource-variable/*`. Self-hosted, no Google Fonts request.

| Style | Font | Desktop size / line-height | Mobile size / line-height | Weight | Tracking |
|---|---|---|---|---|---|
| Display (home H1) | Manrope | 3.5rem / 4rem | 2.25rem / 2.75rem | 700 | -0.03em / -0.02em |
| H1 (calculator, journal, article) | Manrope | 2.5rem / 3rem | 1.75rem / 2.25rem | 700 (600 on mobile) | -0.025em / -0.015em |
| H2 | Manrope | 1.75rem / 2.25rem | 1.5rem / 2rem | 600 | -0.015em |
| H3 | Manrope | 1.25rem / 1.75rem | 1.125rem / 1.625rem | 600 | -0.01em |
| Body XL (intro) | DM Sans | 1.25rem / 1.875rem | 1.125rem / 1.75rem | 400 | 0 |
| Body L | DM Sans | 1.125rem / 1.75rem | 1.0625rem / 1.65rem | 400 | 0 |
| Body | DM Sans | 1rem / 1.6rem | same | 400 | 0.01em |
| Small | DM Sans | 0.875rem / 1.375rem | same | 400 | 0.01em |
| Label | DM Sans | 0.875rem / 1.25rem | same | 500 | 0.02em |
| Kicker / label-sm | DM Sans | 0.75rem / 1rem, uppercase | same | 600 | 0.04em |
| Metric number | Manrope | 3rem / 3.25rem | 2.5rem / 2.75rem | 800 | -0.03em |

Rules:
- Sizes scale with `clamp()` between mobile and desktop values; **[TODO]** tablet-specific steps are chosen at implementation and checked visually.
- All computed numbers use `font-variant-numeric: tabular-nums`.
- Body text is never below 16px; the 12–14px styles are for labels and metadata only.
- Reading measure in articles: 65–75 characters (740px column).
- One H1 per page, headings never skip levels.

### 3.5 Spacing, radius, elevation, borders [Approved from the Stitch config; borders Derived]

- Spacing scale: `--space-xs` 0.375rem · `--space-sm` 0.75rem · `--space-md` 1.25rem · `--space-lg` 2rem · `--space-xl` 3.5rem. Grid gutter 1.5rem (1rem on mobile). Page margin 3rem (1.25rem on mobile).
- Container: max **1280px**, centred. Article reading column 740px.
- Radius: 0.25rem (default), 0.5rem (`lg`), **0.75rem (`xl`) for buttons, inputs, cards and panels** as rendered in the Stitch screenshots, `9999px` for pills, toggles and badges. (The DESIGN.md prose suggests 16–24px for cards; the rendered designs use `rounded-xl` = 12px, so 12px wins.)
- Elevation: tonal layering, very soft shadows only: panels `0 4px 20px -2px rgb(8 31 26 / 0.06)`, overlays (dropdown, drawer) `0 12px 32px -4px rgb(8 31 26 / 0.12)`. Dark mode uses borders instead of shadows. No heavy drop shadows.
- Card border: 1px `--color-outline-variant` at about 40% alpha.
- **Control borders (accessibility adaptation).** Stitch renders inputs as borderless tinted wells. To meet the 3:1 non-text contrast requirement, inputs, selects and unselected toggles get a 1.5px `--color-outline` border while keeping the tinted well fill. This is a deliberate small deviation, to be confirmed visually by the owner.
- Focus ring (all interactive elements): 3px solid `--color-primary` with 2px offset; always visible, never removed. Dark mode uses `#5fd4b8` via the same token.
- Motion: 150–200ms transitions; the hero "ping" dot and arrow-slide animations are disabled under `prefers-reduced-motion: reduce`.

## 4. Responsive rules [Approved requirement · breakpoints Derived]

Desktop Stitch screenshots (about 1280–1600px wide) are the primary reference. Mobile and tablet layouts are **designed**, not shrunk copies. Only the mobile navigation drawer has a Stitch design.

| Name | Min width | Layout |
|---|---|---|
| Mobile (base) | 0 | single column, 1.25rem margin, 4-column fluid grid |
| Large phone | 36rem (576px) | two-column card grids where useful |
| Tablet portrait | 48rem (768px) | 2-column grids; calculator panels still stacked; header shows drawer |
| Tablet landscape / small laptop | 64rem (1024px) | desktop header; 12-column grid; calculator 5/7 split |
| Desktop | 80rem (1280px) | full 1280px container |
| Large screens | 100rem+ (1600px) | container stays 1280px, centred; backgrounds extend; no stretched text |

Mobile-first CSS using `min-width` queries, with CSS Grid and `clamp()`. No horizontal page scroll at any width from 320px up, and 200% text zoom must not break layouts.

Specific adaptations:
- **Header:** desktop nav from 64rem; below that, the hamburger and drawer (the existing `Header.astro` switches at 58rem; it is changed to 64rem so that iPad portrait uses the drawer, see 19.1).
- **Calculator pages:** below 64rem the input panel is stacked above the result panel (result immediately follows the inputs; no fixed bottom docking unless tested to keep inputs reachable). Two-field rows (height/weight, neck/waist) become one column below 36rem. Formula boxes scroll horizontally inside their own box only if unavoidable, and wrap otherwise.
- **Grids:** calculator cards 3 → 2 (from 48rem) → 1 columns; article cards 3 → 2 → 1; footer 4 → 2 → 1 columns.
- **Home hero:** two-column from 64rem; below that the preview-card cluster stacks under the copy and shows at most the BMI and body-fat cards on phones.
- **Touch targets:** at least 44×44px on every interactive element (checked on toggles, sliders' thumbs, icon buttons, footer links).
- **Test matrix** (each must be checked before a page is called done): 320, 375, 414 (phones) · 768×1024 and 1024×768 (iPad portrait/landscape) · 820×1180 and 1180×820 · 1280 · 1440 · 1920 · 2560 (large). Both themes at each.

## 5. Header and navigation [Approved]

Reference: header in every desktop screenshot and `Mobile Navigation — Open & Calculators Expanded/`.

**Desktop:** sticky, `--color-surface-low` background, 1280px container.
- Left: logo and wordmark (links to `/`).
- Centre/right items, in order: **Calculators** (dropdown) · **Health Journal** · **About Us** · **Contact** · **theme toggle** (icon button, last).
- Dropdown contents: BMI Calculator, BMR & TDEE Calculator, Body Fat Calculator, Ideal Weight Calculator, Macro Calculator, Water Intake Calculator. **There is no "View All Calculators" item** (owner decision, 2026-11-23). The Stitch exports have no desktop dropdown screenshot, so its visual follows the mobile drawer's expanded list and the shared overlay elevation. **[TODO]** owner to review it after implementation.
- Current page is marked with `aria-current="page"` and a visible active style.
- Must **not** contain: user/profile icon, login or register, language selector, "Clinical Grade" / "Validation" badges, the "Validation" link seen on the article export, a primary "All calculators" button, or any unrequested item.
- Identical on every page. Dropdown works by keyboard (Enter/Space toggles, arrows optional, Escape closes and returns focus), works without JavaScript where feasible, closes on outside click.

**Mobile (below 64rem):** hamburger button on the left, logo centre/left, theme toggle on the right. The hamburger opens a left drawer over a dimmed backdrop.
- Drawer items with icons: Home, **Calculators** (expandable, with a "3 Tools" badge (the count of active calculators) and chevron, showing only the active calculators), Health Journal, About Us, Contact.
- The active calculator is highlighted (tinted row with a left indicator and dot).
- Drawer footer: "Calculations run in your browser" pill (owner-approved wording), a Light/Dark segmented theme control, and the copyright line. The Stitch "Evidence-Based Biometric Engine" label and "v2.4" version tag are **omitted** (unverifiable and meaningless to users).
- Focus is trapped in the open drawer; Escape and the backdrop close it; focus returns to the hamburger; body scroll is locked while open; the drawer has `aria-expanded` / `aria-controls`.
- The Home item appears in the drawer only (the logo is the home link on desktop). The same list order is used wherever the nav is repeated.

**Theme toggle:** sun/moon inline SVG, accessible name "Switch to dark mode / light mode", 44px target. First visit follows `prefers-color-scheme`; choice stored in `localStorage` (key as in the current implementation) via a small inline script in `<head>` that sets `data-theme` before paint (no flash). No URL parameters. Works with storage blocked (falls back to system preference).

## 6. Footer [Approved]

Reference: footers of the Stitch exports. The exports disagree with each other (see 18), so this unifies them.
- Background `--color-surface-low`. 1280px container.
- Column 1: logo and wordmark plus one sentence: "Evidence-informed health calculators and clear health insights designed for real life.", then the official contact address as a `mailto:` link with a small decorative envelope icon: `contact@bodymetricslab.uk` (owner decision; the address comes from the single shared definition, section 11 Contact). The "Contact" entry in the Navigation column remains a normal link to `/contact/`.
- Column 2 **Calculators:** BMI, BMR & TDEE, Body Fat, Ideal Weight, Macro, Water Intake.
- Column 3 **Navigation:** Home, Health Journal, About Us, Contact.
- Column 4 **Legal & Medical:** Privacy Policy, Terms of Use, Medical Disclaimer.
- Below the columns, a divider, then the short educational-use disclaimer: "The calculators and content provided on BodyMetrics Lab are for informational and educational purposes only and do not constitute medical advice, diagnosis, or treatment. Always consult a qualified physician or healthcare provider regarding personal health questions."
- Copyright line: "© {current year} BodyMetrics Lab. All rights reserved." The year is computed at build time. The Stitch "Inc." and the hard-coded 2025/2026 are not used.
- Same footer on every page, including the contact address in column 1. The footer link is at least 44px high with a visible focus style and wraps without overflow at 320px. On narrow screens the footer stacks in one column and the address stays directly under the tagline.

## 7. Shared components

All as Astro components in `src/components/`, styled with plain CSS using only the tokens. Names are proposals; existing components (`Header`, `Footer`, `Logo`, `Seo`, `ThemeToggle`) are extended, not replaced.

| Component | Purpose / notes |
|---|---|
| `BaseLayout` (existing) | `<head>` with unique title, description, canonical, robots; header, `<main id="main">`, footer; skip link as the first focusable element |
| `Breadcrumb` | Home › Calculators › Name; Home › Journal; last item not a link, `aria-current="page"`; `<nav aria-label="Breadcrumb">` |
| `PageHero` | kicker pill + H1 + short description |
| `Kicker` / `Badge` / `Pill` | uppercase label; rounded-full |
| `Button` (primary, secondary/outlined, text link with arrow) | min 44px high; primary uses `--color-primary` |
| `CalculatorShell` | two-panel layout (inputs / results) with the stacking rules in 4 |
| `SegmentedToggle` | radio group styled as pill toggle (Male/Female, etc.; the Metric/Imperial toggle was removed on 2026-11-26): real `<input type=radio>` with labels, arrow-key navigation |
| `NumberField` | visible `<label>`, unit suffix, `inputmode="decimal"`, min/max, inline error text with `aria-describedby`, `aria-invalid` |
| `SelectField`, `RangeSlider` | native controls styled; slider paired with a numeric field |
| `ResultCard` | big metric number (Manrope metric style, `aria-live="polite"` region), label, classification badge, plain-language sentence |
| `ReferenceBar` | horizontal scale (BMI spectrum, macro ratio bar, dispersion range); each segment has a text label; marker has a text value |
| `FormulaBox` | monospace or Manrope formula in a tinted well; scrolls inside itself on narrow screens; formulas also written in text for screen readers |
| `SourceList` | official source name + external link (`rel="noopener noreferrer"`) |
| `Notice` | tinted box with icon: educational notice, privacy note, under-20 BMI notice |
| `GuideBanner` | "Related article" banner linking to the matching journal article |
| `Pagination` | journal listing pages: labelled navigation with Previous, page numbers and Next (9.1); shown only when more than one page exists |
| `Faq` | `<details>`/`<summary>` accordion |
| `CalculatorCard` | icon, title, one-line description, arrow link (whole card clickable) |
| `ArticleCard` | image, read time, date, title, excerpt, "Read article" link |
| `Prose` | article typography: headings, lists, tables, blockquote, code, figures |
| `Icon` (inline SVG set) | see 12 |

Privacy statement used consistently near inputs: "100% client-side: your data never leaves your device."

## 8. Homepage — `/` [Approved]

Reference: `BodyMetrics Lab - Homepage-Desctop/` (screenshot `screen.png`).

1. **Hero** (two columns): kicker pill ("Evidence-Informed Health Intelligence"), H1 "Understand your body. Make informed choices." with the second sentence in `--color-primary`, supporting paragraph, primary button "Explore Calculators" (scrolls to the calculators section, or `/calculators/`), three reassurance items (100% Free · No Registration · Private & Client-Side). Soft green glow background (`--color-primary-fixed` at low opacity), decorative only.
2. **Calculator preview cluster** (right): BMI, Energy (BMR/TDEE) and Composition (body fat) cards (Version 1: no Hydration card). Values are **illustrative only** and the cluster carries a visible caption "Sample demonstration values. Not real results and not personal health data." Each card shows a small "Illustrative" label. Values are static markup, never computed from user input. The cluster is `aria-hidden` for decorative duplicates or labelled as an example for assistive tech. **[Open item D-HERO]** The Stitch numbers (22.4, 1,840/2,350 kcal, 18.2%, 2.8 L) must be checked for internal consistency with the real formulas once those exist, or replaced with values the real calculators produce for a stated example.
3. **Sources and Methods strip** (kept, per owner): label "Sources and Methods", a short list of the sources actually used, and the non-affiliation statement "Educational resource. Not affiliated with or endorsed by these organizations." (no standalone "independent" until confirmed) Each name is shown (and linked) **only** when the corresponding calculator really uses it, and only after the formula or category has been verified. The Stitch list (WHO Guidelines, CDC Anthropometric Standards, Mifflin-St Jeor Equations, NIH Reference Models) was a draft. The vague items "CDC Anthropometric Standards" and "NIH Reference Models" are replaced by the specific documents in CALCULATION-SPEC.md 0.4: CDC (BMI), WHO (BMI), the National Academies (Dietary Reference Intakes for Energy, macronutrient and water reference values), EFSA (water), FAO (energy conversion factors) and the published equations used (Mifflin–St Jeor 1990; Hodgdon and Beckett 1984; Robinson 1983). Each is listed only if the corresponding feature ships.
4. **Calculators section:** kicker "Precision Health Tools" **[TODO: reword; "Precision" overclaims]**, H2 "Explore Our Health Calculators", sub-line "Simple tools. Clear results. Better understanding.", then the three active `CalculatorCard`s in one row of three (order: BMI, BMR & TDEE, Body Fat; Version 1), each with icon, small category tag, title, one-line description and arrow link text from the design ("Calculate BMI", "Estimate Body Fat", etc.). Descriptions must not claim more than the calculator does (the Stitch "for nutritional planning" and "based on standardized WHO clinical categories" wording is reviewed against sources).
5. **Health Journal section:** kicker "Evidence-Based Editorial", H2 "Explore Our Health Journal", intro sentence, "View All Articles" link to `/journal/`, then the **three most recent published articles**, generated at build time from the journal content collection (see 9.3). Nothing about specific articles is hard-coded. If fewer than three articles are published, show those that exist; if none, omit the whole section (no placeholder cards).
6. **Footer** (see 6).

Removed from the Stitch version: any claim of clinical validation; fabricated article titles/categories/read times (these now come from real content).

## 9. Journal and articles

### 9.1 Journal listing — `/journal/` [Approved]
Reference: `Health Journal (Desktop)/`.
- Breadcrumb (Home › Journal), kicker "Evidence-informed insights", H1 "Health Journal", one-sentence intro.
- The Stitch badge "Peer-reviewed physiological methodology" is **removed**.
- Grid of `ArticleCard`s: 3 columns desktop, 2 tablet, 1 mobile. Published articles, newest first (by `pubDate`), no categories, **paginated** (owner requirement) so listing pages never load an excessive number of articles: **9 articles per page** (3×3 on desktop; page size owner-approved, A8). **Behaviour (owner-approved):** with 1–9 published articles every article is listed on `/journal/` and **no pagination controls are shown**; when the **10th** published article is added, `/journal/page/2/` is generated automatically; the controls appear **only when there are more than 9 published articles**; articles are sorted by publication date, newest first, across all pages; and **every article always keeps its own individual URL and page** whatever page it is listed on. No manual code change is needed when articles are added or removed. Page 1 is `/journal/`; later pages are `/journal/page/2/`, `/journal/page/3/` … (trailing slashes; no `/journal/page/1/`). The article slug `page` is reserved. Each page has a unique title ("Health Journal – Page 2") and meta description and a self-referencing canonical; no infinite scroll and no JavaScript is needed. The `Pagination` component (a labelled "Journal pages" navigation with Previous, page numbers and Next, current page marked with `aria-current="page"`, 44px targets, tokens only) appears only when there is more than one page. The Stitch export has no pagination design, so it is derived from the existing design system. Each card: image (16:9, `alt` from `imageAlt`), read time badge, published date, title, excerpt (`description`), "Read article →". **No bookmark icon, no "Sample Content" chips, no category tags.**
- With zero articles: a short, plain empty state ("Articles are coming soon.") and the page stays `noindex` until real content exists.

### 9.2 Single article — `/journal/<slug>/` [Approved]
Reference: `Single Article Page — Desktop, Light Mode/`.
- Breadcrumb Home › Journal › title; H1; byline "BodyMetrics Lab Editorial Team"; "Published {pubDate}"; read time (computed from word count); "Updated {updatedDate}" shown only when it differs from `pubDate`.
- **"Last reviewed" / "Medically Reviewed" are not displayed** unless the owner confirms a real review process and real dates. AGENTS.md previously required "Last reviewed"; this is replaced by "Updated" (decided, see 19.1) unless the owner later confirms a real review process.
- Hero image (16:9) with caption from `imageAlt`.
- Body in a centred 740px column rendered from Markdown via the reusable template: numbered or plain H2 sections, lists, tables (BMI categories etc.; responsive wrap in a scroll container), formula boxes, blockquotes. The Stitch sections (measurement protocol cards, "BMI vs body fat", etc.) are examples of content, not a fixed template: the template supports whatever structure the Markdown provides.
- Optional "Calculate your BMI"-style callout generated from `relatedCalculator`, linking to the matching calculator page.
- Optional FAQ (only when the article has real FAQ content) rendered as `Faq`.
- **Sources section (required, structured).** Every health article ends with a final H2 titled exactly **"Sources"**, placed after the body and before the closing notice and the back link. It is an ordered list. Each entry has: (1) the organisation or authors, (2) the title, (3) the publisher or journal and the year, and (4) a link to the reference (`https://…`, external, `rel="noopener noreferrer"`), with the access date for web pages ("Accessed 22 November 2026"). Rules:
  - List only references actually used in that article; every number, formula, category and health statement in the article traces to an entry. No decorative or padding references.
  - Prefer official and primary sources (CDC, WHO, NIH, the National Academies, EFSA, FAO and the original papers). A secondary source (review, commentary) is allowed only when it is labelled "(secondary source)" in its entry.
  - Where the article relies on a calculator, the entry matches the sources on that calculator's page (`relatedCalculator`).
  - Link text is the title of the reference, never "click here". A reference that cannot be linked is given with its full citation and, where available, a DOI or PubMed link.
  - Keep the list short and readable: one line to two lines per entry; no grouping needed unless there are more than eight entries (then "Official guidance", "Research papers" and "Other" sub-groups are allowed).
  - **Build check (recommended, implemented with the content collection):** an article whose last H2 is not "Sources", or whose Sources list contains no external link, fails validation; a `draft: true` article is exempt.
- Educational notice and "← Back to Health Journal" link.
- Share buttons, comments, bookmarks, newsletters: none.

### 9.3 Content collection [Approved]
- `src/content/journal/*.md` (Astro content collection with a typed schema): `title`, `description`, `pubDate`, `updatedDate` (optional), `image`, `imageAlt`, `relatedCalculator` (one of the active calculator slugs: `bmi`, `bmr-tdee`, `body-fat`), `draft` (boolean). Author is fixed to "BodyMetrics Lab Editorial Team" by the template, not per-file.
- `draft: true` articles are excluded from the listing, the homepage, the sitemap and the build output routes.
- Published = `draft: false` (and `pubDate` not in the future at build time decided: future-dated posts are hidden, see 19.1).
- Homepage and listing both call one shared helper that sorts by `pubDate` descending, so a new Markdown file appears in the list, on the home page (if among the latest three) and in the sitemap with no other edit.
- The Stitch example slugs (`how-to-calculate-bmi`, `understanding-daily-hydration`, `macronutrient-distribution-guide`, `body-fat-percentage-vs-bmi`) are placeholders, not decisions; real slugs come from the real article files.
- **File and slug rules:** the file name is the slug (lowercase kebab-case, unique); the slug `page` is reserved because of the pagination routes. Front matter is validated at build time and an invalid article fails the build with a clear message: required fields as above; `relatedCalculator` is one of the active calculator slugs; `image` (optional in Version 1, see 1.1) points to a file under `src/assets/journal/` (processed by Astro's built-in image handling) and `imageAlt` is then required; the body's last H2 is "Sources" (9.2).
- **Automatic effects of adding a file:** the article page (shared template), the Journal listing and its pagination, the homepage's three latest published articles (8), the sitemap entry (published, indexable articles only), and the calculator page's related-article banner (the most recent published article whose `relatedCalculator` matches the calculator; none means the banner is omitted). No HTML is created by hand for any article. The workflow is in 23.2.
- Article image optimisation: see 12.

## 10. Calculator pages

### 10.1 Shared structure [Approved]
Applies to all six calculators (`/calculators/<slug>/`). Order:
1. Breadcrumb, kicker pill, **H1 and a short two-sentence explanation**.
2. **Calculator**: inputs panel and result panel (with the privacy note, Calculate and Reset buttons).
3. **Formula or methodology** (formula boxes, short method notes, official source links).
4. **Limitations and important interpretation notes** (including the educational notice).
5. **Related educational article** banner (`GuideBanner`) linking to a real journal article. Rendered only when that article exists and is published. **[TODO]** until articles exist, omit the banner (never link to a missing page).
6. **Short FAQ**, only if it adds information not already on the page.

Content rules: no repeated disclaimers (one educational notice per page, plus the footer), no filler or marketing text, pages as short as the content allows. The long "Clinical & Physiological Context" paragraphs in Stitch are condensed into "how to read the result" sentences inside the result panel and the limitations section. No "Clinical Gold Standard", "Biometric Engine", "Live Model Compute", or similar claims.

Behaviour (all calculators): runs in the browser; no data stored or sent; results update on Calculate (and live where designed); Reset restores defaults; invalid input shows an inline, associated error and no result; results are announced in an `aria-live="polite"` region; all inputs labelled; unit toggle converts values sensibly and never silently changes the stored numeric input; calculation logic in `src/calculators/<slug>.ts` (pure functions, unit-tested), UI wiring in a small vanilla TS module. The page must contain its full content (headings, formulas, sources) in the HTML at build time; only the result values are filled in by script.

Initial result state: the result panel shows an empty-state prompt ("Enter your details and press Calculate.") or, if a default example is shown, it is labelled "Example". Stitch shows pre-filled demo numbers; those are **not** presented as the user's result.

All formulas, constants, categories, ranges, rounding rules, inputs and test cases are defined in `CALCULATION-SPEC.md`, which is binding. Where this file and `CALCULATION-SPEC.md` differ on a scientific point, `CALCULATION-SPEC.md` wins. Features it marks UNVERIFIED or HELD stay hidden and the page stays `noindex`. Nothing is invented.

### 10.1b Metric-only calculators (owner decision 2026-11-26, Version 1) — overrides every older mention of imperial units
BMI, BMR & TDEE and Body Fat use **metric units only** (height, neck, waist, hip in cm; weight in kg; energy in kcal/day). There is no Metric/Imperial toggle, no feet/inches/pounds field, no imperial instruction text and no other unit selector. Each field shows its unit as a suffix and in its label or hint. Fields accept English digits and a decimal point only. Body Fat additionally clears a field's error as soon as that field is edited and hides a previously shown result as soon as any input changes (CALCULATION-SPEC.md 4.5). BMI and BMR & TDEE keep their approved behaviour (results update on Calculate). The Stitch screens that show a Metric/Imperial toggle remain visual references for layout only; the toggle itself is not built. Rules and rationale: CALCULATION-SPEC.md 1.3.

### 10.2 BMI — `/calculators/bmi/` (`Adult BMI Calculator (Desktop)/`) [Approved · numbers per CALCULATION-SPEC.md section 2]
- H1 "Adult BMI Calculator", kicker "Anthropometric metrics", intro: for adults aged 20 and older; runs in the browser.
- Inputs, in this order: **Sex** (kept from the design); **Age (years)**; Height (cm); Weight (kg); Calculate and Reset; privacy note.
- **Sex does not affect the result.** One short line beside the control: "Sex does not change the adult BMI result."
- **Age under 20:** no BMI number or category. Show only the under-20 notice (children and teens need age- and sex-specific BMI-for-age percentiles; adult categories do not apply) with a link to CDC's child and teen BMI calculator.
- Result panel: BMI value (one decimal, kg/m²), CDC category badge (icon + text), the category threshold line, the reference spectrum bar (Underweight / Healthy Weight / Overweight / Obesity, marker labelled with the BMI value; classes 1–3 shown as sub-labels of Obesity) and one sentence with the healthy-weight range for the entered height ("about 58.7–79.2 kg for 178 cm").
- **Boundary explanation (new):** when the rounded displayed BMI would fall in a different category than the exact BMI, a short neutral note appears under the result: "BMI is shown rounded to one decimal. Your category is determined from the exact, unrounded BMI (24.959)." No alarm styling; it uses the info-notice component. The category itself is always computed from the exact value (CALCULATION-SPEC.md 2.6).
- Initial state: empty-state prompt, not a pre-filled result.
- Formula shown (with CDC and WHO links): `BMI = weight (kg) / [height (m)]²`. The US customary formula card was removed with the metric-only policy.
- Methods note (one sentence): categories use the exact BMI and can differ at a boundary from CDC's rounded weight table (CALCULATION-SPEC.md 2.7).
- Limitations: short list from CALCULATION-SPEC.md 2.9. No pregnancy or ethnicity statement.
- Related article banner (only when the article exists).

### 10.3 BMR & TDEE — `/calculators/bmr-tdee/` (`BMR & TDEE Calculator (Desktop)/`) [Approved layout · numbers per CALCULATION-SPEC.md section 3]
- Keeps the approved Stitch layout: inputs panel on the left, results panel on the right (stacked on phones and tablets). H1 stays "BMR & TDEE Calculator". **Owner decision 2026-11-23:** the Stitch "Step 1 of 2" label is removed (there is only one step); where section headings are needed they are **"Your Details"** (inputs panel) and **"Your Estimated Results"** (results panel).
- Inputs: unit toggle, sex, **age (whole years; results for 19–78)**, height, weight, and an **activity select with four options: Inactive, Low Active, Active, Very Active**. The Stitch dropdown wording ("Moderately Active, exercise 3–5 days/wk") and all multipliers are replaced.
  - **Activity control (owner decision 2026-11-23):** a **native `<select>`** with **no preselected category**. Its first (disabled-for-calculation) option is the placeholder **"Choose an activity category"**; the four options carry only the short names. Below the select, a **dynamic description** (a polite region tied to the select by `aria-describedby`) updates when the selection changes and shows, for the chosen category, the **plain-language definition from the National Academies source (CALCULATION-SPEC.md 3.5)** and its **PAL range** (for example "PAL 1.53 to less than 1.68"). Before a choice is made the description area shows a short neutral prompt. No scoring questionnaire, no exercise-days-per-week wording, no multipliers. **PAL note (owner decision 2026-11-23)**, a short small-print paragraph directly below the description and tied to the select by `aria-describedby`: "These categories are general guidance, not a precise measurement of your own activity. The National Academies report that no valid, reliable tool currently exists to classify an individual's physical activity level (PAL) accurately. They are not the same as weekly physical activity guidelines." If Calculate is pressed with the placeholder still selected, an inline error "Choose an activity category." appears next to the select and no result is shown.
- **Result panel:** the big result card shows **"Estimated total energy expenditure (TEE)"** (the primary result); the sub-card shows **"Estimated resting energy expenditure (REE), Mifflin–St Jeor"** (secondary). Both labelled "estimate". The two are independent: changing the activity category changes only TEE.
- **Removed from the Stitch design (stays removed):** the "daily metabolic partitioning" bar and the BMR / activity / TEF percentage chips, plus the "Maintenance energy" tag and any calorie-target language.
- **Terminology line** (one sentence, under the REE card or in Methods): "Mifflin–St Jeor estimates resting energy expenditure (REE); it is not a measured basal metabolic rate (BMR)."
- **Estimation limits** (collapsible "Estimation limits" under the results, keeping the page uncluttered): the four points in CALCULATION-SPEC.md 3.7. The figures 339 kcal/day (men) and 246 kcal/day (women) are named precisely as the **root mean squared error (RMSE), equivalent to the standard error of the estimate (SEE)**, and worded as statistics of the model across the people studied, never as a guaranteed margin of error for the person using the calculator (wording in CALCULATION-SPEC.md 3.7; owner decision 2026-11-23: do not use the generic term "standard error").
- Methodology (below the calculator): the Mifflin–St Jeor equations for men and women; the eight National Academies equations in one compact table (rows: category; columns: men, women); the PAL cut-offs; sources S6 and S7 with links. No FAO/WHO/UNU multiplier explanation is needed.
- If age is outside 19–78: the notice from CALCULATION-SPEC.md 3.3 replaces both results. The National Academies equations apply to adults 19 and over, but the approved eligibility for this calculator is **19–78 inclusive for both REE and TEE** and must be enforced and tested (ages 18, 19, 78, 79), never extended.
- **Heading outline (owner request 2026-11-23):** H1 page title; H2 "Your Details", "Your Estimated Results" and "Formulas and method"; H3 for the method groups (REE, TEE, Activity categories) and the "Sources" list; H4 for the "Men" and "Women" titles of the two REE formula boxes (the shared `FormulaBox` takes an optional heading level, default 3, so existing pages are unchanged). Table captions are not headings.
- **Validation priority (owner decision 2026-11-23):** (1) an **invalid age** (empty, text, decimal, below 1 or above 120) shows an inline age error and no result; (2) a **valid whole age outside 19–78** (1–18 or 79–120) shows the eligibility notice and **no results, and the notice takes priority over any other field error** (height, weight, activity), exactly as the under-20 notice does on BMI; (3) for ages 19–78, the other fields are validated and errors shown inline (focus moves to the first invalid field); (4) otherwise both results are shown.
- **Whole-number ages only in the interface (owner decision 2026-11-23).** The age field accepts whole numbers; `20.5` is an age error. The internal calculation functions may accept decimal ages solely to reproduce the published reference cases TE2 and TE3 (CALCULATION-SPEC.md 3.9); the validator used by the page never lets a decimal age reach them.
- **Approved copy (owner, 2026-11-23; used verbatim):**
  - Kicker: "Energy expenditure estimates".
  - H1: "BMR & TDEE Calculator".
  - Introduction: "Estimate your daily energy needs using your age, height, weight and activity category. For adults aged 19–78, this calculator estimates total energy expenditure (TEE) using the National Academies 2023 equations and resting energy expenditure (REE) using the Mifflin–St Jeor equations."
  - Meta title (the page `<title>`): "BMR & TDEE Calculator | BodyMetrics Lab". Meta description: "Estimate daily energy expenditure (TEE) and resting energy expenditure (REE) with National Academies 2023 and Mifflin–St Jeor equations. For adults aged 19–78."
  - Panel headings, if needed: "Your Details" and "Your Estimated Results".
- **REE verification disclosure (owner decision 2026-11-23), in the methodology section as a short plain note:** the Mifflin–St Jeor equations were checked against the published abstract of the original 1990 paper; the original full text was not directly accessible during verification; and the kcal/day unit is supported by later peer-reviewed publications. The page must not imply that the full original paper was reviewed and must not say the 1990 paper itself states the unit.
- **Left out (owner decisions):** the optional "most reliable equation" claim (CALCULATION-SPEC.md 3.3, S18); TEF percentages; the energy-partition bar and its chips; the "Live Preview" tag; "Maintenance energy"; the "Clinical & Physiological Context" panel; "RMR × PAL" or any multiplier text; the "Sample Demonstration Preview" line; and any related-article banner until an article exists.

### 10.4 Body fat — `/calculators/body-fat/` (`Body Fat Calculator (Desktop)/`) [Approved · numbers per CALCULATION-SPEC.md section 4]
- Keeps the approved layout (inputs panel, estimate panel with ring and fat/lean cards, methodology, protocol card, guide banner, notice).
- **Inputs by sex:** **Male:** height, neck, waist (at the navel); **Female:** height, neck, natural waist, **hip**. The hip field appears only for Female and is required then. Weight is optional for both (only for fat and lean mass). Each measurement field has short help text from CALCULATION-SPEC.md 4.4; the "Measurement Protocol" card in the design is kept and uses the verified instructions only. An optional "where to measure" illustration needs separate owner approval (not included now).
- **Method name on the page:** "Hodgdon and Beckett (1984) circumference method, developed for the US Navy". It is never called the current official US Navy standard.
- Result panel: estimated body fat percentage (one decimal) with the ring graphic as a decoration (ring carries a text equivalent); fat mass and lean mass cards if weight was entered. **No "Fitness Standard" badge, no category, no ring colour bands, no "within healthy parameters" line, no accuracy or error percentage, no "±3% of DEXA" claim.**
- Methodology: the two equations in inches with the cm-to-inch conversion shown, "base-10 logarithm", with the citation "Hodgdon and Beckett, 1984, Naval Health Research Center reports 84-11 and 84-29" and the measurement instructions credited as "adapted from the US Navy Body Composition Assessment guide (2016 edition)". The page must not state that the original reports were consulted. **Verification status line (required, in Methods):** "These equations were checked by reproducing the lookup tables of the official US Navy Body Composition Assessment guide (2016 edition). The text of the original 1984 reports was not directly accessible. This is the classic 1984 circumference method, not the current official US Navy standard."
- Validation messages: neck larger than waist, missing hip, implausible result (CALCULATION-SPEC.md 4.5; the approved separate male and female domain messages are listed there).
- **Task 5 decisions and approved copy (owner, 2026-11-24).**
  - **Behaviour:** results appear only after Calculate (same pattern as BMI and BMR & TDEE); Reset clears results and errors. Height, neck, waist and hip are in cm and weight is in kg (metric-only, owner decision 2026-11-26). There is **no age input**; the page states the eligibility policy (below). The weight field is optional ("Weight (optional)"). The hip field appears only when Female is selected; the waist label and help text change with sex. The Reset control is an icon button with the accessible name "Reset". The result ring fills from 0 to 100 percent in one colour with no bands; it is decorative and its text equivalent is "Estimated body fat: 15.7 percent." The two equation boxes stack in one column. The Stitch "Clinical & Physiological Context" card and the guide banner are omitted (no related article yet).
  - **Kicker:** "Circumference-based estimate". **H1:** "Body Fat Calculator". **Introduction:** "Estimate your body fat percentage from your height and your neck, waist and, for women, hip measurements. This calculator uses the Hodgdon and Beckett (1984) circumference method, developed for the US Navy." (Owner revision 2026-11-24: the sentence "For adults aged 18 and older." was removed from the introduction because the eligibility note below the inputs says it in full; the meta description keeps it.)
  - **Eligibility note under the inputs:** "For adults aged 18 and older. This is a website eligibility policy, not a statement that the method is validated for every adult."
  - **Title:** "Body Fat Calculator" (the layout appends " | BodyMetrics Lab"). **Meta description:** "Estimate body fat percentage from height, neck, waist and hip measurements (Hodgdon and Beckett 1984 circumference method). For adults aged 18 and older."
  - **Panel headings:** "Your Measurements" and "Your Estimated Results". **Empty state:** "Enter your measurements and press Calculate."
  - **Field help (adapted from the 2016 guide; not the military procedure):** Height: "Standing, without shoes." Neck: "Just below the larynx (Adam's apple), on bare skin." Waist, men, labelled "Waist (abdomen at the navel)": "Across the navel, arms down at your sides, at the end of a normal relaxed breath out." Waist, women, labelled "Natural waist": "At the narrowest part of the abdomen, usually about halfway between the navel and the lower end of the breastbone." Hip (women): "Around the fullest part of the buttocks as seen from the side, over thin fitted clothing." Weight: "Only used to estimate fat mass and lean mass."
  - **Result labels:** "Estimated body fat percentage" with an "Estimate" tag; "Estimated fat mass" (note "Weight × body fat percentage"); "Estimated lean mass (not fat)" (note "All body mass that is not fat. This is not the same as muscle mass."). Mass tiles are hidden when weight is empty.
  - **Methods:** introduction "The Hodgdon and Beckett (1984) circumference method, developed for the US Navy, estimates body fat from height and circumferences in inches. Centimetres are converted with inches = cm ÷ 2.54, and all logarithms are base 10."; both equations (CALCULATION-SPEC.md 4.3), "The hip is used only for women and is added to the waist before the neck is subtracted.", "Fat mass = weight × body fat percentage ÷ 100; lean mass = weight − fat mass (from the unrounded percentage)."; citation "Hodgdon and Beckett, 1984, Naval Health Research Center reports 84-11 and 84-29."; the verification statement with its two added sentences (CALCULATION-SPEC.md 4.3); the Navy-procedure difference sentence; the measuring card ("Adapted from the US Navy Body Composition Assessment guide (2016 edition). These are not the military procedure.", with a suggestion, not a rule, to measure twice and use the average).
  - **Limitations:** "A circumference equation gives an estimate. Individual results vary, and it is not a body-composition scan." "The method was developed for military screening using measurements of Navy personnel." "Results depend on how carefully the measurements are taken." **Educational notice:** "Educational estimate only. This calculator gives a mathematical estimate for general information. It is not a medical assessment, and it does not say whether a body-fat percentage is low, healthy or high."
  - **Sources:** the Navy guide (2016) and the two 1984 reports (DTIC), the latter labelled "cited, not directly accessible during verification". No cell counts on the page.
  - **Heading outline:** H1; H2 "Your Measurements", "Your Estimated Results", "Formulas and method", "Limitations"; H3 for method groups and "Sources"; H4 for the equation box titles.

### 10.5 Ideal weight — `/calculators/ideal-weight/` (`Ideal Weight Calculator (Desktop)/`) [Approved · numbers per CALCULATION-SPEC.md section 5]
- Inputs: unit toggle, sex, height (adults 5 ft / 152.4 cm and above). No age field.
- **Comparison layout (revised; owner decision):** **two formula cards, Devine (1974) and Robinson et al. (1983)**, side by side on desktop and tablet landscape, stacked on tablet portrait and phones. No empty third or fourth card, and no placeholder for Miller or Hamwi. Each card shows the formula name, the kg value (large) with the lb value beneath, and a one-line source label:
  - Robinson: "Original 1983 paper".
  - Devine: "As reported in a peer-reviewed review; the original 1974 paper was not consulted."
- Below the cards, the design's range bar is kept. Its title reads **"Range between the two formula estimates"**; it shows the lower and the higher of the **two** estimates with end labels taken dynamically from the actual formula names (never hard-coded). A short line beside it says: "This is only the spread between two historical formulas, not a recommended or healthy weight range." It is never styled or worded as a healthy, target or recommended range. The design's "healthy BMI weight span" row stays.
- Intro and notice: "Historical height-based estimates, not personalised medical targets or weight goals." The Stitch pharmacology framing ("Gentamicin & Clearance Base", "Clinical Gold Standard") stays removed.
- Methodology card: both equations with the primary or secondary label; the "Clinical assumptions" card keeps only the height-over-5-ft rule. Height below 5 ft: no number, with an explanation.
- Layout must be checked on one-card-wide screens: the cards stack without leaving empty space.

### 10.6 Macros — `/calculators/macros/` (`Macro Calculator (Desktop)/`) [Approved layout · numbers per CALCULATION-SPEC.md section 6]
- Keeps the approved Stitch layout. Inputs: daily energy (kcal/day; no "recommended" range label); presets (the three below plus Custom); three ratio sliders each with a numeric field; a live "Total: 100%" status that blocks the result unless the total is exactly 100.
- **Presets (labels follow the Stitch buttons):** Balanced 30P/45C/25F; High Protein 35P/45C/20F; Moderate Carb 25P/45C/30F; Custom. The sub-label under the presets reads "Illustrative calculation presets" (not "AMDR aligned"). Editing a slider switches the selection to Custom.
- Slider captions show the adult reference ranges (Protein 10–35%, Carbohydrate 45–65%, Fat 20–35%) with the required caveat (CALCULATION-SPEC.md 6.6) available in the methodology card and as a short footnote near the sliders. A neutral info line appears if a share is outside its range. No preset is called optimal, healthy or recommended.
- Result: grams per day for protein, carbohydrate and fat, energy per macro, the proportion bar, and the 4/4/9 kcal/g factors. No calorie target logic.
- Notice: individual needs vary; this is a calculation, not a diet plan.

### 10.7 Water intake — `/calculators/water-intake/` (`Water Intake Calculator (Desktop)/`) [Approved layout · numbers per CALCULATION-SPEC.md section 7]
- Inputs: display unit (L / mL / US fl oz) and sex only. **There is no age input** (owner decision; the Stitch "Age cohort" dropdown is removed and not replaced). A clear notice near the inputs and results reads exactly **"For adults aged 19 and over."** **Removed from the design:** the guideline-framework selector (both references are always shown), the Pregnancy and Lactation options, and the climate and exertion modifier.
- **Result area:** two side-by-side reference cards, "EFSA (European Food Safety Authority)" and "US National Academies", each with the value for the chosen sex and unit and the line "total water: drinking water, other beverages and food". The Stitch single big card and the 75/25 partition bar are replaced by these two cards. On narrow screens the cards stack. Under them, one short sentence: "These are separate reference values from different organisations and are not interchangeable, and they are not individual requirements." The approved caution follows: "Fluid needs vary between individuals. If you have a medical condition that affects fluid balance, consult a qualified healthcare professional."
- Optional small line under the US card only: "about 3.0 L (men) / 2.2 L (women) from beverages including drinking water" (owner to decide; no EFSA split exists).
- Cards kept (revised content): a methodology card with the basis of each reference (CALCULATION-SPEC.md 7.4) and the stated conditions (moderate temperature and activity for EFSA; higher needs for activity and heat per the US report); sources with links.
- Removed from the design: the "8-glass rule" discussion, osmotic and ADH explanations, overdrinking and solute-load figures, and medical-condition lists.

### 10.8 Calculators index — `/calculators/` [Approved: no Stitch design; derived]
Same breadcrumb/hero pattern as the calculator pages: kicker, H1 "Health Calculators", one-sentence intro, then the three active `CalculatorCard`s (same component as the homepage, 3→2→1 columns), then one short note on how the calculators work (browser-only, educational estimates) with the non-affiliation statement. No articles, no extra marketing.

## 11. Static pages (no Stitch design; built from this system) [Approved approach]

All use the `PageHero` pattern (breadcrumb, kicker, H1, intro) and the 740px prose column in `--color-surface` cards on the mint background. No new visual language. Until real content is approved each page stays `noindex`.

- **About Us — `/about/`** [Approved requirements; page copy is drafted at implementation and approved by the owner before release]. The page presents BodyMetrics Lab as a professional platform supported by a coordinated team, in the same visual language as the rest of the site (Stitch palette and tokens, Manrope headings, DM Sans body, shared cards, the approved logo, the global header, mobile drawer and footer). It stays `noindex` until the copy is approved.
  - **Structure:** `PageHero` (breadcrumb Home › About Us, kicker "About us", H1 "About BodyMetrics Lab", one-sentence intro), then exactly five sections in this order, each with an H2:
    1. **Who We Are:** one short paragraph. A free educational health website with the three active calculators and the Health Journal; the calculators run in the browser and nothing is stored or sent. The word "independent" is not used until the owner confirms it accurately reflects the platform's actual ownership and affiliations.
    2. **Our Mission:** one or two sentences: help people understand health numbers through clear explanations, transparent methods and reliable sources. No promise of outcomes.
    3. **Our Team:** a one-line introduction, then the **required statement** (below) in a highlighted card, then the **three role cards** (below). Presented as three coordinated parts of one team: the three cards sit in one shared group with a subtle connector (a thin line or joined header band, in tokens), with no hierarchy, reporting lines or organisation chart.
    4. **Our Editorial Process:** a short numbered sequence describing how educational content is made before publication (below).
    5. **Our Commitment to Accuracy and Transparency:** three or four short points (below), then a single link to the Contact page.
  - **Required statement (owner-approved, verbatim, do not edit, extend, shorten or paraphrase):**
    > "The BodyMetrics Lab platform and its educational reports are developed, written, and reviewed by specialists from the BodyMetrics Lab team, with a focus on scientific accuracy, transparent methodologies, and clear, practical health information."
    This replaces the earlier draft statement. It appears once, in section 3. It is the only statement about who builds, writes and reviews the content; it is the owner's statement and is not independently verifiable by us.
  - **The three role cards** (clean professional cards using the shared card component; one inline SVG icon each; title; one sentence taken from the owner's wording):
    | Role | Responsibility (use the owner's meaning, lightly edited for style only) | Icon (inline SVG, neutral) |
    |---|---|---|
    | Software Development Team | Builds, maintains and improves the website, its calculators and its technical functionality. | code brackets |
    | Health Content Writers | Research, prepare and write educational health articles and reports using reliable scientific references. | pen and document |
    | Specialist Content Reviewer | Reviews articles and reports, checking clarity, consistency, source quality and the accurate presentation of scientific information. | checklist with magnifier |
    Icon rules: neutral, non-medical symbols only. **No** stethoscope, medical cross, caduceus, doctor, lab-coat, certificate or licence imagery, because these could imply medical credentials.
  - **Editorial process** (steps taken from the owner's role definitions; each step is one short sentence):
    1. Research: writers gather reliable scientific references.
    2. Prepare and write: writers prepare the article or report from those references, with a Sources section.
    3. Review: the specialist content reviewer checks clarity, consistency, source quality and the accurate presentation of the science.
    4. Publish: the article is published with its sources and its date.
    **These four stages are the official editorial policy (owner-confirmed 2026-11-22)** for every new educational article and report. Present it as policy going forward. Never state or imply that existing or earlier content has passed through it unless it has actually been reviewed; do not describe how many people review, how long it takes, or any other detail the owner has not confirmed.
    Optional steps that need owner confirmation before use: how readers can report an error (via contact@bodymetricslab.uk) and that corrections are dated ("Updated" date). Do not add any other process detail (review counts, timeframes, tools, committees, update schedules).
  - **Commitment points** (short; no repetition of the required statement):
    - Calculator pages show their formulas and sources, and say when a source is secondary.
    - The calculators provide **educational estimates and are not a substitute for professional medical advice**.
    - BodyMetrics Lab is not affiliated with or endorsed by CDC, WHO, NIH, EFSA, the National Academies or any other organisation.
    - Optional point (owner to confirm): articles end with a Sources section.
  - **Visual and responsive design:** the PageHero, then sections on the mint background with white (`--color-surface`) cards; section spacing from the shared scale; the three role cards in three columns from 64rem, stacked in one column below that (so iPad portrait and phones stack) with the connector turning vertical; the editorial process as four steps in a row from 64rem and a vertical numbered list below; readable line length (about 65–75 characters) for paragraphs; contrast and touch-target rules in section 14. Light and dark themes. Keep the page short: no extra sections, slogans, statistics, counters or repeated statements.
  - **Not allowed:** individual names, photographs, avatars, job titles beyond the three role names, degrees, qualifications, licences or credentials, testimonials, awards, user counts, fake team profiles, and any wording that makes the Specialist Content Reviewer sound like a licensed physician, doctor, clinician, pharmacist, dietitian or other regulated professional (this must be independently confirmed by the owner before any such wording is used). Never write "medically reviewed", "doctor-reviewed" or "clinically reviewed".
- **Contact — `/contact/`** [Approved requirements]. Simple, professional and welcoming, and visibly part of the same website. **There is no Stitch Contact reference in `design-reference/`** (the owner asked to follow one; none was exported), so the page is built from the approved design system exactly like About Us: same palette, Manrope and DM Sans, cards, buttons, spacing, logo, global header, mobile drawer and footer. Content, in this order:
  1. `PageHero`: breadcrumb Home › Contact, kicker "Contact", **H1 exactly "Contact Us"**, and a short friendly introduction (one or two sentences) inviting visitors to contact the BodyMetrics Lab team.
  2. **One email contact card** (the shared card component, on the mint background, comfortable width of about 640–720px, left-aligned on small screens and centred on large screens): an inline SVG envelope icon (decorative, `aria-hidden`), a small label ("Email"), and the **exact address `contact@bodymetricslab.uk`** displayed in full and clearly as a `mailto:` link: `<a href="mailto:contact@bodymetricslab.uk">contact@bodymetricslab.uk</a>`. The visible link text is the address itself (never "click here"). No subject or body is pre-filled. The link is at least 44px high, has a visible focus style and uses `overflow-wrap: anywhere` so the address never causes horizontal scroll at 320px.
  3. **Approved medical and privacy notice** (exact text, under the card): "We can't provide personal medical advice. For medical questions, please consult a qualified healthcare professional, and please don't include personal health information in your email." It is the only extra text allowed. The approved introduction is in 20.2.
  Keep it concise: no repeated statements, no marketing text, no social links, no phone number, no postal address, no response-time promise (unless the owner supplies one), no map and no FAQ.
  **Not allowed without the owner's explicit approval:** a contact form, any external service or embed, a new dependency, address obfuscation that needs JavaScript (the address must exist in the HTML at build time, rule 5), and any other email address. Never show the owner's personal address, anywhere.
  **Email address rules (site-wide):** the address is the final approved public address and is used on the Contact page, in the footer and anywhere the site gives a contact address. It is defined **once** in one shared place in the source (so the Contact page, About page and footer cannot differ) and is never typed in several places. **Email delivery is verified** (owner-tested 2026-11-23: Cloudflare Email Routing works and the test email reached the connected inbox, first in the Spam folder). The site makes no claim about response times, and the owner alone manages the routing and the mailbox.
  **Page requirements:** unique title and meta description, canonical `https://bodymetricslab.uk/contact/`, one H1, trailing slash. The page stays `noindex` like the other pages until the owner approves publication.
  **Responsive:** phones: single column, full-width card, 1.25rem margin, address wraps if needed; tablets (portrait and landscape), laptops and large screens: the card keeps a readable maximum width and sits inside the 1280px container; both themes checked at each size (section 4 test widths).
- **Privacy Policy — `/privacy/`**, **Terms of Use — `/terms/`**, **Medical Disclaimer — `/medical-disclaimer/`:** plain, readable text pages with a table of contents for longer ones. Content must match reality: calculators store/send no health data; the theme choice is stored locally in the browser; hosting is on Cloudflare; analytics, cookies and advertising (AdSense is planned later) are described **only as they actually exist** at publish time. **[Open item D-LEGAL]** legal text should be reviewed by the owner (and a qualified person if desired); we do not invent legal clauses, jurisdiction or company details (the Stitch footer's "Inc." is not used). **Implementation scope (owner decision):** all three pages are built during implementation; their final wording must be reviewed and approved by the owner before public release, and until then they stay `noindex`.
- **404:** keep the existing page, restyled with the same system: H1, a short message, links to Home and Calculators.

## 12. Images and icons

### 12.1 Icons [Approved]
Inline SVG only. No icon font, no icon library. A small set of hand-written or properly licensed SVG paths in one `Icon` component (stroke icons, 20–24px grid, `currentColor`, `aria-hidden="true"` when decorative; icon-only buttons get an accessible name). The Stitch Material Symbols names (e.g. `arrow_forward`, `calculate`, `water_drop`, `monitor_weight`, `check_circle`, `light_mode`, `dark_mode`, `expand_more`, `menu`, `home`, `menu_book`, `info`, `mail`, `lock`, `science`, `shield`) show which glyphs are needed. **[TODO]** icon licensing: if SVG paths are taken from an existing set, the owner confirms the licence (Material Symbols are Apache-2.0, but verify before copying).

### 12.2 Photographs — inspected files in `design-reference/images/`

| File | Content | Verdict |
|---|---|---|
| `screen.png` | woman portioning ingredients in a kitchen (macros/nutrition) | usable; no text or logos visible |
| `screen (2).png` | stethoscope, tape measure, notebook on a desk | **contains name plates reading "DR. E. ADAMS" and "CLINICAL RESEARCH"** (right edge). Crop them out or replace; do not use as is |
| `screen (3).png` | clinician measuring a person's arm in a clinic | **contains a "BIOSCIENCE BODY COMPOSITION" logo wall sign** and implies a real clinical setting. Replace, or crop so no text or logo remains |
| `screen (4).png` | water carafe, lemon, linen | mostly fine; the glass shows small printed text ("STAY HYDRATED", a brand-like footer line). Crop or confirm acceptable |

- The files are about 1376×768, 1.2–1.5 MB PNGs, and look like AI-generated images. Their origin and licence are unknown, so **none may be published until the owner confirms the right to use them** (19.2 D-IMG). Never claim a licence that has not been verified.
- **Image sourcing policy (owner decision):** article images may be taken from the internet only when **commercial-use permission is clearly documented** on the source page (the site will carry advertising later). Every image must also allow the edits the site needs (cropping, resizing, format conversion). Never use: watermarked images; images with visible fake or real people's names; fabricated credentials or institutional logos; or professional imagery that could mislead about medical authority or endorsement (for example staged clinical settings, white-coat "doctor" portraits, stethoscope-and-clipboard scenes presented as the site's own experts). Prefer neutral lifestyle, food, water, measuring-tape and abstract subjects.
  - **Acceptable licence classes (policy; the licence text on the source page is always read and recorded, never assumed):** public domain / CC0, and licences that explicitly permit commercial use and modification, with attribution shown where the licence requires it. **Not acceptable:** licences that forbid commercial use (for example "non-commercial"), that forbid derivatives (for example "no derivatives", because the site crops and converts images), "editorial use only" images, and images with no stated licence.
  - **Identifiable people:** avoid recognisable real people unless the source states that a model release exists for commercial use; no image of a real person may be paired with a name, credential or testimonial.
- **Image register (required, kept in the project, for example `IMAGE-SOURCES.md`, created at implementation with the owner's approval):** one entry per published image with: project file path; source page URL; author or rights holder; licence name and licence URL; whether commercial use and modification are permitted; attribution text and where it appears on the page; date the licence was checked; alt text; and a confirmation that the image has no watermark, no names and no logos. No image is published without a complete entry.
- The Stitch exports hot-link `googleusercontent.com` image URLs. These must never be used; every image is a local, build-time asset.
- Optimisation: convert to WebP (AVIF optional), generate 2–3 widths (about 480/800/1200px), 16:9 crop for cards, `width`/`height` set, `loading="lazy"` below the fold, `decoding="async"`, the hero/LCP image `fetchpriority="high"`; target well under 150 KB per card image. Use Astro's built-in `astro:assets` image handling (already part of Astro). If that needs an additional package, stop and ask. Alt text always describes the image; decorative images use `alt=""`.
- If no suitable photo exists for an article, the article uses a neutral token-coloured illustration or no image; the missing asset is documented rather than invented.

## 13. Medical credibility and trust rules [Approved]

- **Forbidden everywhere:** "Medically Reviewed", "Clinical Grade", "Clinical Validation", "Peer-reviewed physiological methodology", any invented reviewer, credential, institution, publication date, review date or statistic, and phrases implying diagnosis, treatment, clinical-grade accuracy or endorsement.
- Each calculator and article shows official source names/links only where the content genuinely rests on them.
- Required wording (home Sources strip, About, calculators index, footer area of calculators): the site is an educational resource and is **not affiliated with or endorsed by** CDC, WHO, NIH or other organisations.
- Educational estimates only. No diagnosis, no treatment claims, no fixed calorie plans, no weight-loss promises. Under-20 BMI shows the notice described in 10.2 (no adult BMI or category).
- Neutral, evidence-based tone; avoid hype words ("precision", "gold standard", "clinical intelligence", "biometric engine").
- Contact email: the official address contact@bodymetricslab.uk (19.1 item 7); never a personal address, and no other address is invented.
- "Last reviewed" is not displayed; articles show "Published" and (if different) "Updated" (decided, 19.1). The About Us team statement in section 11 is owner-approved and is the only statement about who builds, writes and reviews content; the three role names (software development team, health content writers, specialist content reviewer) are the only team description allowed.

## 14. Accessibility requirements

WCAG 2.2 AA target, in both themes:
- Contrast: text 4.5:1 (large text 3:1); UI component borders, focus rings and graphical objects 3:1 (see 3.3). All new pairs are verified and recorded.
- Touch targets at least 44×44 CSS px; adequate spacing between adjacent targets.
- Fully keyboard-operable: logical tab order, visible focus on everything, no keyboard traps (except the intentional, escapable drawer trap), skip-to-content link, dropdown and drawer behaviours as in 5.
- Every input has a visible label; errors are text, associated and not colour-only; required/format hints before the field.
- Result updates in an `aria-live="polite"` region; classification badges include text and icon, not colour only; charts/bars have text equivalents.
- Landmarks: `header`, `nav` (labelled), `main`, `footer`; one H1; ordered headings; `lang="en"`.
- Respect `prefers-reduced-motion`; no auto-playing or flashing content; page works at 200% zoom and 320px width; text resizes without loss.
- Native elements first (`details`, `button`, `a`, radio groups) before ARIA widgets.
- Check at implementation with: keyboard-only pass, a screen-reader spot check on one calculator, the browser accessibility tree, and the contrast table.

## 15. SEO and technical page requirements (from AGENTS.md, restated)

Unique `<title>` and meta description; canonical URL on `https://bodymetricslab.uk`; one H1; real trailing-slash URLs only; no hash routes and no `?lang=` / `?theme=`; content present in the built HTML; `noindex` on placeholder pages until real content is ready; sitemap lists only indexable pages (existing build hook); no health data stored or sent; no new dependencies, frameworks or analytics without approval.

## 16. Design reference folder mapping

Folders are under `design-reference/` (the folder name typos are kept as they are on disk).

| Reference folder | Use |
|---|---|
| `BodyMetrics Lab - Homepage-Desctop/` | home page (`/`), plus the header/footer look for light mode |
| `Adult BMI Calculator (Desktop)/` | `/calculators/bmi/` and the base calculator layout |
| `BMR & TDEE Calculator (Desktop)/` | `/calculators/bmr-tdee/` |
| `Body Fat Calculator (Desktop)/` | `/calculators/body-fat/` |
| `Ideal Weight Calculator (Desktop)/` | `/calculators/ideal-weight/` |
| `Macro Calculator (Desktop)/` | `/calculators/macros/` |
| `Water Intake Calculator (Desktop)/` | `/calculators/water-intake/` |
| `Health Journal (Desktop)/` | `/journal/` |
| `Single Article Page — Desktop, Light Mode/` | `/journal/<slug>/` (the article template) |
| `Mobile Navigation — Open & Calculators Expanded/` | mobile drawer in `Header.astro` |
| `brand-assets/BodyMetricsLab Health Tech Logo.png` | the approved logo (see section 2) |
| `images/` | candidate editorial photos (see 12.2) and 4 more copies of `DESIGN.md` |
| each `DESIGN.md` | identical copies of the design-system prose; colours in it are superseded (see 1) |

Where designs disagree with each other (footer text, nav labels, header extras), this file's sections 5 and 6 decide. There are **no** dark-mode, tablet or mobile page designs (except the nav drawer); those are derived under this spec.

## 17. Page-to-route mapping

| Route | Astro file | Components / data | Design source | Indexing |
|---|---|---|---|---|
| `/` | `src/pages/index.astro` (exists) | hero, preview cluster, sources strip, `CalculatorCard` ×6, `ArticleCard` ×3 from collection | Homepage folder | noindex until content is ready |
| `/calculators/` | `src/pages/calculators/index.astro` (exists) | `PageHero`, `CalculatorCard` ×6 | derived | noindex until ready |
| `/calculators/bmi/` | `src/pages/calculators/bmi.astro` (exists) | `CalculatorShell`, `src/calculators/bmi.ts` | BMI folder | noindex until verified |
| `/calculators/bmr-tdee/` | `.../bmr-tdee.astro` (exists) | `src/calculators/bmr-tdee.ts` | BMR & TDEE folder | same |
| `/calculators/body-fat/` | `.../body-fat.astro` (exists) | `src/calculators/body-fat.ts` | Body Fat folder | same |
| `/calculators/ideal-weight/` | `.../ideal-weight.astro` (exists) | `src/calculators/ideal-weight.ts` | Ideal Weight folder | same |
| `/calculators/macros/` | `.../macros.astro` (exists) | `src/calculators/macros.ts` | Macro folder | same |
| `/calculators/water-intake/` | `.../water-intake.astro` (exists) | `src/calculators/water-intake.ts` | Water Intake folder | same |
| `/journal/` and `/journal/page/<n>/` (n ≥ 2) | `src/pages/journal.astro` today; at implementation `src/pages/journal/index.astro` (page 1) and `src/pages/journal/page/[page].astro` (pages 2+) | `ArticleCard`, `Pagination`, collection helper | Journal folder (pagination derived) | noindex until ≥1 real article |
| `/journal/<slug>/` | `src/pages/journal/[slug].astro` (**new**) | `Prose`, collection `src/content/journal/*.md`, content config (`src/content.config.ts`, **new**) | Single Article folder | indexable when published |
| `/about/`, `/contact/` | exist | `PageHero`, prose cards | derived (this spec) | noindex until reviewed |
| `/privacy/`, `/terms/`, `/medical-disclaimer/` | exist | prose layout | derived | noindex until reviewed |
| `/404` | `src/pages/404.astro` (exists) | same system | derived | noindex |

Note: the `/journal/` route stays the same URL when `journal.astro` is replaced by `journal/index.astro`; the implementation task confirms the routes (`/journal/`, `/journal/page/<n>/`, `/journal/<slug>/`) are generated with trailing slashes and that no article can take the reserved slug `page`.

## 18. Differences from the Stitch exports (all intentional)

- No "Clinical Grade" / "Validation" / "Medically Reviewed" / "Peer-reviewed" / "Clinical Validation" claims; no "Inc."; no invented dates or version numbers.
- Header: no primary "All calculators" button; no Validation link; unified labels "Health Journal" and "About Us".
- Footer unified to the four-column version of 6; the longer "Compliance & Ethics" and "Platform & Editorial" variants and the duplicated disclaimer boxes are dropped.
- Material Symbols font replaced by inline SVGs; Tailwind and CDN scripts replaced by plain CSS; Google Fonts replaced by self-hosted fontsource.
- Inputs get a visible 1.5px border for 3:1 contrast.
- Bookmark icons, "Sample Content" chips and per-article category tags dropped.
- Invented numeric content (activity split percentages, "within healthy parameters" text, recommended calorie range, ±3% accuracy claim) removed pending verified sources.
- Pre-filled demo results are shown only as labelled examples.
- Calculator science (formulas, constants, categories, ranges, inputs, rounding) comes from `CALCULATION-SPEC.md`, not from the exports. The Stitch ideal-weight design coded four formulas with the rounded Robinson values and Miller `56.2 / 1.41`; the site uses Devine and the exact Robinson coefficients only. Specific changes: female Navy body fat now requires a hip field; the Navy centimetre/density equation form is replaced by the verified inch form; Hamwi, the ideal-weight age field and (until verified) the Devine/Miller comparison are removed; the activity-partition bar, the "Recommended 1,500–4,000 kcal" label, the "AMDR aligned" preset label, the water climate selector and age cohort, and medical-condition claims are removed; BMI gets an under-20 notice and a one-decimal classification rule.

## 19. Decisions taken and items awaiting the owner

### 19.1 Decided
1. Light palette, typography, 12px radius, container and spacing: sections 3 and 4. Dark palette in 3.2 is adopted (AA verified).
2. Drawer breakpoint 64rem; the drawer keeps the "Home" item. Header and footer: sections 5 and 6.
3. (Removed 2026-11-26: there is no imperial input; height is one cm field.)
4. Body fat shows the hip field for women only (CALCULATION-SPEC.md 4.2). Ideal weight has no age field and **two formula cards (Devine, Robinson)**; Miller and Hamwi are not included (CALCULATION-SPEC.md 5.5). Water intake shows EFSA and US National Academies values side by side, with no age input and the notice "For adults aged 19 and over.", and no pregnancy or lactation inputs. TDEE uses the four National Academies activity categories. Macro presets are 30/45/25, 35/45/20 and 25/45/30.
5. Articles show "Published" and (if different) "Updated"; no "Last reviewed". Future-dated posts are not published at build time. Related-article banners render only when the article exists.
6. **Brand asset:** the approved logo is `design-reference/brand-assets/BodyMetricsLab Health Tech Logo.png`; see section 2. Do not redesign or replace it.
7. **Official contact address (final):** `contact@bodymetricslab.uk`, shown on the Contact page and in the footer as a `mailto:` link, defined once in the source. **Email delivery is verified:** the owner tested Cloudflare Email Routing on 2026-11-23 and a test email to this address reached the connected inbox (first placed in the Spam folder, an owner-side mailbox matter). The site still makes no claim about response times. The site never shows the owner's personal address and never invents another.
8. **Image policy:** images may come from the internet only when commercial-use licensing is clearly verified. No watermarked images, fake doctor names, names of real people shown on images, fabricated credentials or misleading medical endorsements. Every image's source and licence is recorded (12.2).
9. **About Us requirements are final** (section 11: five sections, the required statement, three role cards, no invented people or credentials). **Contact requirements are final** (section 11: "Contact Us" heading, short introduction, one email card with the exact mailto address, no form).
10. Input validation limits and calculator eligibility rules are the owner-approved technical boundaries in CALCULATION-SPEC.md 1.3. They are never shown as medical limits.

### 19.2 Items awaiting the owner or later messages
| # | Item | Where |
|---|---|---|
| D-ABOUT | About Us structure, role cards, editorial workflow and hero sentence are approved. Open: the word "independent" (omitted until the owner verifies ownership and affiliations). Final copy is reviewed on the rendered page before release. | 11 |
| D-CONTACT | Contact copy and the medical/privacy notice are **approved**; email delivery is verified. No Stitch Contact reference exists, so the owner reviews the layout on screen. | 11 |
| D-LOGO (see section 2 for the plan) | The logo file is a 2508×627 RGB PNG with a white background (heart-and-figure icon in a rounded green square, "BodyMetricsLab" wordmark). Implementation needs derived technical variants (trimmed, transparent background, icon-only crop for the favicon, a treatment that works on dark backgrounds). These adaptations must keep the approved design; any visible change needs owner approval. The existing inline mark in `Logo.astro` (a cross in a green square) is a different mark and is superseded by the approved logo. Whether the header uses the full lockup image or the icon plus live text is an implementation question to confirm. | 2 |
| D-IMG | The four photographs in `design-reference/images/` have unknown origin and licence and may not be published until verified; two contain fake-name and logo text (12.2). | 12.2 |
| D-HERO | Hero preview values on the home page are static examples; they must be labelled and should be recomputed with the real calculators from a stated example. | 8 |
| D-SRC | Sources and Methods strip: specific, verified sources only (CALCULATION-SPEC.md 0.4), plus the non-affiliation sentence. | 8 |
| D-LEGAL | Legal pages are drafted in plain neutral language and reviewed by the owner before release; no company, jurisdiction or clause is invented. | 11 |
| D-ILLUS | An optional "where to measure" illustration on the body-fat page needs approval. | 10.4 |
| D-SPEC | Unresolved scientific items: CALCULATION-SPEC.md section 8. | CALCULATION-SPEC.md |
| D-RADIUS | The 12px card radius and the 1.5px input border (an accessibility adaptation of the borderless Stitch wells) await confirmation on screen. | 3.5 |

## 20. Page copy (Contact: APPROVED 2026-11-22 · About Us: structure and role cards approved; editorial-workflow wording awaits the owner's confirmation)

It uses only claims the owner has supplied and contains no names, credentials, statistics or testimonials. **Contact copy is approved and is the copy used at implementation. About Us:** the five-section structure and the three role cards are approved; the page may not be implemented until the owner confirms the actual editorial workflow (the four steps and the sentence "Every educational article and report follows the same four steps before it is published").

### 20.1 About Us (`/about/`)
**Title/H1:** About BodyMetrics Lab
**Intro (hero):** Free health calculators and educational articles that explain your numbers clearly.

**1. Who We Are**
BodyMetrics Lab is a free educational health website. It offers three calculators (BMI, BMR & TDEE, and body fat) and a Health Journal of articles that explain the science behind them. The calculators run in your browser, so the numbers you enter are not stored or sent anywhere. BodyMetrics Lab is not affiliated with or endorsed by CDC, WHO, NIH, the National Academies, the US Navy or any other organisation. (Version 1 wording; the earlier six-calculator text is superseded until Version 2.)

**2. Our Mission**
To help people understand their health numbers through clear explanations, transparent methods and reliable sources.

**3. Our Team**
BodyMetrics Lab is built by one coordinated team with three roles.
*(highlighted statement, verbatim)* "The BodyMetrics Lab platform and its educational reports are developed, written, and reviewed by specialists from the BodyMetrics Lab team, with a focus on scientific accuracy, transparent methodologies, and clear, practical health information."
- **Software Development Team** — Builds, maintains and improves the website, its calculators and their technical functionality.
- **Health Content Writers** — Research, prepare and write educational health articles and reports using reliable scientific references.
- **Specialist Content Reviewer** — Reviews articles and reports, checking clarity, consistency, source quality and the accurate presentation of scientific information.

**4. Our Editorial Process**
This is the BodyMetrics Lab editorial policy going forward: every new educational article and report follows the same four stages before it is published.
1. **Research** — Our writers gather reliable scientific references for each topic.
2. **Prepare and write** — They prepare the article or report from those references and list the sources used.
3. **Review** — The specialist content reviewer checks clarity, consistency, source quality and the accurate presentation of the science.
4. **Publish** — The article is published with its sources and its publication date.

**5. Our Commitment to Accuracy and Transparency**
- Each calculator page shows its formula and its sources, and says when a source is secondary.
- Our calculators provide educational estimates. They are not a substitute for professional medical advice.
- Every health article ends with a Sources section that links to the references used.
Questions? [Contact us](/contact/).

*Status:* the four stages (Research, Prepare and Write, Review, Publish) are confirmed by the owner as the official editorial policy for every new educational article and report. The page presents it as a policy going forward and **never claims that previously published content has already passed through it unless that content was actually reviewed** (no articles exist yet). The word "independent" is **not used** in the copy until the owner confirms it accurately reflects the platform's actual ownership and affiliations (the non-affiliation sentence stays). The hero sentence is approved. Not included on purpose: error-report and corrections wording (not confirmed).

### 20.2 Contact (`/contact/`) — APPROVED
**Title/H1:** Contact Us
**Introduction (proposed):** Have a question, suggestion or feedback about BodyMetrics Lab? We would love to hear from you. Send an email to the BodyMetrics Lab team at the address below.
**Email card:** *Email* — contact@bodymetricslab.uk (mailto link, exact address)
**Medical and privacy notice (proposed):** We can't provide personal medical advice. For medical questions, please consult a qualified healthcare professional, and please don't include personal health information in your email.
No response-time promise, no form, no other contact details.

## 21. Final checklist

### A. Before implementation starts (owner decisions and approvals)
Implementation starts only when the owner gives explicit permission, after approving the complete specification milestone, which waits for the About Us editorial details. Order of work once permitted: **BMI calculator first as the template** (validate the formula against `CALCULATION-SPEC.md` and the responsive layout), then the remaining calculators; no redesign of approved screens and no change to the brand. A report follows every implementation task (changed files, tests, build results, unresolved issues).
| # | Item | Status |
|---|---|---|
| A1 | Approval of the complete specification milestone | **approved by the owner 2026-11-23.** A **separate instruction to start coding is still required**; no implementation has started. |
| A2 | About Us: five-section structure, three role cards, the editorial workflow (official policy going forward) and the **hero sentence** ("Free health calculators and educational articles that explain your numbers clearly.") are **approved**. The word "independent" stays omitted until verified (ownership and affiliations). Final copy is reviewed on the rendered page before release. | done |
| A3 | Contact introduction and the medical/privacy notice (20.2) | **approved 2026-11-22**; the official address contact@bodymetricslab.uk is used throughout the site, including the footer |
| A4 | Logo: use the original as the **master** (never overwritten); prepare a transparent light-theme variant, an **adapted dark-theme variant with sufficient contrast** (the lettering-recolour option in section 2) and an icon-only favicon variant, keeping the original design. **The owner sees all variants on screen before final approval.** | approved in principle; variants to be shown |
| A5 | **Approved:** pin the dependencies that use `latest` to the exact versions already verified in `package-lock.json`: astro 7.4.12 (already pinned), @astrojs/sitemap 3.7.5, @fontsource-variable/dm-sans 5.3.0, @fontsource-variable/manrope 5.3.0, @astrojs/check 0.9.12, typescript 6.0.3. Done only as part of an approved implementation task and reported. Pinning edits the root dependency entries of `package-lock.json`, so the lockfile diff is shown for review first (see A7). **Node version approved:** 24.22.1 for local development and production builds (matches Cloudflare's documented Workers Builds default and preinstalled version; `.nvmrc`, `package.json` engines and the lockfile already say 24.22.1, so no version file changes). The owner checked the dashboard on 2026-11-23: there is **no `NODE_VERSION` build variable**, so `.nvmrc` applies. The owner moves the local machine from 24.22.3 to 24.22.1 (not done by us). | approved |
| A6 | **Approved:** Node's built-in test runner (`node:test`); no test packages. Checked in a scratch folder (nothing in the project touched): Node 24.22.3 runs `.ts` test files directly when imports use explicit `.ts` extensions. At implementation, confirm `npm run check` accepts that setup; any `tsconfig` change is reported before it is made, and a loader or new package is never added without approval. | approved |
| A7 | **Decided:** no commit, push, merge or deploy without the owner's explicit approval; development stays on `rebuild`; Cloudflare settings are never changed by us. The existing `package-lock.json` changes are preserved (not regenerated, reverted or discarded) until the owner has reviewed their diff. | decided |
| A8 | **Journal pagination — approved 2026-11-23** (behaviour in 9.1): at most 9 articles per listing page; 1–9 articles all on `/journal/` with no pagination controls; the 10th published article automatically creates `/journal/page/2/`; controls appear only with more than 9 published articles; newest first by publication date; every article always keeps its own URL and page; no manual code change when articles are added. | approved |

### B. Can be completed during implementation
- Design tokens, base styles, light and dark themes, shared components, header (with the approved drawer), footer with the contact address, and the responsive rules in section 4.
- All pages from the specs: home, calculators index, the six calculators (with unit tests built from `CALCULATION-SPEC.md`, including the full 1,991-cell Navy table test, boundary and invalid-input tests), journal listing, article template, About, Contact, legal pages, 404.
- Logo variants (transparent light and dark lockups and the icon set) with side-by-side checks on screen; the master copy of the original asset.
- Inline SVG icon set; image optimisation.
- Article images: acquire only images that meet the policy in 12.2, fill the image register, and draft any articles with a Sources section as in 9.2. Until then the placeholder panel is used.
- Home hero example values recomputed from the real calculators; Sources and Methods strip with the specific sources.
- Legal pages drafted in plain neutral language from the facts (browser-only calculations, local theme preference, Cloudflare hosting, advertising or analytics only when they exist).
- Sitemap and `noindex` handling, canonical URLs, accessibility and responsive test passes, `npm run check` and `npm run build`.

### C. Must be reviewed by the owner before public release
- Final About Us and Contact copy on the rendered pages.
- **Privacy Policy, Terms of Use and Medical Disclaimer: final wording reviewed and approved** (they stay `noindex` until then).
- The image register: every published image has a documented commercial-use licence, no watermark, no names and no misleading professional imagery.
- Each calculator page: formulas, constants and source links match `CALCULATION-SPEC.md`; secondary sources are labelled; access dates updated; items still marked UNVERIFIED or HELD are either resolved or not shown.
- Every article ends with a Sources section as specified in 9.2.
- Logo and favicon appearance on both themes; header, drawer and footer on all test widths.
- ~~Email delivery of `contact@bodymetricslab.uk` tested by the owner in Cloudflare~~ — **completed 2026-11-23** (delivered; first placed in the Spam folder). Nothing further is needed before release, apart from the owner's own mailbox handling.
- **Cloudflare build configuration reviewed for the Astro static output before deployment** (owner-only; we never change Cloudflare settings): the dashboard currently has an empty build command and the deploy command `npx wrangler deploy`; see section 22 for the facts and the review list.
- Removal of `noindex` page by page, only after approval; a final `build`, `check` and `preview` run and a sitemap review.
- A re-check of the cited official pages (CDC, WHO, EFSA, National Academies, FAO, NIST) before each public release, as required by the maintenance rule.

## 22. Cloudflare build and deploy facts (owner-verified 2026-11-23) and pre-deploy review

### 22.1 Facts verified by the owner in the Cloudflare dashboard
- The production Worker is **`body-metrics-lab`** (the name in `wrangler.jsonc` matches).
- It is connected to the GitHub repository **`alimo005/body-metrics-lab`**, and the **production branch is `main`**.
- The Workers Builds configuration has **no `NODE_VERSION` variable**, so the `.nvmrc` file applies. **Node.js 24.22.1 is approved as the currently pinned version** (it is also Cloudflare's documented Workers Builds default and preinstalled version).
- The **build command is empty** and the **deploy command is `npx wrangler deploy`**.
- The repository's `main` branch is the old static site (in the local copy of `origin/main`, which has not been refreshed, it has no `package.json` and no `wrangler.jsonc`), while `rebuild` has the Astro project and a `wrangler.jsonc`. How the current live site is built and deployed with an empty build command is not investigated here and is owned by the owner.

### 22.2 What the Cloudflare documentation says (read 2026-11-22, "Workers Builds" pages)
- The build command is optional, but it is required when a project has a build step; the docs name frameworks such as Astro (`npm run build`).
- The deploy command defaults to `npx wrangler deploy`, and Workers Builds uses the Wrangler version set in the project's `package.json`. This project's `package.json` does **not** list Wrangler, so the version `npx` would use is not pinned.
- Preview builds (when enabled) run for branches other than the production branch, by default with `npx wrangler preview`.
- If a repository has no Wrangler configuration file, the deploy command starts "automatic project configuration" (it opens a pull request); `rebuild` already has one.
- Node.js can be set by the `NODE_VERSION` variable or by `.nvmrc` / `.node-version`; the build image's default and preinstalled Node is 24.22.1.

### 22.3 Required review before the new website is deployed (owner-only; we never change Cloudflare settings)
The Astro site outputs static files to `dist/` (which is git-ignored), and `wrangler.jsonc` serves the `./dist` assets directory. An **empty build command would not create `dist/`**, so the build configuration **must be reviewed for the Astro static output before the new website is deployed**. Review list:
1. **Build command:** it must produce `dist/` (the documented project command is `npm run build`). The review decides what to set; we do not set it.
2. **Deploy command:** `npx wrangler deploy` reads `wrangler.jsonc` (name `body-metrics-lab`, assets directory `./dist`, `html_handling: force-trailing-slash`, `not_found_handling: 404-page`). Confirm it is still the right command for the new output.
3. **Wrangler version:** not pinned in `package.json`. Pinning it means adding a dependency, which needs the owner's approval; until then the version is decided by Cloudflare/`npx`. Record the decision.
4. **Dependency installation:** confirm that dependencies are installed before the build command runs (not verified in the pages read).
5. **Production branch `main`:** the new site reaches production only if `rebuild` is merged into `main`. That merge and any push are the owner's decisions; we never touch `main`, merge or push.
6. **Preview builds for `rebuild`:** if preview builds are enabled, pushing `rebuild` could trigger a preview build with the preview command. The owner decides whether and when to push.
7. **Static output checks (during implementation, before deploy):** `npm run build` produces `dist/` with trailing-slash routes and a root `dist/404.html` (needed for `404-page` handling), consistent with `trailingSlash: 'always'` and `format: 'directory'`; `npm run preview` serves the same routes.
8. **Node version:** no `NODE_VERSION` variable exists; `.nvmrc` (24.22.1) applies. Keep `.nvmrc`, `package.json` engines and the lockfile at 24.22.1.
9. **Root directory:** left blank (the repository root) unless the owner chooses otherwise.
This review is also item C in section 21.

## 23. Implementation readiness and scope of the first tasks

### 23.1 Confirmed technology (no changes without the owner's approval)
Astro static site generation; strict TypeScript; plain CSS with variables (tokens in `src/styles/tokens.css`); vanilla TypeScript for calculator behaviour; calculator logic as pure functions tested with Node's built-in test runner (`node:test`). **Not allowed without explicit approval:** React, Vue, Tailwind, WordPress or any CMS, a database, an icon library, an analytics package, a form service, or any new dependency. Node.js 24.22.1; only branch `rebuild`; no commit, push, merge or deploy without approval; no Cloudflare dashboard or DNS changes.

### 23.2 Journal publishing workflow (supported by the design)
1. The owner gives Claude Code a new approved article.
2. Claude adds it as one Markdown file in `src/content/journal/` (the file name is the slug) with validated front matter and a final "Sources" section (9.2, 9.3).
3. Astro generates the article page from the shared template; no HTML is written by hand for any article.
4. The Journal listing, its pagination (9.1) and the homepage's three latest published articles update automatically; published articles enter the sitemap automatically.
5. Each article has accurate metadata and a suitable licensed image with a complete image-register entry (12.2). Claude proposes licensed image candidates with their licence evidence and downloads a file only after the owner approves it (the owner may supply an image with its licence details instead).

### 23.3 First implementation task ("Task 2: design system and site shell") — scope
Starts only after the owner approves the specification milestone and gives a separate implementation instruction. Small and reviewable, in this order:
1. **Lockfile review and dependency pinning:** show the owner the existing `package-lock.json` diff first (the earlier review found only 11 `"peer": true` flags removed, with no version or integrity changes); after the owner's go-ahead, pin the five `latest` dependencies to their locked versions (A5) and show the resulting lockfile diff.
2. **Design tokens and base styles:** `src/styles/tokens.css` and `base.css` rewritten to the approved palette, typography, spacing, radius, elevation and focus rules, with the derived dark palette and the contrast table re-checked.
3. **Layout and theme:** `BaseLayout.astro` (title, description, canonical, robots, skip link, no-flash theme script, `localStorage` with graceful fallback, no URL parameters) and `ThemeToggle`.
4. **Header and responsive navigation:** logo, Calculators dropdown, Health Journal, About Us, Contact, theme toggle; the Stitch mobile drawer below 64rem (focus trap, Escape, backdrop, scroll lock).
5. **Footer:** the unified four-column footer with the contact address (`contact@bodymetricslab.uk`, defined once).
6. **Logo assets:** the master copy of the original, the transparent light variant, the adapted dark variant and the icon favicon set, **shown to the owner for approval**; the placeholder `Logo.astro` mark is replaced.
7. **Inline SVG icon component** with only the icons these parts need.
8. **Checks:** `npm run check` and `npm run build`; screenshots at 320, 375, 768×1024, 1024×768, 1280 and 1440 widths in both themes; keyboard, focus and contrast checks; comparison with the Stitch header, footer and drawer; and a report (changed files, tests, build results, open issues).
**Out of scope for Task 2:** any calculator, any content page, the journal, images, legal pages and the About/Contact copy.

### 23.4 Second task ("Task 3: BMI calculator as the template")
After Task 2 is reviewed: `src/calculators/bmi.ts` (pure functions) and `bmi.test.ts` (`node:test`: cases B1–B20 and R1–R5, boundary, invalid, sex-independence, metric/imperial), the vanilla TypeScript UI module, the shared calculator components (shell, segmented toggle, number field, result card, reference bar, notice, formula box, source list), and `/calculators/bmi/` built to the Stitch design and `CALCULATION-SPEC.md` section 2. The page stays `noindex` until the owner approves. Validate calculation accuracy, appearance, accessibility and responsive layout (mobile, tablet portrait and landscape, laptop, desktop) before any other calculator is started. Report after the task.
