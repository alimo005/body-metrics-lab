// Body fat calculator logic: CALCULATION-SPEC.md section 4.
// Classic Hodgdon and Beckett (1984) circumference equations, developed for the US Navy. Measurements in INCHES,
// logarithms base 10, result in percent body fat. The circumference value (CV) is computed first, then log10, then the coefficient.
//   Men:   %BF = 86.010 x log10(waist - neck) - 70.041 x log10(height) + 36.76
//   Women: %BF = 163.205 x log10(waist + hip - neck) - 97.684 x log10(height) - 78.387
// The hip is used ONLY for women. Weight is NOT part of the percentage; it is only used for fat and lean mass.
// This is the continuous equation, not the Navy lookup-table procedure (no half-inch rounding, no integer result), and it is
// never described as the current official US Navy standard.
// Pure functions only: no DOM, no storage, no network.

import { parseCircumferenceCm, parseHeightCm, parseOptionalWeightKg } from './inputs.ts';
import type { MeasurementSystem } from './inputs.ts';
import { cmToInches, formatFixed, kgToLb } from './units.ts';

export type Sex = 'male' | 'female';

export interface BodyFatCoefficients {
  /** Multiplier of log10(circumference value). */
  circumference: number;
  /** Multiplier of log10(height), subtracted. */
  height: number;
  constant: number;
}

export const BODY_FAT_COEFFICIENTS: Readonly<Record<Sex, BodyFatCoefficients>> = {
  male: { circumference: 86.01, height: 70.041, constant: 36.76 },
  female: { circumference: 163.205, height: 97.684, constant: -78.387 },
};

/** Circumference value in inches: men waist - neck; women waist + hip - neck. The hip is ignored for men. */
export function circumferenceValue(sex: Sex, waistIn: number, neckIn: number, hipIn = 0): number {
  return sex === 'male' ? waistIn - neckIn : waistIn + hipIn - neckIn;
}

/**
 * Exact (unrounded) percent body fat from measurements in inches. The caller must make sure the circumference value
 * is greater than zero (the logarithm domain); `evaluateBodyFat` does that and never returns NaN or Infinity.
 */
export function bodyFatPercent(sex: Sex, heightIn: number, neckIn: number, waistIn: number, hipIn = 0): number {
  const c = BODY_FAT_COEFFICIENTS[sex];
  return c.circumference * Math.log10(circumferenceValue(sex, waistIn, neckIn, hipIn)) - c.height * Math.log10(heightIn) + c.constant;
}

/** Validation and check messages (owner-approved wording, CALCULATION-SPEC.md 4.5). */
export const BODY_FAT_MESSAGES = {
  domainMale: 'The waist measurement must be larger than the neck measurement.',
  domainFemale: 'The waist and hip measurements added together must be larger than the neck measurement.',
  implausible:
    'These measurements do not give a possible body-fat percentage (0% or below, or above 100%). Check each measurement and the selected units.',
} as const;

export type BodyFatFieldName = 'height' | 'neck' | 'waist' | 'hip' | 'weight';
export type BodyFatFieldErrors = Partial<Record<BodyFatFieldName, string>>;

export interface BodyFatInput {
  system: MeasurementSystem;
  sex: Sex;
  /** Height in cm (metric) or feet (imperial). */
  heightMain: string;
  /** Inches (imperial only; empty means 0). */
  heightInches: string;
  /** Neck, waist and hip in cm (metric) or inches (imperial). The hip is ignored for men. */
  neck: string;
  waist: string;
  hip: string;
  /** Optional weight in kg (metric) or lb (imperial). */
  weight: string;
}

export interface BodyFatMass {
  unit: 'kg' | 'lb';
  /** Exact values in `unit`. */
  fat: number;
  lean: number;
  /** One decimal, half up. */
  fatDisplay: string;
  leanDisplay: string;
}

export type BodyFatEvaluation =
  | { status: 'invalid'; errors: BodyFatFieldErrors }
  | { status: 'check'; kind: 'domain' | 'implausible'; message: string; fields: BodyFatFieldName[] }
  | {
      status: 'ok';
      sex: Sex;
      /** Exact, unrounded percentage. Fat and lean mass use this value. */
      percent: number;
      /** One decimal, half up. */
      percentDisplay: string;
      /** Present only when a valid weight was entered. */
      mass: BodyFatMass | null;
    };

/**
 * Evaluate the form. Order: parse -> convert to canonical cm/kg -> validate limits -> logarithm domain -> calculate -> plausibility.
 * Field errors are all reported first; the domain and plausibility checks run only when every required field is valid.
 */
export function evaluateBodyFat(raw: BodyFatInput): BodyFatEvaluation {
  const female = raw.sex === 'female';
  const height = parseHeightCm(raw.system, raw.heightMain, raw.heightInches);
  const neck = parseCircumferenceCm(raw.system, raw.neck, 'neck');
  const waist = parseCircumferenceCm(raw.system, raw.waist, 'waist');
  const hip = female ? parseCircumferenceCm(raw.system, raw.hip, 'hip') : null;
  const weight = parseOptionalWeightKg(raw.system, raw.weight);

  const errors: BodyFatFieldErrors = {};
  if (!height.ok) errors.height = height.message;
  if (!neck.ok) errors.neck = neck.message;
  if (!waist.ok) errors.waist = waist.message;
  if (hip && !hip.ok) errors.hip = hip.message;
  if (!weight.ok) errors.weight = weight.message;
  if (!height.ok || !neck.ok || !waist.ok || (hip && !hip.ok) || !weight.ok) return { status: 'invalid', errors };

  // From here every required value is a valid canonical number. The equations use inches: inches = cm / 2.54.
  const heightIn = cmToInches((height as { value: number }).value);
  const neckIn = cmToInches((neck as { value: number }).value);
  const waistIn = cmToInches((waist as { value: number }).value);
  const hipIn = hip && hip.ok ? cmToInches(hip.value) : 0;
  const weightKg = (weight as { value: number | null }).value;

  if (circumferenceValue(raw.sex, waistIn, neckIn, hipIn) <= 0) {
    return {
      status: 'check',
      kind: 'domain',
      message: female ? BODY_FAT_MESSAGES.domainFemale : BODY_FAT_MESSAGES.domainMale,
      fields: female ? ['neck', 'waist', 'hip'] : ['neck', 'waist'],
    };
  }

  const percent = bodyFatPercent(raw.sex, heightIn, neckIn, waistIn, hipIn);
  if (!Number.isFinite(percent) || percent <= 0 || percent > 100) {
    return {
      status: 'check',
      kind: 'implausible',
      message: BODY_FAT_MESSAGES.implausible,
      fields: female ? ['height', 'neck', 'waist', 'hip'] : ['height', 'neck', 'waist'],
    };
  }

  let mass: BodyFatMass | null = null;
  if (weightKg !== null) {
    const fatKg = (weightKg * percent) / 100;
    const leanKg = weightKg - fatKg;
    const imperial = raw.system === 'imperial';
    const fat = imperial ? kgToLb(fatKg) : fatKg;
    const lean = imperial ? kgToLb(leanKg) : leanKg;
    mass = { unit: imperial ? 'lb' : 'kg', fat, lean, fatDisplay: formatFixed(fat, 1), leanDisplay: formatFixed(lean, 1) };
  }

  return { status: 'ok', sex: raw.sex, percent, percentDisplay: formatFixed(percent, 1), mass };
}

/** Ring fill (0 to 100) for a percentage: the percentage itself on a full circle. No bands, no health meaning (owner decision D3). */
export function ringFill(percent: number): number {
  return Math.max(0, Math.min(100, percent));
}
