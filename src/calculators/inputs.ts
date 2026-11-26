// Shared parsing and validation of age, height, weight and circumferences (CALCULATION-SPEC.md 1.3).
// Version 1 is METRIC-ONLY (owner decision 2026-11-26): height and circumferences are typed in cm, weight in kg.
// Order of operations: parse the text (English digits and a decimal point) -> validate against the metric limits -> (caller) eligibility.
// Limits are technical boundaries that catch typos and unit mix-ups; they are not medical thresholds.
// Pure functions only: no DOM, no storage, no network.

import { parseNumber } from './units.ts';

/** Technical input limits (CALCULATION-SPEC.md 1.3). */
export const INPUT_LIMITS = {
  heightCm: { min: 100, max: 250 },
  weightKg: { min: 20, max: 500 },
  ageYears: { min: 1, max: 120 },
  /** Neck, waist and hip (CALCULATION-SPEC.md 1.3). */
  circumferenceCm: { min: 10, max: 250 },
} as const;

/** How every "not a number" message ends: it says exactly what is expected. */
const FORMAT_HINT = 'using digits and a decimal point only. Do not add units';

export const INPUT_MESSAGES = {
  ageEmpty: 'Enter your age in years.',
  ageInvalid: `Enter a whole number of years between ${INPUT_LIMITS.ageYears.min} and ${INPUT_LIMITS.ageYears.max}.`,
  heightEmpty: 'Enter your height in centimetres.',
  heightInvalid: `Enter your height in centimetres, ${FORMAT_HINT} (for example 178).`,
  weightEmpty: 'Enter your weight in kilograms.',
  weightInvalid: `Enter your weight in kilograms, ${FORMAT_HINT} (for example 70).`,
  heightRange: `Enter a height between ${INPUT_LIMITS.heightCm.min} and ${INPUT_LIMITS.heightCm.max} cm.`,
  weightRange: `Enter a weight between ${INPUT_LIMITS.weightKg.min} and ${INPUT_LIMITS.weightKg.max} kg.`,
} as const;

export type Parsed<T> = { ok: true; value: T } | { ok: false; message: string };

/** Whole-number age in years, 1 to 120. Decimals, text and empty input are errors. */
export function parseWholeAge(text: string): Parsed<number> {
  const age = parseNumber(text);
  if (age.state === 'empty') return { ok: false, message: INPUT_MESSAGES.ageEmpty };
  if (age.state === 'invalid' || !Number.isInteger(age.value) || age.value < INPUT_LIMITS.ageYears.min || age.value > INPUT_LIMITS.ageYears.max) {
    return { ok: false, message: INPUT_MESSAGES.ageInvalid };
  }
  return { ok: true, value: age.value };
}

/** Height in centimetres (100 to 250). */
export function parseHeightCm(text: string): Parsed<number> {
  const height = parseNumber(text);
  if (height.state === 'empty') return { ok: false, message: INPUT_MESSAGES.heightEmpty };
  if (height.state === 'invalid' || height.value < 0) return { ok: false, message: INPUT_MESSAGES.heightInvalid };
  if (height.value < INPUT_LIMITS.heightCm.min || height.value > INPUT_LIMITS.heightCm.max) return { ok: false, message: INPUT_MESSAGES.heightRange };
  return { ok: true, value: height.value };
}

/**
 * A circumference (neck, waist or hip) in centimetres (10 to 250). `label` is the lower-case field name used in the
 * messages ("neck", "waist", "hip").
 */
export function parseCircumferenceCm(text: string, label: string): Parsed<number> {
  const value = parseNumber(text);
  if (value.state === 'empty') return { ok: false, message: `Enter your ${label} measurement in centimetres.` };
  if (value.state === 'invalid' || value.value < 0) {
    return { ok: false, message: `Enter your ${label} measurement in centimetres, ${FORMAT_HINT} (for example ${label === 'neck' ? '38' : label === 'hip' ? '98' : '84'}).` };
  }
  const { min, max } = INPUT_LIMITS.circumferenceCm;
  if (value.value < min || value.value > max) return { ok: false, message: `Enter a ${label} measurement between ${min} and ${max} cm.` };
  return { ok: true, value: value.value };
}

/** Optional weight: empty is accepted and gives `null`; anything else is validated like a required weight. */
export function parseOptionalWeightKg(text: string): Parsed<number | null> {
  if (text.trim() === '') return { ok: true, value: null };
  return parseWeightKg(text);
}

/** Weight in kilograms (20 to 500). */
export function parseWeightKg(text: string): Parsed<number> {
  const weight = parseNumber(text);
  if (weight.state === 'empty') return { ok: false, message: INPUT_MESSAGES.weightEmpty };
  if (weight.state === 'invalid' || weight.value < 0) return { ok: false, message: INPUT_MESSAGES.weightInvalid };
  if (weight.value < INPUT_LIMITS.weightKg.min || weight.value > INPUT_LIMITS.weightKg.max) return { ok: false, message: INPUT_MESSAGES.weightRange };
  return { ok: true, value: weight.value };
}
