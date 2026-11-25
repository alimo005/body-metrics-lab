---
# ARTICLE TEMPLATE. Copy this file, rename the copy (lowercase words joined by hyphens, for example how-to-calculate-bmi.md)
# and fill it in. The file name becomes the web address: /journal/how-to-calculate-bmi/. This template itself is never published
# (files whose names start with an underscore are ignored). Full instructions: docs/PUBLISHING-ARTICLES.md

# REQUIRED. 10 to 120 characters. Shown as the page title (the only H1), on the cards and in search results.
title: "Your article title goes here"

# REQUIRED. 50 to 200 characters. One or two plain sentences. Used as the card excerpt and the meta description.
description: "One or two plain sentences that tell a reader what this article explains and why it is useful."

# REQUIRED. Publication date as YYYY-MM-DD. A date in the future keeps the article hidden until the first build on or after that day.
pubDate: 2026-01-01

# OPTIONAL. Add only when you revise an already published article. Must not be earlier than pubDate. Shown as "Updated".
# updatedDate: 2026-02-01

# OPTIONAL. Leave both out until a licensed image has been approved (see docs/IMAGE-SOURCES.md). Without an image the article shows
# a neutral illustration. When you add an image, imageAlt (a plain description of the picture) is required.
# image: ../../assets/journal/your-image.webp
# imageAlt: "A plain description of what the image shows"

# REQUIRED. The calculator this article is about: bmi, bmr-tdee or body-fat. It drives the "related calculator" box under the article
# and the "related article" banner on that calculator's page.
relatedCalculator: bmi

# REQUIRED. true = DRAFT: hidden everywhere (list, home page, banners, sitemap, built site). false = PUBLISHED.
draft: true
---

Start directly with your opening paragraph. Do not repeat the title here and do not use a single-hash heading: the page already shows the title as its main heading. Do not add a heading called "Introduction" or "Conclusion".

## First section heading

Write in plain paragraphs. Link to a calculator with a normal Markdown link, for example the [BMI calculator](/calculators/bmi/).

A list:

- First point
- Second point

A formula or key equation (a highlighted box):

<div class="formula-block">BMI = weight (kg) ÷ height (m)²</div>

A table (wide tables scroll sideways on small screens):

| Column one | Column two |
|---|---|
| Value | Value |

A highlighted note:

<div class="callout">

A short note the reader should not miss.

</div>

## Frequently asked questions

<details>
<summary>A question a reader might ask?</summary>

The answer, in one or two short paragraphs.
</details>

## Sources

1. Author or organisation. [Title of the source](https://example.org/the-real-link). Publisher or journal, year. Accessed 1 January 2026.
2. Secondary source (label it as secondary): [Title](https://example.org/another-link). Publisher, year.
