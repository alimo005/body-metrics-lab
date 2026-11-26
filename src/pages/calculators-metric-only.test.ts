// Guard for the metric-only policy (owner decision 2026-11-26, CALCULATION-SPEC.md 1.3): the three public calculators must not
// contain an imperial toggle, feet, inches or pounds fields, or imperial instructions. Reads the page and script sources.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = new URL('../../', import.meta.url);
const read = (path: string): string => readFileSync(new URL(path, root), 'utf8');

const calculators = [
  { name: 'BMI', page: 'src/pages/calculators/bmi.astro', script: 'src/scripts/bmi-page.ts', logic: ['src/calculators/bmi.ts'] },
  { name: 'BMR & TDEE', page: 'src/pages/calculators/bmr-tdee.astro', script: 'src/scripts/bmr-tdee-page.ts', logic: ['src/calculators/bmr-tdee.ts'] },
  { name: 'Body Fat', page: 'src/pages/calculators/body-fat.astro', script: 'src/scripts/body-fat-page.ts', logic: ['src/calculators/body-fat.ts', 'src/calculators/body-fat-view.ts'] },
];

describe('no imperial interface in any public calculator', () => {
  for (const c of calculators) {
    const page = read(c.page);
    it(`${c.name}: no Metric/Imperial toggle`, () => {
      assert.doesNotMatch(page, /name="system"/);
      assert.doesNotMatch(page, /Measurement system/);
      assert.doesNotMatch(page, /imperial/i);
      assert.doesNotMatch(page, /Metric \(cm, kg\)/);
    });
    it(`${c.name}: no feet, inches or pounds fields or units`, () => {
      assert.doesNotMatch(page, /id="height-(ft|in|cm)"/);
      assert.doesNotMatch(page, /unit="(ft|in|lb)"/);
      assert.doesNotMatch(page, /label="(Feet|Inches|Pounds)/);
      assert.doesNotMatch(page, /US customary/i);
      assert.doesNotMatch(page, /\b(ft\/in|\bpounds?\b)/i);
    });
    it(`${c.name}: height is one cm field and weight is a kg field`, () => {
      assert.match(page, /<NumberField id="height" label="Height" unit="cm"/);
      assert.match(page, /unit="kg"/);
    });
    it(`${c.name}: the page script and logic have no unit-system code`, () => {
      for (const file of [c.script, ...c.logic]) {
        const text = read(file);
        assert.doesNotMatch(text, /imperial/i, file);
        assert.doesNotMatch(text, /switchSystem|applySystem|heightFt|heightInches|height-ft|kgToLb|lbToKg|feetInches/, file);
      }
    });
  }
  it('Body Fat has its optional weight in kg and neck, waist and hip in cm', () => {
    const page = read('src/pages/calculators/body-fat.astro');
    for (const id of ['neck', 'waist', 'hip']) assert.match(page, new RegExp(`id="${id}"[^>]*unit="cm"`));
    assert.match(page, /id="weight" label="Weight \(optional\)" unit="kg"/);
  });
  it('the Body Fat page keeps the Navy equations in inches internally (cm / 2.54), not as a user unit', () => {
    assert.match(read('src/calculators/body-fat.ts'), /cmToInches/);
  });
  it('the Body Fat page script renders the tested view state and listens for edits', () => {
    const script = read('src/scripts/body-fat-page.ts');
    assert.match(script, /viewAfterEdit/);
    assert.match(script, /addEventListener\('input'/);
  });
});
