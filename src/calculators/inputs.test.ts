// Shared input parsing and validation: CALCULATION-SPEC.md 1.2 and 1.3.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { INPUT_LIMITS, INPUT_MESSAGES, parseCircumferenceCm, parseHeightCm, parseOptionalWeightKg, parseWeightKg, parseWholeAge } from './inputs.ts';
import { LIMITS } from './bmi.ts';

describe('limits are the owner-approved ones (CALCULATION-SPEC.md 1.3) and agree with BMI', () => {
  it('has the canonical limits', () => {
    assert.deepEqual(INPUT_LIMITS.heightCm, { min: 100, max: 250 });
    assert.deepEqual(INPUT_LIMITS.weightKg, { min: 20, max: 500 });
    assert.deepEqual(INPUT_LIMITS.ageYears, { min: 1, max: 120 });
  });
  it('matches the limits used by the BMI calculator', () => {
    assert.deepEqual(INPUT_LIMITS.heightCm, LIMITS.heightCm);
    assert.deepEqual(INPUT_LIMITS.weightKg, LIMITS.weightKg);
    assert.deepEqual(INPUT_LIMITS.ageYears, LIMITS.ageYears);
  });
  it('shows imperial limits as the converted, rounded values', () => {
    assert.match(INPUT_MESSAGES.heightRangeImperial, /39\.4 and 98\.4 inches/);
    assert.match(INPUT_MESSAGES.weightRangeImperial, /44\.1 and 1102\.3 lb/);
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
    assert.equal((parseWholeAge('') as { message: string }).message, INPUT_MESSAGES.ageEmpty);
    assert.equal((parseWholeAge('20.5') as { message: string }).message, INPUT_MESSAGES.ageInvalid);
  });
});

describe('parseHeightCm', () => {
  it('metric: inclusive 100 to 250 cm, rejects just outside', () => {
    assert.deepEqual(parseHeightCm('metric', '100', ''), { ok: true, value: 100 });
    assert.deepEqual(parseHeightCm('metric', '250', ''), { ok: true, value: 250 });
    assert.equal(parseHeightCm('metric', '99.99', '').ok, false);
    assert.equal(parseHeightCm('metric', '250.01', '').ok, false);
  });
  it('imperial: feet and inches are combined first, then converted with 2.54', () => {
    const r = parseHeightCm('imperial', '5', '10');
    assert.equal(r.ok, true);
    assert.ok(Math.abs((r as { value: number }).value - 177.8) < 1e-9);
    assert.equal(parseHeightCm('imperial', '5', '').ok, true); // empty inches mean 0
  });
  it('imperial: validation uses the converted value (39.37 in is 99.9998 cm)', () => {
    assert.equal(parseHeightCm('imperial', '3', '3.37').ok, false);
    assert.equal(parseHeightCm('imperial', '3', '3.38').ok, true);
    assert.equal(parseHeightCm('imperial', '8', '2.42').ok, true);
    assert.equal(parseHeightCm('imperial', '8', '2.43').ok, false);
  });
  it('rejects empty, text, negative, NaN and a missing foot value', () => {
    assert.equal((parseHeightCm('metric', '', '') as { message: string }).message, INPUT_MESSAGES.heightEmpty);
    for (const bad of ['abc', 'NaN', '-175', '0', '1e2']) assert.equal(parseHeightCm('metric', bad, '').ok, false, bad);
    assert.equal(parseHeightCm('imperial', '', '10').ok, false);
    assert.equal(parseHeightCm('imperial', '5', 'x').ok, false);
    assert.equal(parseHeightCm('imperial', '5', '-1').ok, false);
  });
  it('accepts a comma decimal separator', () => {
    assert.deepEqual(parseHeightCm('metric', '175,5', ''), { ok: true, value: 175.5 });
  });
});

describe('parseWeightKg', () => {
  it('metric: inclusive 20 to 500 kg, rejects just outside', () => {
    assert.deepEqual(parseWeightKg('metric', '20'), { ok: true, value: 20 });
    assert.deepEqual(parseWeightKg('metric', '500'), { ok: true, value: 500 });
    assert.equal(parseWeightKg('metric', '19.99').ok, false);
    assert.equal(parseWeightKg('metric', '500.01').ok, false);
  });
  it('imperial: converts pounds to kg with 0.45359237 before validating', () => {
    const r = parseWeightKg('imperial', '150');
    assert.ok(Math.abs((r as { value: number }).value - 68.0388555) < 1e-9);
    assert.equal(parseWeightKg('imperial', '44.09').ok, false); // 19.998 kg
    assert.equal(parseWeightKg('imperial', '44.1').ok, true);
    assert.equal(parseWeightKg('imperial', '1102.3').ok, true);
    assert.equal(parseWeightKg('imperial', '1102.32').ok, false);
  });
  it('rejects empty, text, negative, zero and NaN', () => {
    assert.equal((parseWeightKg('metric', '') as { message: string }).message, INPUT_MESSAGES.weightEmpty);
    for (const bad of ['abc', 'NaN', '-70', '0', '1e2']) assert.equal(parseWeightKg('metric', bad).ok, false, bad);
  });
  it('messages state technical limits only, without health wording', () => {
    for (const msg of Object.values(INPUT_MESSAGES)) assert.doesNotMatch(msg, /healthy|safe|recommend|medical/i);
  });
});

describe('parseCircumferenceCm: neck, waist and hip (CALCULATION-SPEC.md 1.3)', () => {
  it('has the approved 10 to 250 cm limit', () => {
    assert.deepEqual(INPUT_LIMITS.circumferenceCm, { min: 10, max: 250 });
  });
  it('metric: inclusive 10 to 250 cm, rejects just outside', () => {
    assert.deepEqual(parseCircumferenceCm('metric', '10', 'neck'), { ok: true, value: 10 });
    assert.deepEqual(parseCircumferenceCm('metric', '250', 'waist'), { ok: true, value: 250 });
    assert.equal(parseCircumferenceCm('metric', '9.99', 'neck').ok, false);
    assert.equal(parseCircumferenceCm('metric', '250.01', 'waist').ok, false);
  });
  it('imperial: validated after conversion (3.9 in is 9.906 cm, 3.94 in is 10.008 cm, 98.43 in is 250.02 cm)', () => {
    assert.equal(parseCircumferenceCm('imperial', '3.9', 'neck').ok, false);
    assert.equal(parseCircumferenceCm('imperial', '3.94', 'neck').ok, true);
    assert.equal(parseCircumferenceCm('imperial', '98.42', 'hip').ok, true);
    assert.equal(parseCircumferenceCm('imperial', '98.43', 'hip').ok, false);
    const r = parseCircumferenceCm('imperial', '14', 'neck');
    assert.ok(Math.abs((r as { value: number }).value - 35.56) < 1e-9);
  });
  it('names the field in each message and uses the approved hip wording when empty', () => {
    assert.equal((parseCircumferenceCm('metric', '', 'hip') as { message: string }).message, 'Enter your hip measurement.');
    assert.equal((parseCircumferenceCm('metric', '  ', 'neck') as { message: string }).message, 'Enter your neck measurement.');
    assert.match((parseCircumferenceCm('metric', 'abc', 'waist') as { message: string }).message, /waist measurement as a number/);
    assert.match((parseCircumferenceCm('metric', '5', 'waist') as { message: string }).message, /between 10 and 250 cm/);
    assert.match((parseCircumferenceCm('imperial', '2', 'waist') as { message: string }).message, /between 3\.9 and 98\.4 inches/);
  });
  it('rejects text, NaN, negative, zero and exponent input, and accepts a comma decimal', () => {
    for (const bad of ['abc', 'NaN', '-30', '0', '1e2']) assert.equal(parseCircumferenceCm('metric', bad, 'neck').ok, false, bad);
    assert.deepEqual(parseCircumferenceCm('metric', '38,5', 'neck'), { ok: true, value: 38.5 });
  });
});

describe('parseOptionalWeightKg', () => {
  it('accepts an empty weight as null', () => {
    assert.deepEqual(parseOptionalWeightKg('metric', ''), { ok: true, value: null });
    assert.deepEqual(parseOptionalWeightKg('imperial', '   '), { ok: true, value: null });
  });
  it('validates a provided weight exactly like a required one', () => {
    assert.deepEqual(parseOptionalWeightKg('metric', '76'), { ok: true, value: 76 });
    assert.equal(parseOptionalWeightKg('metric', 'abc').ok, false);
    assert.equal(parseOptionalWeightKg('metric', '19.99').ok, false);
    assert.equal(parseOptionalWeightKg('imperial', '44.09').ok, false);
    assert.equal(parseOptionalWeightKg('imperial', '44.1').ok, true);
  });
});
