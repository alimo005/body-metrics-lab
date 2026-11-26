// BMR & TDEE calculator logic: CALCULATION-SPEC.md section 3.
//   REE (secondary result): Mifflin-St Jeor 1990 simplified sex-specific equations (3.3, S6).
//   TEE (primary result): National Academies 2023 equations, 4 activity categories x 2 sexes (3.4, S7).
// The two results are independent: TEE is NOT computed from REE, and no activity multipliers, PAL
// multiplication or TEE/REE ratio are used anywhere (3.1).
// Pure functions only: no DOM, no storage, no network.

import { parseHeightCm, parseWeightKg, parseWholeAge } from './inputs.ts';
import type { MeasurementSystem } from './inputs.ts';
import { roundHalfUp } from './units.ts';

export type Sex = 'male' | 'female';
export type ActivityCategory = 'inactive' | 'lowActive' | 'active' | 'veryActive';

/** Approved eligibility (3.3, owner policy): 19 to 78 years inclusive, for BOTH results. */
export const ELIGIBLE_AGE = { min: 19, max: 78 } as const;

/** Notice shown instead of both results for a valid age outside 19-78 (3.3). */
export const ELIGIBILITY_NOTICE = 'This equation was developed in adults aged 19–78; no estimate is shown.';

export const ACTIVITY_PLACEHOLDER = 'Choose an activity category';
export const ACTIVITY_REQUIRED_MESSAGE = 'Choose an activity category.';

export interface ActivityInfo {
  id: ActivityCategory;
  label: string;
  /** PAL range, adults 19 and over, men and women (3.5, S7 Table 5-4). */
  pal: string;
  /** Plain-language definition, paraphrased from the National Academies report (3.5). */
  description: string;
}

export const ACTIVITY_CATEGORIES: readonly ActivityInfo[] = [
  {
    id: 'inactive',
    label: 'Inactive',
    pal: 'PAL 1.00 to less than 1.53',
    description: 'Basal metabolism, the thermic effect of food and only the minimal activity needed for independent living.',
  },
  {
    id: 'lowActive',
    label: 'Low Active',
    pal: 'PAL 1.53 to less than 1.68',
    description: 'Activity beyond the minimum: more walking and some occupational and recreational activity.',
  },
  {
    id: 'active',
    label: 'Active',
    pal: 'PAL 1.68 to less than 1.85',
    description: 'Even more walking and occupational or recreational activity.',
  },
  {
    id: 'veryActive',
    label: 'Very Active',
    pal: 'PAL 1.85 to less than 2.50',
    description: 'Daily-living demands plus vigorous occupational or recreational exertion.',
  },
];

export interface TeeCoefficients {
  intercept: number;
  /** Per year of age (same for all four categories within a sex). */
  age: number;
  /** Per cm of height. */
  height: number;
  /** Per kg of body weight. */
  weight: number;
}

/**
 * National Academies 2023 TEE equations (S7 Summary Table S-1 = Chapter 5 Table 5-5 = Appendix G):
 *   TEE (kcal/day) = intercept - age_coefficient x age(y) + height_coefficient x height(cm) + weight_coefficient x weight(kg)
 * `age` below is the (positive) amount subtracted per year. Note the NEGATIVE constant for men, Very Active.
 */
export const TEE_COEFFICIENTS: Readonly<Record<Sex, Readonly<Record<ActivityCategory, TeeCoefficients>>>> = {
  male: {
    inactive: { intercept: 753.07, age: 10.83, height: 6.5, weight: 14.1 },
    lowActive: { intercept: 581.47, age: 10.83, height: 8.3, weight: 14.94 },
    active: { intercept: 1004.82, age: 10.83, height: 6.52, weight: 15.91 },
    veryActive: { intercept: -517.88, age: 10.83, height: 15.61, weight: 19.11 },
  },
  female: {
    inactive: { intercept: 584.9, age: 7.01, height: 5.72, weight: 11.71 },
    lowActive: { intercept: 575.77, age: 7.01, height: 6.6, weight: 12.14 },
    active: { intercept: 710.25, age: 7.01, height: 6.54, weight: 12.34 },
    veryActive: { intercept: 511.83, age: 7.01, height: 9.07, weight: 12.56 },
  },
};

/** Mifflin-St Jeor REE (kcal/day), simplified sex-specific form (3.3). Height in cm, weight in kg, age in years. */
export function calculateRee(sex: Sex, age: number, heightCm: number, weightKg: number): number {
  const sexTerm = sex === 'male' ? 5 : -161;
  return 10 * weightKg + 6.25 * heightCm - 5 * age + sexTerm;
}

/** National Academies TEE (kcal/day). The age argument may be a decimal here (published examples TE2, TE3); the page only passes whole ages. */
export function calculateTee(sex: Sex, category: ActivityCategory, age: number, heightCm: number, weightKg: number): number {
  const c = TEE_COEFFICIENTS[sex][category];
  return c.intercept - c.age * age + c.height * heightCm + c.weight * weightKg;
}

/** Whole kcal/day, half up (3.6). */
export function roundKcal(value: number): number {
  return roundHalfUp(value, 0);
}

/** Whole number with a thousands separator, for display. */
export function formatKcal(value: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(roundKcal(value));
}

export interface EnergyInput {
  system: MeasurementSystem;
  sex: Sex;
  age: string;
  /** Height in cm (metric) or feet (imperial). */
  heightMain: string;
  /** Inches (imperial only; empty means 0). */
  heightInches: string;
  /** Weight in kg (metric) or lb (imperial). */
  weight: string;
  /** Activity category id, or an empty string when the placeholder is still selected. */
  activity: string;
}

export type EnergyFieldName = 'age' | 'height' | 'weight' | 'activity';
export type EnergyFieldErrors = Partial<Record<EnergyFieldName, string>>;

export type EnergyEvaluation =
  | { status: 'invalid'; errors: EnergyFieldErrors }
  | { status: 'ineligible'; age: number }
  | {
      status: 'ok';
      sex: Sex;
      category: ActivityInfo;
      /** Exact values (never rounded before display). */
      tee: number;
      ree: number;
      /** Whole kcal/day text for display, half up, with a thousands separator. */
      teeDisplay: string;
      reeDisplay: string;
    };

export function findActivity(id: string): ActivityInfo | undefined {
  return ACTIVITY_CATEGORIES.find((a) => a.id === id);
}

/**
 * Evaluate the form. Validation priority (DESIGN-SPEC.md 10.3, CALCULATION-SPEC.md 3.3):
 *   1. invalid age (empty, text, decimal, below 1, above 120) -> age error, no result;
 *   2. valid whole age outside 19-78 -> eligibility notice, no results, takes priority over other field errors;
 *   3. age 19-78 -> validate height, weight and activity category (inline errors, no result);
 *   4. otherwise both results.
 */
export function evaluateEnergy(raw: EnergyInput): EnergyEvaluation {
  const age = parseWholeAge(raw.age);
  const height = parseHeightCm(raw.system, raw.heightMain, raw.heightInches);
  const weight = parseWeightKg(raw.system, raw.weight);
  const category = findActivity(raw.activity);

  if (!age.ok) {
    const errors: EnergyFieldErrors = { age: age.message };
    if (!height.ok) errors.height = height.message;
    if (!weight.ok) errors.weight = weight.message;
    return { status: 'invalid', errors };
  }
  if (age.value < ELIGIBLE_AGE.min || age.value > ELIGIBLE_AGE.max) return { status: 'ineligible', age: age.value };

  const errors: EnergyFieldErrors = {};
  if (!height.ok) errors.height = height.message;
  if (!weight.ok) errors.weight = weight.message;
  if (!category) errors.activity = ACTIVITY_REQUIRED_MESSAGE;
  if (!height.ok || !weight.ok || !category) return { status: 'invalid', errors };

  const ree = calculateRee(raw.sex, age.value, height.value, weight.value);
  const tee = calculateTee(raw.sex, category.id, age.value, height.value, weight.value);
  return { status: 'ok', sex: raw.sex, category, ree, tee, reeDisplay: formatKcal(ree), teeDisplay: formatKcal(tee) };
}
