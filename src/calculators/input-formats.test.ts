// One table of accepted and rejected number formats, run through every numeric field of all three calculators
// (CALCULATION-SPEC.md 1.3, owner decision 2026-11-26): English digits 0-9 and the period as the only decimal separator.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateBmi } from './bmi.ts';
import { evaluateEnergy } from './bmr-tdee.ts';
import { evaluateBodyFat } from './body-fat.ts';

const ACCEPTED = ['178', '84', '84.5', '5.25', ' 84 ', '84.', '.5'];
const REJECTED = ['84,5', '178,0', '84٫5', '١٧٨', '٨٤', '+84', '84 cm', '84cm', '75kg', "5'10", '5 ft', '8 4', '1,000', '84.5.1', '84..5', '1e2', 'NaN', 'abc', '--84'];

// Fields are filled with a valid base value; one field at a time gets the tested text.
const bmi = (patch: Record<string, string>) => evaluateBmi({ sex: 'male', age: '30', height: '178', weight: '74', ...patch });
const energy = (patch: Record<string, string>) => evaluateEnergy({ sex: 'male', age: '30', height: '178', weight: '74', activity: 'active', ...patch } as never);
const fat = (patch: Record<string, string>) => evaluateBodyFat({ sex: 'female', height: '165', neck: '32', waist: '72', hip: '98', weight: '60', ...patch });

type Evaluate = (patch: Record<string, string>) => { status: string; errors?: Record<string, string> };
const fields: Array<{ calculator: string; evaluate: Evaluate; field: string; base: Record<string, string>; sizeOk: (text: string) => boolean }> = [
  { calculator: 'BMI', evaluate: bmi as Evaluate, field: 'height', base: {}, sizeOk: () => true },
  { calculator: 'BMI', evaluate: bmi as Evaluate, field: 'weight', base: {}, sizeOk: () => true },
  { calculator: 'BMR & TDEE', evaluate: energy as Evaluate, field: 'height', base: {}, sizeOk: () => true },
  { calculator: 'BMR & TDEE', evaluate: energy as Evaluate, field: 'weight', base: {}, sizeOk: () => true },
  { calculator: 'Body Fat', evaluate: fat as Evaluate, field: 'height', base: {}, sizeOk: () => true },
  { calculator: 'Body Fat', evaluate: fat as Evaluate, field: 'neck', base: {}, sizeOk: () => true },
  { calculator: 'Body Fat', evaluate: fat as Evaluate, field: 'waist', base: {}, sizeOk: () => true },
  { calculator: 'Body Fat', evaluate: fat as Evaluate, field: 'hip', base: {}, sizeOk: () => true },
  { calculator: 'Body Fat', evaluate: fat as Evaluate, field: 'weight', base: {}, sizeOk: () => true },
];

describe('rejected formats give the field a "digits and a decimal point only" message, in every numeric field of all three calculators', () => {
  for (const f of fields) {
    it(`${f.calculator}: ${f.field}`, () => {
      for (const bad of REJECTED) {
        const r = f.evaluate({ [f.field]: bad });
        assert.equal(r.status, 'invalid', `${f.field} "${bad}"`);
        assert.match(r.errors?.[f.field] ?? '', /digits and a decimal point only/, `${f.field} "${bad}"`);
      }
    });
  }
});

describe('accepted formats are read as numbers (a number that is inside the limits gives a result)', () => {
  it('BMI: 5.25 style decimals and surrounding spaces', () => {
    assert.equal(bmi({ height: '175.5', weight: '70.25' }).status, 'ok');
    assert.equal(bmi({ height: ' 178 ', weight: ' 74 ' }).status, 'ok');
  });
  it('BMR & TDEE', () => {
    assert.equal(energy({ height: '175.5', weight: '70.25' }).status, 'ok');
    assert.equal(energy({ height: ' 178 ', weight: ' 74 ' }).status, 'ok');
  });
  it('Body Fat', () => {
    assert.equal(fat({ height: '165.5', neck: '32.5', waist: '72.25', hip: '98.75', weight: '60.5' }).status, 'ok');
    assert.equal(fat({ height: ' 165 ', neck: ' 32 ' }).status, 'ok');
  });
  it('every accepted spelling parses to a number: none is reported as a format error', () => {
    for (const good of ACCEPTED) {
      for (const f of fields) {
        const r = f.evaluate({ [f.field]: good });
        const message = r.errors?.[f.field] ?? '';
        assert.doesNotMatch(message, /digits and a decimal point only/, `${f.calculator} ${f.field} "${good}"`);
      }
    }
  });
});

describe('a period decimal and a comma decimal are no longer the same thing', () => {
  it('84.5 works and 84,5 does not, for the same field', () => {
    assert.equal(fat({ waist: '84.5' }).status, 'ok');
    assert.equal(fat({ waist: '84,5' }).status, 'invalid');
    assert.equal(bmi({ height: '175.5' }).status, 'ok');
    assert.equal(bmi({ height: '175,5' }).status, 'invalid');
  });
});
