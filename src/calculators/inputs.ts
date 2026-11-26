// Shared parsing and validation of age, height and weight (CALCULATION-SPEC.md 1.2 and 1.3).
// Order of operations: parse the text -> convert to canonical units (cm, kg) -> validate -> (caller) eligibility.
// Limits are technical boundaries that catch typos and unit mix-ups; they are not medical thresholds.
// Pure functions only: no DOM, no storage, no network.

import { cmToInches, feetInchesToInches, formatFixed, inchesToCm, kgToLb, lbToKg, parseNumber } from './units.ts';

export type MeasurementSystem = 'metric' | 'imperial';

/** Technical input limits (CALCULATION-SPEC.md 1.3), on the canonical metric values. */
export const INPUT_LIMITS = {
  heightCm: { min: 100, max: 250 },
  weightKg: { min: 20, max: 500 },
  ageYears: { min: 1, max: 120 },
  /** Neck, waist and hip (CALCULATION-SPEC.md 1.3). */
  circumferenceCm: { min: 10, max: 250 },
} as const;

export const INPUT_MESSAGES = {
  ageEmpty: 'Enter your age in years.',
  ageInvalid: `Enter a whole number of years between ${INPUT_LIMITS.ageYears.min} and ${INPUT_LIMITS.ageYears.max}.`,
  heightEmpty: 'Enter your height.',
  heightInvalid: 'Enter your height as a number, for example 175.',
  weightEmpty: 'Enter your weight.',
  weightInvalid: 'Enter your weight as a number, for example 70.',
  heightRangeMetric: `Enter a height between ${INPUT_LIMITS.heightCm.min} and ${INPUT_LIMITS.heightCm.max} cm.`,
  heightRangeImperial: `Enter a height between ${formatFixed(cmToInches(INPUT_LIMITS.heightCm.min), 1)} and ${formatFixed(cmToInches(INPUT_LIMITS.heightCm.max), 1)} inches in total.`,
  weightRangeMetric: `Enter a weight between ${INPUT_LIMITS.weightKg.min} and ${INPUT_LIMITS.weightKg.max} kg.`,
  weightRangeImperial: `Enter a weight between ${formatFixed(kgToLb(INPUT_LIMITS.weightKg.min), 1)} and ${formatFixed(kgToLb(INPUT_LIMITS.weightKg.max), 1)} lb.`,
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

/**
 * Height in centimetres. Metric: `main` is cm. Imperial: `main` is feet and `inches` is inches (empty means 0);
 * they are combined into inches first (feet x 12 + inches) and then converted with 2.54 cm per inch.
 */
export function parseHeightCm(system: MeasurementSystem, main: string, inches: string): Parsed<number> {
  const imperial = system === 'imperial';
  const first = parseNumber(main);
  const second = imperial ? parseNumber(inches) : ({ state: 'ok', value: 0 } as const);
  if (first.state === 'empty') return { ok: false, message: INPUT_MESSAGES.heightEmpty };
  if (first.state === 'invalid' || second.state === 'invalid' || first.value < 0 || (second.state === 'ok' && second.value < 0)) {
    return { ok: false, message: INPUT_MESSAGES.heightInvalid };
  }
  const extra = second.state === 'ok' ? second.value : 0;
  const cm = imperial ? inchesToCm(feetInchesToInches(first.value, extra)) : first.value;
  if (cm < INPUT_LIMITS.heightCm.min || cm > INPUT_LIMITS.heightCm.max) {
    return { ok: false, message: imperial ? INPUT_MESSAGES.heightRangeImperial : INPUT_MESSAGES.heightRangeMetric };
  }
  return { ok: true, value: cm };
}

/**
 * A circumference (neck, waist or hip) in centimetres. Metric: cm. Imperial: inches, converted with 2.54 cm per inch
 * before the 10 to 250 cm limit is applied. `label` is the lower-case field name used in the messages ("neck", "waist", "hip").
 */
export function parseCircumferenceCm(system: MeasurementSystem, text: string, label: string): Parsed<number> {
  const imperial = system === 'imperial';
  const value = parseNumber(text);
  if (value.state === 'empty') return { ok: false, message: `Enter your ${label} measurement.` };
  if (value.state === 'invalid' || value.value < 0) return { ok: false, message: `Enter your ${label} measurement as a number, for example ${imperial ? '15' : '38'}.` };
  const cm = imperial ? inchesToCm(value.value) : value.value;
  const { min, max } = INPUT_LIMITS.circumferenceCm;
  if (cm < min || cm > max) {
    const range = imperial ? `${formatFixed(cmToInches(min), 1)} and ${formatFixed(cmToInches(max), 1)} inches` : `${min} and ${max} cm`;
    return { ok: false, message: `Enter a ${label} measurement between ${range}.` };
  }
  return { ok: true, value: cm };
}

/** Optional weight: empty is accepted and gives `null`; anything else is validated like a required weight. */
export function parseOptionalWeightKg(system: MeasurementSystem, text: string): Parsed<number | null> {
  if (text.trim() === '') return { ok: true, value: null };
  return parseWeightKg(system, text);
}

/** Weight in kilograms. Metric: kg. Imperial: pounds, converted with 0.45359237 kg per pound before validation. */
export function parseWeightKg(system: MeasurementSystem, text: string): Parsed<number> {
  const imperial = system === 'imperial';
  const weight = parseNumber(text);
  if (weight.state === 'empty') return { ok: false, message: INPUT_MESSAGES.weightEmpty };
  if (weight.state === 'invalid' || weight.value < 0) return { ok: false, message: INPUT_MESSAGES.weightInvalid };
  const kg = imperial ? lbToKg(weight.value) : weight.value;
  if (kg < INPUT_LIMITS.weightKg.min || kg > INPUT_LIMITS.weightKg.max) {
    return { ok: false, message: imperial ? INPUT_MESSAGES.weightRangeImperial : INPUT_MESSAGES.weightRangeMetric };
  }
  return { ok: true, value: kg };
}
