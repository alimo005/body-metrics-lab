# Navy BCA 2016 table fixture

`navy-bca-2016-percent-body-fat.json` holds the printed percent-body-fat lookup tables of the US Navy guide, used by `navy-bca-2016.test.ts` to check the Hodgdon and Beckett (1984) equations in `body-fat.ts` (CALCULATION-SPEC.md 4.3 and 4.8).

## Provenance
| Item | Value |
|---|---|
| Document | *The Body Composition Assessment (BCA)*, Guide 4 |
| Edition | JAN 2016 (20 PDF pages) |
| Publisher / copy | US Navy; copy hosted by the US Public Health Service, Commissioned Corps |
| URL | https://dcp.psc.gov/ccmis/pdf_docs/Body%20Composition%20Assessment%20(BCA)%202016.pdf |
| File | 340,805 bytes, SHA-256 `fea12d798d98365ef2910c85abd3c86cf405d5407ad7119f3da7902fb24d68cc` |
| Pages used | PDF pages 16 and 17 (Table 2, men: heights 60 to 79.5 in) and 18 and 19 (Table 3, women: heights 58 to 77.5 in). The printed page numbers equal the PDF page numbers. |
| Downloaded and extracted | 2026-11-24, plain HTTP request, no access controls bypassed |
| Not stored | The PDF itself is not kept in the repository. |

## How the values were extracted
1. `pdftotext -layout` (Xpdf/Poppler 4.00) converted the PDF to text.
2. `extract-navy-tables.mjs` (this folder) read each table page: the "Value*" line gives the heights (20 columns per page); every following row starts with the circumference value (CV) and has exactly 20 cells. A row with a different number of cells stops the script.
3. Numeric cells are stored as numbers. Cells printed as limits (`<9`, `>40` and similar) are stored as text.

No equation is used in the script or in the fixture. The expected values are therefore independent of the code under test.

Re-run: `node src/calculators/fixtures/extract-navy-tables.mjs <pdf> <output.json>`. If the SHA-256 differs from the one above, the publisher changed the file and the result must be reviewed.

## Contents (checked by the test)
- 4 tables, 107 rows, 20 cells per row.
- **1,996 numeric cells** (page 16: 424, page 17: 492, page 18: 520, page 19: 560) and **144 cells printed as limits** (104 `<` cells for men, 40 `>` cells for women).
- Earlier notes in CALCULATION-SPEC.md gave 1,991 (page 19: 555). The independent re-extraction found 1,996. The earlier figure was a count error; every one of the 1,996 cells matches (see below).

## What the check shows, and what it does not
- Each cell is compared with the equation evaluated at the table's own header values (the CV row and the height column) and rounded to the nearest whole number. Measurement rounding (the guide's half-inch rules) is not part of this comparison, because the header values are already half-inch values.
- No cell lies closer than about 0.0012 to a .5 rounding tie, so half-up and half-even rounding give the same result.
- It shows that the equations reproduce the printed numbers. It does **not** show that the guide's authors used these exact equations (the guide names no equation or author), that the original 1984 reports say the same, or how the Navy's software (PRIMS) calculates the official result.

## Limitations of the extraction
- Values come from text extraction, not from reading the page images. Row and column counts (20 per row) and the independent comparison with the equations would reveal a misplaced cell, but a wrong value that still matches the equation cannot be excluded by those checks.
- The PDF text shows some fraction glyphs as "�"; this does not affect the tables, whose headers use decimals (60, 60.5, ...).
