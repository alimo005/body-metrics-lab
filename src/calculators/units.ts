// Shared number parsing, rounding and the one internal conversion (cm to inches, for the Navy equations).
// Rules: CALCULATION-SPEC.md sections 1.2 (conversions), 1.3 (input handling) and 1.4 (rounding).
// Pure functions only: no DOM, no storage, no network.

/** 1 inch = 2.54 cm exactly (international definition). */
export const CM_PER_IN = 2.54;

export type ParsedNumber =
  | { state: 'empty' }
  | { state: 'invalid' }
  | { state: 'ok'; value: number };

/**
 * Parse a number typed by a person (CALCULATION-SPEC.md 1.3): English digits 0-9 with the period as the only decimal separator.
 * Anything else is invalid: a comma decimal ("84,5"), Arabic-Indic digits, a plus sign, "NaN", "1e3", several separators,
 * spaces inside the number and unit text ("84 cm"). Surrounding spaces are ignored; a leading minus is read so a negative value
 * can be rejected by the field's own validation.
 */
export function parseNumber(text: string): ParsedNumber {
  const trimmed = text.trim();
  if (trimmed === '') return { state: 'empty' };
  if (!/^-?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)$/.test(trimmed)) return { state: 'invalid' };
  const value = Number(trimmed);
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

/** Used internally only: the Navy body-fat equations take inches (CALCULATION-SPEC.md 4.3). Not a user-facing unit. */
export const cmToInches = (cm: number): number => cm / CM_PER_IN;
