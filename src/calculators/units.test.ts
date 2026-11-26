import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CM_PER_IN,
  KG_PER_LB,
  feetInchesToInches,
  formatFixed,
  inchesToCm,
  inchesToFeetInches,
  kgToLb,
  lbToKg,
  parseNumber,
  roundHalfUp,
} from './units.ts';

describe('unit definitions (CALCULATION-SPEC.md 1.2)', () => {
  it('uses the exact international definitions', () => {
    assert.equal(CM_PER_IN, 2.54);
    assert.equal(KG_PER_LB, 0.45359237);
  });
  it('converts both ways', () => {
    assert.equal(inchesToCm(70), 177.8);
    assert.ok(Math.abs(lbToKg(150) - 68.0388555) < 1e-9);
    assert.ok(Math.abs(kgToLb(lbToKg(163.14)) - 163.14) < 1e-9);
    assert.equal(feetInchesToInches(5, 10.5), 70.5);
  });
  it('splits inches into feet and inches with carry', () => {
    assert.deepEqual(inchesToFeetInches(70.0787), { feet: 5, inches: 10.1 });
    assert.deepEqual(inchesToFeetInches(71.97), { feet: 6, inches: 0 });
    assert.deepEqual(inchesToFeetInches(60), { feet: 5, inches: 0 });
  });
});

describe('parseNumber (CALCULATION-SPEC.md 1.3)', () => {
  it('accepts decimals and a comma separator', () => {
    assert.deepEqual(parseNumber('175'), { state: 'ok', value: 175 });
    assert.deepEqual(parseNumber(' 70.5 '), { state: 'ok', value: 70.5 });
    assert.deepEqual(parseNumber('70,5'), { state: 'ok', value: 70.5 });
    assert.deepEqual(parseNumber('.5'), { state: 'ok', value: 0.5 });
  });
  it('reports empty input', () => {
    assert.deepEqual(parseNumber(''), { state: 'empty' });
    assert.deepEqual(parseNumber('   '), { state: 'empty' });
  });
  it('rejects text, NaN, exponent form and repeated separators', () => {
    for (const bad of ['abc', 'NaN', 'Infinity', '1e3', '1,2,3', '1.2.3', '--5', '5kg', '0x10', '1 000']) {
      assert.deepEqual(parseNumber(bad), { state: 'invalid' }, bad);
    }
  });
  it('keeps negative numbers so validation can reject them', () => {
    assert.deepEqual(parseNumber('-5'), { state: 'ok', value: -5 });
  });
});

describe('rounding (CALCULATION-SPEC.md 1.4)', () => {
  it('rounds half up, including binary floating-point halves', () => {
    assert.equal(roundHalfUp(24.95, 1), 25);
    assert.equal(roundHalfUp(0.05, 1), 0.1);
    assert.equal(roundHalfUp(1.005, 2), 1.01);
    assert.equal(roundHalfUp(247.5, 0), 248);
    assert.equal(roundHalfUp(2.5, 0), 3);
  });
  it('does not round values that are below the half', () => {
    assert.equal(roundHalfUp(24.949, 1), 24.9);
    assert.equal(formatFixed(24.9586, 1), '25.0');
    assert.equal(formatFixed(23.3556, 1), '23.4');
  });
});
