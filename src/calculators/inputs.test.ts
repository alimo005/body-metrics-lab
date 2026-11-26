// Shared input parsing and validation: CALCULATION-SPEC.md 1.3 (metric-only, owner decision 2026-11-26).
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { INPUT_LIMITS, INPUT_MESSAGES, parseCircumferenceCm, parseHeightCm, parseOptionalWeightKg, parseWeightKg, parseWholeAge } from './inputs.ts';
import { LIMITS } from './bmi.ts';

const message = (r: unknown): string => (r as { message: string }).message;

/** Typed values that are not plain English digits with a decimal point: each must be rejected by every numeric field. */
const NOT_PLAIN_NUMBERS = ['abc', 'NaN', '1e2', '84 cm', '84cm', '75kg', "5'10", '5ft 10', '١٧٨', '٣٨٫٥', '84٫5', '1,7,5', '84..5', '--5', '84.5.1', '84-', 'Infinity'];

describe('limits are the owner-approved ones (CALCULATION-SPEC.md 1.3) and agree with BMI', () => {
  it('has the canonical limits', () => {
    assert.deepEqual(INPUT_LIMITS.heightCm, { min: 100, max: 250 });
    assert.deepEqual(INPUT_LIMITS.weightKg, { min: 20, max: 500 });
    assert.deepEqual(INPUT_LIMITS.ageYears, { min: 1, max: 120 });
    assert.deepEqual(INPUT_LIMITS.circumferenceCm, { min: 10, max: 250 });
  });
  it('matches the limits used by the BMI calculator', () => {
    assert.deepEqual(INPUT_LIMITS.heightCm, LIMITS.heightCm);
    assert.deepEqual(INPUT_LIMITS.weightKg, LIMITS.weightKg);
    assert.deepEqual(INPUT_LIMITS.ageYears, LIMITS.ageYears);
  });
  it('has no imperial messages or limits any more', () => {
    for (const key of Object.keys(INPUT_MESSAGES)) assert.doesNotMatch(key, /imperial/i);
    for (const text of Object.values(INPUT_MESSAGES)) assert.doesNotMatch(text, /\b(inches|feet|pounds|lb)\b/i);
  });
});

describe('parseWholeAge', () => {
  it('accepts whole numbers 1 to 120 inclusive', () => {
    for (const a of ['1', '19', '78', '120', ' 45 ']) assert.equal(parseWholeAge(a).ok, true, a);
    assert.deepEqual(parseWholeAge('78'), { ok: true, value: 78 });
  });
  it('rejects empty, text, decimals, zero, negative, below 1 and above 120', () => {
    for (const a of ['', '  ', 'abc', 'NaN', '20.5', '19,5', '0', '-4', '121', '1e2', '1000']) {
      const r = parseWholeAge(a);
      assert.equal(r.ok, false, a);
    }
    assert.equal(message(parseWholeAge('')), INPUT_MESSAGES.ageEmpty);
    assert.equal(message(parseWholeAge('20.5')), INPUT_MESSAGES.ageInvalid);
  });
});

describe('parseHeightCm', () => {
  it('accepts 100 to 250 cm inclusive and rejects just outside', () => {
    assert.deepEqual(parseHeightCm('100'), { ok: true, value: 100 });
    assert.deepEqual(parseHeightCm('250'), { ok: true, value: 250 });
    assert.equal(parseHeightCm('99.99').ok, false);
    assert.equal(parseHeightCm('250.01').ok, false);
    assert.equal(message(parseHeightCm('99')), 'Enter a height between 100 and 250 cm.');
  });
  it('accepts decimal values', () => {
    assert.deepEqual(parseHeightCm('178.5'), { ok: true, value: 178.5 });
    assert.deepEqual(parseHeightCm('175,5'), { ok: true, value: 175.5 }); // existing comma tolerance, unchanged
  });
  it('says what is expected when empty, and rejects negatives and zero', () => {
    assert.equal(message(parseHeightCm('')), 'Enter your height in centimetres.');
    for (const bad of ['-175', '0']) assert.equal(parseHeightCm(bad).ok, false, bad);
  });
  it('rejects unit text, feet-and-inches notation and non-ASCII digits with a message that says what to type', () => {
    for (const bad of NOT_PLAIN_NUMBERS) {
      const r = parseHeightCm(bad);
      assert.equal(r.ok, false, bad);
      assert.match(message(r), /Enter your height in centimetres, using digits and a decimal point only\. Do not add units \(for example 178\)\./, bad);
    }
  });
});

describe('parseWeightKg', () => {
  it('accepts 20 to 500 kg inclusive and rejects just outside', () => {
    assert.deepEqual(parseWeightKg('20'), { ok: true, value: 20 });
    assert.deepEqual(parseWeightKg('500'), { ok: true, value: 500 });
    assert.equal(parseWeightKg('19.99').ok, false);
    assert.equal(parseWeightKg('500.01').ok, false);
    assert.equal(message(parseWeightKg('10')), 'Enter a weight between 20 and 500 kg.');
  });
  it('accepts decimal values', () => {
    assert.deepEqual(parseWeightKg('70.25'), { ok: true, value: 70.25 });
  });
  it('says what is expected when empty; rejects negative and zero', () => {
    assert.equal(message(parseWeightKg('')), 'Enter your weight in kilograms.');
    for (const bad of ['-70', '0']) assert.equal(parseWeightKg(bad).ok, false, bad);
  });
  it('rejects unit text and non-ASCII digits with a message that says what to type', () => {
    for (const bad of NOT_PLAIN_NUMBERS) {
      const r = parseWeightKg(bad);
      assert.equal(r.ok, false, bad);
      assert.match(message(r), /Enter your weight in kilograms, using digits and a decimal point only\. Do not add units \(for example 70\)\./, bad);
    }
  });
  it('messages state technical limits only, without health wording', () => {
    for (const msg of Object.values(INPUT_MESSAGES)) assert.doesNotMatch(msg, /healthy|safe|recommend|medical/i);
  });
});

describe('parseCircumferenceCm: neck, waist and hip (CALCULATION-SPEC.md 1.3)', () => {
  it('accepts 10 to 250 cm inclusive and rejects just outside', () => {
    assert.deepEqual(parseCircumferenceCm('10', 'neck'), { ok: true, value: 10 });
    assert.deepEqual(parseCircumferenceCm('250', 'waist'), { ok: true, value: 250 });
    assert.equal(parseCircumferenceCm('9.99', 'neck').ok, false);
    assert.equal(parseCircumferenceCm('250.01', 'waist').ok, false);
  });
  it('keeps the typed centimetre value (no conversion)', () => {
    assert.deepEqual(parseCircumferenceCm('35.56', 'neck'), { ok: true, value: 35.56 });
  });
  it('names the field in each message and says the unit when empty', () => {
    assert.equal(message(parseCircumferenceCm('', 'hip')), 'Enter your hip measurement in centimetres.');
    assert.equal(message(parseCircumferenceCm('  ', 'neck')), 'Enter your neck measurement in centimetres.');
    assert.equal(message(parseCircumferenceCm('5', 'waist')), 'Enter a waist measurement between 10 and 250 cm.');
  });
  it('rejects unit text and non-ASCII digits, with an example suited to the field', () => {
    const example = { neck: '38', waist: '84', hip: '98' } as const;
    for (const label of ['neck', 'waist', 'hip'] as const) {
      for (const bad of NOT_PLAIN_NUMBERS) {
        const r = parseCircumferenceCm(bad, label);
        assert.equal(r.ok, false, `${label} ${bad}`);
        assert.equal(message(r), `Enter your ${label} measurement in centimetres, using digits and a decimal point only. Do not add units (for example ${example[label]}).`);
      }
    }
  });
  it('rejects negative and zero; accepts decimals (and the existing comma tolerance)', () => {
    for (const bad of ['-30', '0']) assert.equal(parseCircumferenceCm(bad, 'neck').ok, false, bad);
    assert.deepEqual(parseCircumferenceCm('38.5', 'neck'), { ok: true, value: 38.5 });
    assert.deepEqual(parseCircumferenceCm('38,5', 'neck'), { ok: true, value: 38.5 });
  });
});

describe('parseOptionalWeightKg', () => {
  it('accepts an empty weight as null', () => {
    assert.deepEqual(parseOptionalWeightKg(''), { ok: true, value: null });
    assert.deepEqual(parseOptionalWeightKg('   '), { ok: true, value: null });
  });
  it('validates a provided weight exactly like a required one', () => {
    assert.deepEqual(parseOptionalWeightKg('76'), { ok: true, value: 76 });
    assert.equal(parseOptionalWeightKg('abc').ok, false);
    assert.equal(parseOptionalWeightKg('75kg').ok, false);
    assert.equal(parseOptionalWeightKg('19.99').ok, false);
  });
});
