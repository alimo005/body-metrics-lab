// Live correction of the Body Fat form (CALCULATION-SPEC.md 4.5, owner decision 2026-11-26): a field's error clears when that field
// is edited, and an old result can never stay on screen after an input changes. These are the reproduction tests for the
// "error keeps showing even when the values look valid" report (found in the diagnostic: stale errors and stale results).
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateBodyFat } from './body-fat.ts';
import type { BodyFatInput } from './body-fat.ts';
import { EMPTY_VIEW, viewAfterEdit, viewFromEvaluation } from './body-fat-view.ts';

const input = (patch: Partial<BodyFatInput> = {}): BodyFatInput => ({ sex: 'male', height: '178', neck: '38', waist: '84', hip: '', weight: '', ...patch });
const view = (patch: Partial<BodyFatInput> = {}) => viewFromEvaluation(evaluateBodyFat(input(patch)));

describe('what Calculate shows', () => {
  it('a valid set shows the result and no errors', () => {
    assert.deepEqual(view(), { fieldErrors: {}, group: null, resultVisible: true });
  });
  it('field errors are all shown together, and no result', () => {
    const v = view({ height: '', waist: '84 cm' });
    assert.deepEqual(Object.keys(v.fieldErrors).sort(), ['height', 'waist']);
    assert.equal(v.resultVisible, false);
    assert.equal(v.group, null);
  });
  it('a domain problem shows the group alert for the involved fields, and no result', () => {
    const v = view({ waist: '38' });
    assert.equal(v.resultVisible, false);
    assert.deepEqual(v.group?.fields, ['neck', 'waist']);
    assert.match(v.group?.message ?? '', /waist measurement must be larger than the neck/);
  });
  it('the empty view shows nothing', () => {
    assert.deepEqual(EMPTY_VIEW, { fieldErrors: {}, group: null, resultVisible: false });
  });
});

describe('editing a field with an error clears that error (and only that one)', () => {
  it('the waist error disappears the moment the waist is edited, so a corrected value shows no stale error', () => {
    const wrong = view({ waist: '84 cm' });
    assert.ok(wrong.fieldErrors.waist);
    assert.equal(viewAfterEdit(wrong, 'waist').fieldErrors.waist, undefined);
  });
  it('other fields keep their errors until they are edited too', () => {
    const wrong = view({ height: '', waist: '84 cm' });
    const afterWaist = viewAfterEdit(wrong, 'waist');
    assert.deepEqual(Object.keys(afterWaist.fieldErrors), ['height']);
    assert.deepEqual(viewAfterEdit(afterWaist, 'height').fieldErrors, {});
  });
  it('editing any measurement removes the group alert, which depended on the old measurements', () => {
    const wrong = view({ waist: '38' });
    assert.ok(wrong.group);
    for (const field of ['neck', 'waist', 'height'] as const) assert.equal(viewAfterEdit(wrong, field).group, null, field);
  });
  it('the hip error of a woman clears when the hip is edited', () => {
    const wrong = view({ sex: 'female', hip: '' });
    assert.ok(wrong.fieldErrors.hip);
    assert.equal(viewAfterEdit(wrong, 'hip').fieldErrors.hip, undefined);
  });
});

describe('a previous result can never stay visible after an input changes', () => {
  it('editing any field hides the result', () => {
    const shown = view({ weight: '76' });
    assert.equal(shown.resultVisible, true);
    for (const field of ['height', 'neck', 'waist', 'hip', 'weight'] as const) {
      assert.equal(viewAfterEdit(shown, field).resultVisible, false, field);
    }
  });
  it('after the edit nothing is shown until Calculate is pressed again', () => {
    const shown = view();
    assert.deepEqual(viewAfterEdit(shown, 'waist'), EMPTY_VIEW);
  });
  it('error, fix, calculate again: the second Calculate shows the new result with no leftover error', () => {
    let v = view({ waist: '84 cm' });
    assert.ok(v.fieldErrors.waist);
    v = viewAfterEdit(v, 'waist'); // the user types 84
    assert.deepEqual(v, EMPTY_VIEW);
    v = view({ waist: '84' }); // presses Calculate
    assert.deepEqual(v, { fieldErrors: {}, group: null, resultVisible: true });
  });
  it('a result then an invalid edit then Calculate shows only the error', () => {
    let v = view();
    v = viewAfterEdit(v, 'neck');
    v = view({ neck: 'abc' });
    assert.equal(v.resultVisible, false);
    assert.ok(v.fieldErrors.neck);
  });
});
