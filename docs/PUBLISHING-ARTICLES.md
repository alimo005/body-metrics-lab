# Publishing Journal articles

You add an article by creating **one Markdown file**. No Astro component, page or program code needs to change. The article page, the Journal list and its pagination, the home page's latest three, the related-calculator banners, the page title and description, and the sitemap are all generated from that file.

## 1. Add an article

1. Open the folder `src/content/journal/`.
2. Copy `_TEMPLATE.md` and rename the copy. The file name is the article's permanent web address:
   `how-to-calculate-bmi.md` becomes `https://bodymetricslab.uk/journal/how-to-calculate-bmi/`.
   Use lowercase words joined by hyphens, with no spaces or capitals. The name `page` is reserved and cannot be used.
3. Fill in the frontmatter (the block between the two `---` lines) and write the article below it.
4. Leave `draft: true` while you work.

### Frontmatter fields

| Field | Required | What to write |
|---|---|---|
| `title` | yes | 10 to 120 characters. Shown as the page's main heading, on the cards and in search results. |
| `description` | yes | 50 to 200 characters, one or two plain sentences. Used for the card excerpt and the meta description. |
| `pubDate` | yes | `YYYY-MM-DD`. A future date keeps the article hidden until the first build on or after that day. |
| `updatedDate` | no | `YYYY-MM-DD`. Only when you revise a published article; not earlier than `pubDate`. Shown as "Updated". |
| `image`, `imageAlt` | no | Leave out until a licensed image is approved (section 5). `imageAlt` is required whenever `image` is set. |
| `relatedCalculator` | yes | `bmi`, `bmr-tdee` or `body-fat`. Adds the "related calculator" box under the article and the "related article" banner on that calculator's page. |
| `draft` | yes | `true` = hidden everywhere. `false` = published. |

The author is always shown as "BodyMetrics Lab Editorial Team"; do not add it to the file. The reading time is calculated automatically.

### Content rules (checked automatically)

- Do not use a single-hash heading (`# ...`): the title is the page's only H1. Start straight with your opening paragraph.
- Use `##` for main sections and `###` for sub-sections. Do not add a heading called "Introduction" or "Conclusion".
- **The last `##` heading must be exactly `## Sources`**, followed by a numbered list (`1.`, `2.` ...). It must contain at least one `https://` link, and each entry names the organisation or author, the title, the publisher or journal and year, and the link. Label secondary sources as secondary. List only references the article actually uses.
- These phrases are never allowed: "medically reviewed", "doctor-reviewed", "clinically reviewed", "clinical grade", "clinical validation", "peer-reviewed physiological methodology".
- Do not name reviewers, qualifications or medical credentials.
- Link to the calculators with `/calculators/bmi/`, `/calculators/bmr-tdee/` and `/calculators/body-fat/` only.
- Formulas: `<div class="formula-block">...</div>`. Notes: `<div class="callout">` (leave blank lines inside). Questions and answers: `<details><summary>Question</summary>` ... `</details>`. Tables are normal Markdown tables.

If a **published** article breaks a rule, `npm run build` stops and says which file and which rule. Drafts are not checked until they are published (but the local preview, below, does check them).

## 2. Preview an article before publishing

1. Run `npm run dev` and open `http://localhost:4321/journal/<file-name>/`, for example `http://localhost:4321/journal/how-to-calculate-bmi/`.
2. A draft shows a dashed "Draft preview" box at the top. This works **only on your own computer's development server**. A draft never appears in the Journal list, on the home page, in related-article banners or in the sitemap, and it is never part of the built website (`npm run build` does not create its page).
3. Edit the file and save; the page refreshes by itself.

## 3. Publish

1. Set `draft: false`.
2. Check `pubDate`. It must be today or earlier (or the day you want it to appear).
3. Run `npm run build`. If it finishes without an error, the article is valid.
4. Commit and deploy the way you normally do. (The project is never committed or deployed by the assistant without your instruction.)

As soon as the article is published it appears, with no other change:

- at `/journal/<file-name>/` (this address never changes, whichever listing page the article is on),
- in the Journal list (newest first, nine per page),
- in "Explore Our Health Journal" on the home page if it is one of the three newest,
- as the "related article" banner on its calculator's page (the newest published article for that calculator),
- in the sitemap (only while indexing is enabled, see section 6).

### Pagination

Nine articles per page. With one to nine articles there is one page and no page controls. When the tenth article is published, `/journal/page/2/` appears automatically with Previous / Next controls; the nineteenth creates page 3, and so on.

## 4. Unpublish or schedule

- **Unpublish:** set `draft: true` and rebuild. The page, card, banner and sitemap entry disappear.
- **Schedule:** give `draft: false` and a future `pubDate`. The article stays hidden until a build is made on or after that day. The website is static, so it does **not** update by itself: a new build and deploy is needed on or after the day.

## 5. Images

Images are optional. Without one, the article shows a neutral illustration. **Do not add a photograph until its licence has been checked and approved.** The rules and the register are in `docs/IMAGE-SOURCES.md`. When an image is approved:

1. Put the file in `src/assets/journal/` (a WebP or JPEG about 1,600 pixels wide, 16:9).
2. Add to the frontmatter: `image: ../../assets/journal/your-image.webp` and `imageAlt: "a plain description"`.
3. Add the image to the register.

The site converts and sizes the image automatically.

## 6. Indexing (release switch)

The website is indexable. One setting controls it: `INDEXING_ENABLED` in `src/config/site.ts` (currently `true` since 2026-11-26). While it is `true`, `robots.txt` allows crawling and names the sitemap, and every published page and article is listed in the sitemap. Drafts and future-dated articles never are, and the 404 page is never indexed. Setting it to `false` hides the whole site again (`noindex` everywhere, crawlers blocked, empty sitemap).

## 7. Error messages

| Message (shortened) | What to do |
|---|---|
| `the last H2 must be titled exactly "Sources"` | Make the final `##` heading `## Sources`. |
| `the Sources section must contain at least one external https link` | Add a real `https://` link to each source. |
| `the Sources section must be an ordered list` | Start the entries with `1.`, `2.` ... |
| `the body must not contain an H1` | Remove the `# ...` line. |
| `the heading "Introduction" is not allowed` | Rename or remove the heading. |
| `the phrase "..." is not allowed` | Reword the sentence. |
| `the slug "page" is reserved` / `must be lowercase kebab-case` | Rename the file. |
| `imageAlt is required when image is set` | Add `imageAlt`. |
| `updatedDate is earlier than pubDate` | Fix the dates. |
| A frontmatter error naming a field | The named field is missing or has the wrong length or value. |
