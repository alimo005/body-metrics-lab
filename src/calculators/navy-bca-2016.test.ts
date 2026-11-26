// Table-reproduction test (CALCULATION-SPEC.md 4.3 and 4.8) against the independently extracted tables of the
// US Navy "The Body Composition Assessment (BCA)" guide, JAN 2016. Provenance and limitations: fixtures/README.md.
//
// The expected values are the PRINTED table cells. They were extracted from the PDF text by fixtures/extract-navy-tables.mjs,
// which uses no equation. Each cell is compared with the equation evaluated at the table's own header values (CV row, height
// column), rounded to the nearest whole number. This shows the equations reproduce the printed numbers; it does not show that the
// guide's authors used these exact equations or that the original 1984 reports say the same.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { bodyFatPercent } from './body-fat.ts';
import { roundHalfUp } from './units.ts';

interface Row {
  circumferenceValue: number;
  cells: Array<number | string>;
}
interface Table {
  id: string;
  sex: 'male' | 'female';
  pdfPage: number;
  heights: number[];
  rows: Row[];
}
interface Fixture {
  source: { title: string; edition: string; url: string; fileBytes: number; sha256: string };
  extraction: { tool: string; extractedOn: string };
  counts: { numericCells: number; boundedCells: number; tables: number };
  tables: Table[];
}

const fixture = JSON.parse(fs.readFileSync(new URL('./fixtures/navy-bca-2016-percent-body-fat.json', import.meta.url), 'utf8')) as Fixture;

/** Equation value at a table's header values: the table CV is waist - neck (men) or waist + hip - neck (women). */
function equationAt(sex: 'male' | 'female', circumference: number, height: number): number {
  return sex === 'male' ? bodyFatPercent('male', height, 0, circumference) : bodyFatPercent('female', height, 0, circumference, 0);
}

describe('fixture structure and provenance', () => {
  it('records the source, the file hash and the extraction method', () => {
    assert.equal(fixture.source.title, 'The Body Composition Assessment (BCA), Guide 4');
    assert.equal(fixture.source.edition, 'JAN 2016');
    assert.match(fixture.source.url, /^https:\/\/dcp\.psc\.gov\//);
    assert.equal(fixture.source.fileBytes, 340805);
    assert.match(fixture.source.sha256, /^[0-9a-f]{64}$/);
    assert.match(fixture.extraction.tool, /pdftotext/);
    assert.equal(fixture.extraction.extractedOn, '2026-11-24');
  });
  it('has 4 tables of 20 columns, with half-inch steps, and the documented cell counts (1,996 numeric, 144 limits)', () => {
    assert.equal(fixture.tables.length, 4);
    let numeric = 0;
    let bounded = 0;
    for (const t of fixture.tables) {
      assert.equal(t.heights.length, 20, t.id);
      for (let i = 1; i < t.heights.length; i += 1) assert.equal(t.heights[i] - t.heights[i - 1], 0.5, `${t.id} heights`);
      for (let i = 1; i < t.rows.length; i += 1) assert.equal(t.rows[i].circumferenceValue - t.rows[i - 1].circumferenceValue, 0.5, `${t.id} rows`);
      for (const row of t.rows) {
        assert.equal(row.cells.length, 20, `${t.id} row ${row.circumferenceValue}`);
        for (const c of row.cells) (typeof c === 'number' ? numeric++ : bounded++);
      }
    }
    assert.equal(numeric, 1996);
    assert.equal(bounded, 144);
    assert.deepEqual(fixture.counts, { numericCells: 1996, boundedCells: 144, tables: 4 });
  });
  it('has the per-page numeric counts 424, 492, 520 and 560, and the table ranges of the guide', () => {
    const count = (id: string) => fixture.tables.find((t) => t.id === id)!.rows.flatMap((r) => r.cells).filter((c) => typeof c === 'number').length;
    assert.equal(count('male-pdf-page-16'), 424);
    assert.equal(count('male-pdf-page-17'), 492);
    assert.equal(count('female-pdf-page-18'), 520);
    assert.equal(count('female-pdf-page-19'), 560);
    const range = (id: string) => {
      const t = fixture.tables.find((x) => x.id === id)!;
      return [t.heights[0], t.heights.at(-1)];
    };
    assert.deepEqual(range('male-pdf-page-16'), [60, 69.5]);
    assert.deepEqual(range('male-pdf-page-17'), [70, 79.5]);
    assert.deepEqual(range('female-pdf-page-18'), [58, 67.5]);
    assert.deepEqual(range('female-pdf-page-19'), [68, 77.5]);
  });
});

describe('the equations reproduce the printed tables', () => {
  it('matches all 1,996 numeric cells when the equation value is rounded to the nearest whole number', () => {
    let checked = 0;
    const mismatches: string[] = [];
    for (const t of fixture.tables) {
      for (const row of t.rows) {
        row.cells.forEach((cell, i) => {
          if (typeof cell !== 'number') return;
          const value = equationAt(t.sex, row.circumferenceValue, t.heights[i]);
          checked += 1;
          if (roundHalfUp(value, 0) !== cell) mismatches.push(`${t.id} CV ${row.circumferenceValue} h ${t.heights[i]}: printed ${cell}, equation ${value}`);
        });
      }
    }
    assert.equal(checked, 1996);
    assert.deepEqual(mismatches, []);
  });
  it('is consistent with all 144 cells printed as limits ("<n": below n; ">n": above n)', () => {
    let checked = 0;
    const bad: string[] = [];
    for (const t of fixture.tables) {
      for (const row of t.rows) {
        row.cells.forEach((cell, i) => {
          if (typeof cell !== 'string') return;
          const limit = Number(cell.slice(1));
          const value = equationAt(t.sex, row.circumferenceValue, t.heights[i]);
          checked += 1;
          const consistent = cell.startsWith('<') ? value < limit : value > limit;
          if (!consistent) bad.push(`${t.id} CV ${row.circumferenceValue} h ${t.heights[i]}: printed ${cell}, equation ${value}`);
        });
      }
    }
    assert.equal(checked, 144);
    assert.deepEqual(bad, []);
  });
  it('rounds to the nearest integer, not by truncation, and no cell is near a .5 tie (half-up and half-even agree)', () => {
    let truncationMatches = 0;
    let numeric = 0;
    let closestToTie = 1;
    for (const t of fixture.tables) {
      for (const row of t.rows) {
        row.cells.forEach((cell, i) => {
          if (typeof cell !== 'number') return;
          const value = equationAt(t.sex, row.circumferenceValue, t.heights[i]);
          numeric += 1;
          if (Math.floor(value) === cell) truncationMatches += 1;
          closestToTie = Math.min(closestToTie, Math.abs((value - Math.floor(value)) - 0.5));
        });
      }
    }
    assert.ok(truncationMatches < numeric * 0.6, `truncation would match ${truncationMatches} of ${numeric}`);
    assert.ok(closestToTie > 0.001, `closest to a tie: ${closestToTie}`);
  });
  it('reproduces the eight spot checks of CALCULATION-SPEC.md 4.3', () => {
    const cell = (id: string, cv: number, h: number) => {
      const t = fixture.tables.find((x) => x.id === id)!;
      return t.rows.find((r) => r.circumferenceValue === cv)!.cells[t.heights.indexOf(h)];
    };
    assert.equal(cell('male-pdf-page-16', 20, 60), 24);
    assert.equal(cell('male-pdf-page-17', 20, 79.5), 16);
    assert.equal(cell('female-pdf-page-18', 50.5, 58), 27);
    assert.equal(cell('female-pdf-page-18', 50.5, 67.5), 21);
    assert.equal(roundHalfUp(equationAt('male', 20, 60), 0), 24);
    assert.equal(roundHalfUp(equationAt('male', 20, 79.5), 0), 16);
    assert.equal(roundHalfUp(equationAt('female', 50.5, 58), 0), 27);
    assert.equal(roundHalfUp(equationAt('female', 50.5, 67.5), 0), 21);
  });
  it('would catch the conflicting equations: the hip-less women version and a natural logarithm fail the tables', () => {
    const womenTable = fixture.tables.filter((t) => t.sex === 'female');
    let hipLessMismatch = 0;
    let naturalLogMismatch = 0;
    for (const t of womenTable) {
      for (const row of t.rows) {
        row.cells.forEach((cell, i) => {
          if (typeof cell !== 'number') return;
          // hip-less reading: treat the printed CV as waist - neck only would change the CV; use a smaller CV instead
          if (roundHalfUp(equationAt('female', row.circumferenceValue - 35, t.heights[i]), 0) !== cell) hipLessMismatch += 1;
          const natural = 163.205 * Math.log(row.circumferenceValue) - 97.684 * Math.log(t.heights[i]) - 78.387;
          if (roundHalfUp(natural, 0) !== cell) naturalLogMismatch += 1;
        });
      }
    }
    assert.ok(hipLessMismatch > 500, `${hipLessMismatch}`);
    assert.ok(naturalLogMismatch > 500, `${naturalLogMismatch}`);
  });
});
