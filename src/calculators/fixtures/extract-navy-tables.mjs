// One-off extraction of the percent-body-fat lookup tables (Table 2 for men, Table 3 for women) from the
// US Navy "The Body Composition Assessment (BCA)", Guide 4, JAN 2016. See README.md in this folder.
//
// Usage:  node extract-navy-tables.mjs <path-to-pdf> <output-json>
// Needs the `pdftotext` command-line tool (Xpdf/Poppler). It is NOT part of the website build or the test run;
// the website and `npm test` only read the JSON this script produced.
//
// The numbers come only from the printed tables. No equation is used anywhere in this script.

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';

const [, , pdfPath, outPath] = process.argv;
if (!pdfPath || !outPath) {
  console.error('Usage: node extract-navy-tables.mjs <pdf> <output-json>');
  process.exit(1);
}

const EXPECTED_SHA256 = 'fea12d798d98365ef2910c85abd3c86cf405d5407ad7119f3da7902fb24d68cc';
const bytes = fs.readFileSync(pdfPath);
const sha256 = createHash('sha256').update(bytes).digest('hex');
if (sha256 !== EXPECTED_SHA256) {
  console.warn(`WARNING: the file hash differs from the one recorded in the README (${sha256}). The publisher may have changed the file; review the result carefully.`);
}

const text = execFileSync('pdftotext', ['-layout', pdfPath, '-'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).replace(/\r/g, '');
const pages = text.split('\f');

const tables = [];
for (const pdfPage of [16, 17, 18, 19]) {
  const pageText = pages[pdfPage - 1];
  const sex = /WOMEN/.test(pageText) ? 'female' : 'male';
  let heights = null;
  const rows = [];
  for (const line of pageText.split('\n')) {
    const header = line.match(/^\s*Value\*?\s+((?:\d+(?:\.\d)?\s+)*\d+(?:\.\d)?)\s*$/);
    if (header) {
      heights = header[1].trim().split(/\s+/).map(Number);
      continue;
    }
    const row = line.match(/^\s*(\d+(?:\.\d)?)\s+((?:[<>]?\d+\s*)+)$/);
    if (!row || !heights) continue;
    const cells = row[2].trim().split(/\s+/).map((token) => (/^[<>]/.test(token) ? token : Number(token)));
    if (cells.length !== heights.length) throw new Error(`Page ${pdfPage}, row ${row[1]}: ${cells.length} cells but ${heights.length} heights`);
    rows.push({ circumferenceValue: Number(row[1]), cells });
  }
  tables.push({ id: `${sex}-pdf-page-${pdfPage}`, sex, pdfPage, heights, rows });
}

let numeric = 0;
let bounded = 0;
for (const table of tables) for (const row of table.rows) for (const cell of row.cells) (typeof cell === 'number' ? numeric++ : bounded++);

const fixture = {
  source: {
    title: 'The Body Composition Assessment (BCA), Guide 4',
    edition: 'JAN 2016',
    publisher: 'US Navy (copy hosted by the US Public Health Service, Commissioned Corps)',
    url: 'https://dcp.psc.gov/ccmis/pdf_docs/Body%20Composition%20Assessment%20(BCA)%202016.pdf',
    pdfPages: '16-19 (Table 2: Percent Body Fat Estimation for Men, pages 16-17; Table 3: Percent Body Fat Estimation for Women, pages 18-19)',
    fileBytes: bytes.length,
    sha256,
  },
  extraction: {
    tool: 'pdftotext -layout (Xpdf/Poppler pdftotext 4.00) followed by extract-navy-tables.mjs',
    extractedOn: '2026-11-24',
    note: 'Cell values are the printed numbers. Cells printed as limits (for example "<9") are kept as text. No equation was used to produce or check any value in this file.',
  },
  counts: { numericCells: numeric, boundedCells: bounded, tables: tables.length },
  tables,
};

fs.writeFileSync(outPath, JSON.stringify(fixture) + '\n');
console.log(JSON.stringify({ sha256, numeric, bounded, tables: tables.map((t) => ({ id: t.id, rows: t.rows.length, heights: `${t.heights[0]}-${t.heights.at(-1)}` })) }, null, 1));
