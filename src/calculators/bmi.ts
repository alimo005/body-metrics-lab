// Adult BMI calculator logic: CALCULATION-SPEC.md section 2.
// Formula (S3 CDC FAQ, S1 CDC, S5 WHO): BMI = kg / m^2. Version 1 is metric-only (CALCULATION-SPEC.md 1.3): height in cm, weight in kg.
// Categories (S1 CDC) are applied to the EXACT, unrounded BMI. Only the displayed value is rounded.
// Sex is accepted so the interface can keep its control, but it never affects any result.
// Pure functions only: no DOM, no storage, no network.

import { INPUT_LIMITS, INPUT_MESSAGES } from './inputs.ts';
import { formatFixed, parseNumber, roundHalfUp } from './units.ts';

export type Sex = 'male' | 'female';

/** Technical input limits (CALCULATION-SPEC.md 1.3): they catch typos and unit mix-ups, they are not medical limits. */
export const LIMITS = INPUT_LIMITS;

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

/** Exact BMI from a height in cm and a weight in kg. */
export function calculateBmi(heightCm: number, weightKg: number): number {
  // kg / m^2 written as kg x 10,000 / cm^2 so exact thresholds (for example 64 kg at 160 cm = 25) stay exact in floating point.
  return (weightKg * 10000) / (heightCm * heightCm);
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
  unit: 'kg';
}

/**
 * Weights whose exact BMI is at least 18.5 and below 25 for the height in cm (CALCULATION-SPEC.md 2.8):
 * 0.1 kg steps, rounded inwards so every shown value is inside the category.
 */
export function healthyWeightRange(heightCm: number): HealthyRange {
  const eps = 1e-9;
  const lower = Math.ceil((18.5 * heightCm * heightCm) / 1000 - eps) / 10;
  const upper = Math.ceil((25 * heightCm * heightCm) / 1000 - eps) / 10 - 0.1;
  return { min: roundHalfUp(lower, 1), max: roundHalfUp(upper, 1), unit: 'kg' };
}

export interface RawInput {
  /** Sex is never used in any calculation. */
  sex: Sex;
  age: string;
  /** Height in cm. */
  height: string;
  /** Weight in kg. */
  weight: string;
}

export type FieldName = 'age' | 'height' | 'weight';
export type FieldErrors = Partial<Record<FieldName, string>>;

const THREE_DECIMALS = 3;

/** Messages state the expected input and the technical limits only; they never present them as health thresholds. */
export const MESSAGES = INPUT_MESSAGES;

interface ParsedInputs {
  errors: FieldErrors;
  age?: number;
  /** Height in cm. */
  heightCm?: number;
  /** Weight in kg. */
  weightKg?: number;
}

/** Parse, then validate against the metric limits (CALCULATION-SPEC.md 1.3 order of operations). */
export function parseInputs(raw: RawInput): ParsedInputs {
  const errors: FieldErrors = {};
  const out: ParsedInputs = { errors };

  const age = parseNumber(raw.age);
  if (age.state === 'empty') errors.age = MESSAGES.ageEmpty;
  else if (age.state === 'invalid' || !Number.isInteger(age.value) || age.value < LIMITS.ageYears.min || age.value > LIMITS.ageYears.max) {
    errors.age = MESSAGES.ageInvalid;
  } else out.age = age.value;

  const height = parseNumber(raw.height);
  if (height.state === 'empty') errors.height = MESSAGES.heightEmpty;
  else if (height.state === 'invalid' || height.value < 0) errors.height = MESSAGES.heightInvalid;
  else if (height.value < LIMITS.heightCm.min || height.value > LIMITS.heightCm.max) errors.height = MESSAGES.heightRange;
  else out.heightCm = height.value;

  const weight = parseNumber(raw.weight);
  if (weight.state === 'empty') errors.weight = MESSAGES.weightEmpty;
  else if (weight.state === 'invalid' || weight.value < 0) errors.weight = MESSAGES.weightInvalid;
  else if (weight.value < LIMITS.weightKg.min || weight.value > LIMITS.weightKg.max) errors.weight = MESSAGES.weightRange;
  else out.weightKg = weight.value;
  return out;
}

export type BmiEvaluation =
  | { status: 'invalid'; errors: FieldErrors }
  | { status: 'under20'; age: number }
  | {
      status: 'ok';
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

  const exact = calculateBmi(parsed.heightCm as number, parsed.weightKg as number);
  const category = categorize(exact);
  const display = formatFixed(exact, 1);
  const displayCategory = categorize(roundHalfUp(exact, 1));
  const boundaryNote =
    displayCategory.id !== category.id
      ? `BMI is shown rounded to one decimal. Your category is determined from the exact, unrounded BMI (${exact.toFixed(THREE_DECIMALS)}).`
      : null;
  const range = healthyWeightRange(parsed.heightCm as number);
  const rangeText = `${range.min.toFixed(1)} to ${range.max.toFixed(1)} kg`;
  return { status: 'ok', exact, display, category, boundaryNote, range, rangeText };
}

/** Marker position (0 to 100) on the 15 to 40 spectrum used by the reference bar. */
export function spectrumPosition(exactBmi: number): number {
  const min = 15;
  const max = 40;
  return Math.max(0, Math.min(100, ((exactBmi - min) / (max - min)) * 100));
}
