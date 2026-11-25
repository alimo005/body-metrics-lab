// Shared unit definitions, number parsing and rounding for the calculators.
// Rules: CALCULATION-SPEC.md sections 1.2 (conversions), 1.3 (input handling) and 1.4 (rounding).
// Pure functions only: no DOM, no storage, no network.

/** 1 inch = 2.54 cm exactly (international definition). */
export const CM_PER_IN = 2.54;
/** 1 pound = 0.45359237 kg exactly (international definition). */
export const KG_PER_LB = 0.45359237;

export type ParsedNumber =
  | { state: 'empty' }
  | { state: 'invalid' }
  | { state: 'ok'; value: number };

/**
 * Parse a number typed by a person. A comma is accepted as the decimal separator.
 * Anything that is not a plain decimal number (text, "NaN", "1e3", several separators) is invalid.
 */
export function parseNumber(text: string): ParsedNumber {
  const trimmed = text.trim();
  if (trimmed === '') return { state: 'empty' };
  const normalised = trimmed.replace(',', '.');
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalised)) return { state: 'invalid' };
  const value = Number(normalised);
  return Number.isFinite(value) ? { state: 'ok', value } : { state: 'invalid' };
}

/**
 * Round half up to `decimals` places. A tiny epsilon guards the binary floating-point cases
 * (for example 24.95 stored as 24.949999999999999) so that exact halves round up.
 */
export function roundHalfUp(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round((value + 1e-9) * factor) / factor;
}

/** Fixed-decimals text of the half-up rounded value. */
export function formatFixed(value: number, decimals: number): string {
  return roundHalfUp(value, decimals).toFixed(decimals);
}

export const inchesToCm = (inches: number): number => inches * CM_PER_IN;
export const cmToInches = (cm: number): number => cm / CM_PER_IN;
export const lbToKg = (pounds: number): number => pounds * KG_PER_LB;
export const kgToLb = (kg: number): number => kg / KG_PER_LB;
export const feetInchesToInches = (feet: number, inches: number): number => feet * 12 + inches;

/** Split total inches into whole feet and inches (one decimal), carrying 12 inches into a foot. */
export function inchesToFeetInches(totalInches: number): { feet: number; inches: number } {
  let feet = Math.floor(totalInches / 12);
  let inches = roundHalfUp(totalInches - feet * 12, 1);
  if (inches >= 12) {
    feet += 1;
    inches = 0;
  }
  return { feet, inches };
}
