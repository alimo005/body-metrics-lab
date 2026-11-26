// What the Body Fat form shows (errors and result) as plain data, so the rules for keeping it up to date are unit-tested
// (CALCULATION-SPEC.md 4.5, "live correction"). The page script only renders this state; it holds no rules of its own.
// Pure functions only: no DOM, no storage, no network.

import type { BodyFatEvaluation, BodyFatFieldName } from './body-fat.ts';

export interface BodyFatView {
  /** One message per field; each disappears as soon as THAT field is edited. */
  fieldErrors: Partial<Record<BodyFatFieldName, string>>;
  /** The domain or plausibility alert and the fields it refers to. */
  group: { message: string; fields: BodyFatFieldName[] } | null;
  /** True only while the result on screen belongs to the values on screen. */
  resultVisible: boolean;
}

/** Nothing shown: the state at start, after Reset and after any change that makes a result or error outdated. */
export const EMPTY_VIEW: BodyFatView = { fieldErrors: {}, group: null, resultVisible: false };

/** The view after Calculate (or after the sex changes, which uses EMPTY_VIEW instead). */
export function viewFromEvaluation(evaluation: BodyFatEvaluation): BodyFatView {
  if (evaluation.status === 'invalid') return { fieldErrors: { ...evaluation.errors }, group: null, resultVisible: false };
  if (evaluation.status === 'check') return { fieldErrors: {}, group: { message: evaluation.message, fields: [...evaluation.fields] }, resultVisible: false };
  return { fieldErrors: {}, group: null, resultVisible: true };
}

/**
 * The view after one field is edited:
 *  - that field's own error is removed (the other fields' errors stay until they are edited too);
 *  - the group alert is removed (it depends on the measurements, which just changed);
 *  - a shown result is hidden, because it was calculated from values that no longer match the screen.
 */
export function viewAfterEdit(view: BodyFatView, field: BodyFatFieldName): BodyFatView {
  const fieldErrors = { ...view.fieldErrors };
  delete fieldErrors[field];
  return { fieldErrors, group: null, resultVisible: false };
}
