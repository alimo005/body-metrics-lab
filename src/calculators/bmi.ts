// Adult BMI calculator logic: CALCULATION-SPEC.md section 2.
// Formula (S3 CDC FAQ, S1 CDC, S5 WHO): metric BMI = kg / m^2; imperial BMI = lb / in^2 x 703.
// Categories (S1 CDC) are applied to the EXACT, unrounded BMI. Only the displayed value is rounded.
// Sex is accepted so the interface can keep its control, but it never affects any result.
// Pure functions only: no DOM, no storage, no network.

import {
  cmToInches,
  feetInchesToInches,
  formatFixed,
  inchesToCm,
  kgToLb,
  lbToKg,
  parseNumber,
  roundHalfUp,
} from './units.ts';

export type System = 'metric' | 'imperial';
export type Sex = 'male' | 'female';

/** Technical input limits (CALCULATION-SPEC.md 1.3): they catch typos and unit mix-ups, they are not medical limits. */
export const LIMITS = {
  heightCm: { min: 100, max: 250 },
  weightKg: { min: 20, max: 500 },
  ageYears: { min: 1, max: 120 },
} as const;

/** BMI category thresholds (kg/m^2). The adult result is only given from age 20 (CDC, owner decision). */
export const ADULT_MIN_AGE = 20;

export type CategoryId = 'underweight' | 'healthy' | 'overweight' | 'obesity1' | 'obesity2' | 'obesity3';
export type CategoryGroup = 'underweight' | 'healthy' | 'overweight' | 'obesity';

export interface Category {
  id: CategoryId;
  /** CDC category name. */
  label: string;
  group: CategoryGroup;
  /** Range as printed in CDC's adult BMI calculator table (one decimal). */
  range: string;
}

export const CATEGORIES: Readonly<Record<CategoryId, Category>> = {
  underweight: { id: 'underweight', label: 'Underweight', group: 'underweight', range: 'Below 18.5' },
  healthy: { id: 'healthy', label: 'Healthy Weight', group: 'healthy', range: '18.5 to 24.9' },
  overweight: { id: 'overweight', label: 'Overweight', group: 'overweight', range: '25.0 to 29.9' },
  obesity1: { id: 'obesity1', label: 'Class 1 Obesity', group: 'obesity', range: '30.0 to 34.9' },
  obesity2: { id: 'obesity2', label: 'Class 2 Obesity', group: 'obesity', range: '35.0 to 39.9' },
  obesity3: { id: 'obesity3', label: 'Class 3 Obesity', group: 'obesity', range: '40.0 or greater' },
};

/** Exact BMI from a height and weight in the units of the chosen system (cm and kg, or inches and lb). */
export function calculateBmi(system: System, height: number, weight: number): number {
  if (system === 'metric') {
    // kg / m^2 written as kg x 10,000 / cm^2 so exact thresholds (for example 64 kg at 160 cm = 25) stay exact in floating point.
    return (weight * 10000) / (height * height);
  }
  return (weight / (height * height)) * 703;
}

/** Category of an EXACT BMI (thresholds 18.5, 25, 30, 35, 40; lower bound inclusive). */
export function categorize(exactBmi: number): Category {
  if (exactBmi < 18.5) return CATEGORIES.underweight;
  if (exactBmi < 25) return CATEGORIES.healthy;
  if (exactBmi < 30) return CATEGORIES.overweight;
  if (exactBmi < 35) return CATEGORIES.obesity1;
  if (exactBmi < 40) return CATEGORIES.obesity2;
  return CATEGORIES.obesity3;
}

export interface HealthyRange {
  min: number;
  max: number;
  unit: 'kg' | 'lb';
}

/**
 * Weights whose exact BMI is at least 18.5 and below 25 for the height (CALCULATION-SPEC.md 2.8).
 * Metric: 0.1 kg steps, imperial: whole pounds, both rounded inwards so every shown value is inside the category.
 */
export function healthyWeightRange(system: System, height: number): HealthyRange {
  const eps = 1e-9;
  if (system === 'metric') {
    const lower = Math.ceil((18.5 * height * height) / 1000 - eps) / 10;
    const upper = Math.ceil((25 * height * height) / 1000 - eps) / 10 - 0.1;
    return { min: roundHalfUp(lower, 1), max: roundHalfUp(upper, 1), unit: 'kg' };
  }
  const lower = Math.ceil((18.5 * height * height) / 703 - eps);
  const upper = Math.ceil((25 * height * height) / 703 - eps) - 1;
  return { min: lower, max: upper, unit: 'lb' };
}

export interface RawInput {
  system: System;
  /** Sex is never used in any calculation. */
  sex: Sex;
  age: string;
  /** Height in cm (metric) or feet (imperial). */
  heightMain: string;
  /** Inches (imperial only; empty means 0). */
  heightInches: string;
  /** Weight in kg (metric) or lb (imperial). */
  weight: string;
}

export type FieldName = 'age' | 'height' | 'weight';
export type FieldErrors = Partial<Record<FieldName, string>>;

const THREE_DECIMALS = 3;

/** Messages state the technical limits only; they never present them as health thresholds. */
export const MESSAGES = {
  ageEmpty: 'Enter your age in years.',
  ageInvalid: `Enter a whole number of years between ${LIMITS.ageYears.min} and ${LIMITS.ageYears.max}.`,
  heightEmpty: 'Enter your height.',
  heightInvalid: 'Enter your height as a number, for example 175.',
  weightEmpty: 'Enter your weight.',
  weightInvalid: 'Enter your weight as a number, for example 70.',
  heightRangeMetric: `Enter a height between ${LIMITS.heightCm.min} and ${LIMITS.heightCm.max} cm.`,
  heightRangeImperial: `Enter a height between ${formatFixed(cmToInches(LIMITS.heightCm.min), 1)} and ${formatFixed(cmToInches(LIMITS.heightCm.max), 1)} inches in total.`,
  weightRangeMetric: `Enter a weight between ${LIMITS.weightKg.min} and ${LIMITS.weightKg.max} kg.`,
  weightRangeImperial: `Enter a weight between ${formatFixed(kgToLb(LIMITS.weightKg.min), 1)} and ${formatFixed(kgToLb(LIMITS.weightKg.max), 1)} lb.`,
} as const;

interface ParsedInputs {
  errors: FieldErrors;
  age?: number;
  /** Height in cm or total inches, matching the system. */
  height?: number;
  /** Weight in kg or lb, matching the system. */
  weight?: number;
  heightCm?: number;
  weightKg?: number;
}

/** Parse, convert to canonical units, then validate (CALCULATION-SPEC.md 1.3 order of operations). */
export function parseInputs(raw: RawInput): ParsedInputs {
  const errors: FieldErrors = {};
  const out: ParsedInputs = { errors };

  const age = parseNumber(raw.age);
  if (age.state === 'empty') errors.age = MESSAGES.ageEmpty;
  else if (age.state === 'invalid' || !Number.isInteger(age.value) || age.value < LIMITS.ageYears.min || age.value > LIMITS.ageYears.max) {
    errors.age = MESSAGES.ageInvalid;
  } else out.age = age.value;

  const imperial = raw.system === 'imperial';
  const main = parseNumber(raw.heightMain);
  const inches = imperial ? parseNumber(raw.heightInches) : ({ state: 'ok', value: 0 } as const);
  if (main.state === 'empty') errors.height = MESSAGES.heightEmpty;
  else if (main.state === 'invalid' || inches.state === 'invalid' || (main.state === 'ok' && main.value < 0) || (inches.state === 'ok' && inches.value < 0)) {
    errors.height = MESSAGES.heightInvalid;
  } else if (main.state === 'ok') {
    const extra = inches.state === 'ok' ? inches.value : 0;
    const height = imperial ? feetInchesToInches(main.value, extra) : main.value;
    const heightCm = imperial ? inchesToCm(height) : height;
    if (heightCm < LIMITS.heightCm.min || heightCm > LIMITS.heightCm.max) {
      errors.height = imperial ? MESSAGES.heightRangeImperial : MESSAGES.heightRangeMetric;
    } else {
      out.height = height;
      out.heightCm = heightCm;
    }
  }

  const weight = parseNumber(raw.weight);
  if (weight.state === 'empty') errors.weight = MESSAGES.weightEmpty;
  else if (weight.state === 'invalid' || weight.value < 0) errors.weight = MESSAGES.weightInvalid;
  else {
    const weightKg = imperial ? lbToKg(weight.value) : weight.value;
    if (weightKg < LIMITS.weightKg.min || weightKg > LIMITS.weightKg.max) {
      errors.weight = imperial ? MESSAGES.weightRangeImperial : MESSAGES.weightRangeMetric;
    } else {
      out.weight = weight.value;
      out.weightKg = weightKg;
    }
  }
  return out;
}

export type BmiEvaluation =
  | { status: 'invalid'; errors: FieldErrors }
  | { status: 'under20'; age: number }
  | {
      status: 'ok';
      system: System;
      /** Exact, unrounded BMI: the category is decided from this value. */
      exact: number;
      /** BMI rounded half up to one decimal, for display only. */
      display: string;
      category: Category;
      /** Shown when rounding for display would cross a category boundary (CALCULATION-SPEC.md 2.6). */
      boundaryNote: string | null;
      range: HealthyRange;
      rangeText: string;
    };

/**
 * Evaluate the form. Order: parse -> convert to canonical units -> validate -> eligibility -> calculate.
 * Under age 20 no adult BMI value or category is returned (CALCULATION-SPEC.md 2.4).
 */
export function evaluateBmi(raw: RawInput): BmiEvaluation {
  const parsed = parseInputs(raw);
  if (parsed.age !== undefined && parsed.age < ADULT_MIN_AGE) return { status: 'under20', age: parsed.age };
  if (parsed.errors.age || parsed.errors.height || parsed.errors.weight) return { status: 'invalid', errors: parsed.errors };

  const height = parsed.height as number;
  const weight = parsed.weight as number;
  const exact = calculateBmi(raw.system, height, weight);
  const category = categorize(exact);
  const display = formatFixed(exact, 1);
  const displayCategory = categorize(roundHalfUp(exact, 1));
  const boundaryNote =
    displayCategory.id !== category.id
      ? `BMI is shown rounded to one decimal. Your category is determined from the exact, unrounded BMI (${exact.toFixed(THREE_DECIMALS)}).`
      : null;
  const range = healthyWeightRange(raw.system, height);
  const rangeText = range.unit === 'kg' ? `${range.min.toFixed(1)} to ${range.max.toFixed(1)} kg` : `${range.min} to ${range.max} lb`;
  return { status: 'ok', system: raw.system, exact, display, category, boundaryNote, range, rangeText };
}

/** Marker position (0 to 100) on the 15 to 40 spectrum used by the reference bar. */
export function spectrumPosition(exactBmi: number): number {
  const min = 15;
  const max = 40;
  return Math.max(0, Math.min(100, ((exactBmi - min) / (max - min)) * 100));
}
