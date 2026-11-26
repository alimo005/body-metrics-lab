// Wires the Body Fat page to the pure logic in src/calculators/body-fat.ts. Nothing is stored or sent anywhere.
// Metric-only (CALCULATION-SPEC.md 1.3). A field's error clears as soon as that field is edited, and a shown result is hidden
// as soon as any input changes, so an outdated result or a stale error can never stay on screen (CALCULATION-SPEC.md 4.5).
import { evaluateBodyFat, ringFill } from '../calculators/body-fat.ts';
import { EMPTY_VIEW, viewAfterEdit, viewFromEvaluation } from '../calculators/body-fat-view.ts';
import type { BodyFatView } from '../calculators/body-fat-view.ts';
import type { BodyFatFieldName, BodyFatInput, Sex } from '../calculators/body-fat.ts';
import { announce, el } from './calc-form.ts';

const form = el<HTMLFormElement>('bodyfat-form');
const height = el<HTMLInputElement>('height');
const neck = el<HTMLInputElement>('neck');
const waist = el<HTMLInputElement>('waist');
const hip = el<HTMLInputElement>('hip');
const weight = el<HTMLInputElement>('weight');
const hipField = el('hip-field');
const groupError = el('bf-group-error');
const ANNOUNCE = 'bf-announce';
const GROUP_ERROR_ID = 'bf-group-error';

const states = { empty: el('result-empty'), result: el('result-ok') };

const inputsByField: Record<BodyFatFieldName, HTMLInputElement[]> = {
  height: [height],
  neck: [neck],
  waist: [waist],
  hip: [hip],
  weight: [weight],
};
const errorBoxes: Record<BodyFatFieldName, HTMLElement[]> = {
  height: [el('height-error')],
  neck: [el('neck-error')],
  waist: [el('waist-error')],
  hip: [el('hip-error')],
  weight: [el('weight-error')],
};

const WAIST_TEXT = {
  male: { label: 'Waist (abdomen at the navel)', hint: 'Across the navel, arms down at your sides, at the end of a normal relaxed breath out.' },
  female: {
    label: 'Natural waist',
    hint: 'At the narrowest part of the abdomen, usually about halfway between the navel and the lower end of the breastbone.',
  },
} as const;

function checked(name: string): string {
  const input = form.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`);
  return input ? input.value : '';
}
const currentSex = (): Sex => (checked('sex') === 'female' ? 'female' : 'male');

function readInput(): BodyFatInput {
  return {
    sex: currentSex(),
    height: height.value,
    neck: neck.value,
    waist: waist.value,
    hip: hip.value,
    weight: weight.value,
  };
}

function showState(name: keyof typeof states): void {
  for (const [key, node] of Object.entries(states)) node.hidden = key !== name;
}

function addDescribedBy(input: HTMLElement, id: string): void {
  const ids = (input.getAttribute('aria-describedby') ?? '').split(' ').filter(Boolean);
  if (!ids.includes(id)) input.setAttribute('aria-describedby', [...ids, id].join(' '));
}
function removeDescribedBy(input: HTMLElement, id: string): void {
  const ids = (input.getAttribute('aria-describedby') ?? '').split(' ').filter((x) => x && x !== id);
  input.setAttribute('aria-describedby', ids.join(' '));
}

function clearErrors(): void {
  for (const inputs of Object.values(inputsByField)) {
    for (const input of inputs) {
      input.removeAttribute('aria-invalid');
      removeDescribedBy(input, GROUP_ERROR_ID);
    }
  }
  for (const boxes of Object.values(errorBoxes)) {
    for (const box of boxes) {
      box.hidden = true;
      box.textContent = '';
    }
  }
  groupError.hidden = true;
  groupError.textContent = '';
}

const visible = (input: HTMLElement): boolean => input.offsetParent !== null;

function showFieldErrors(errors: Partial<Record<BodyFatFieldName, string>>): HTMLElement | null {
  let first: HTMLElement | null = null;
  const order: BodyFatFieldName[] = ['height', 'neck', 'waist', 'hip', 'weight'];
  for (const field of order) {
    const message = errors[field];
    if (!message) continue;
    const shown = inputsByField[field].filter(visible);
    for (const input of shown) input.setAttribute('aria-invalid', 'true');
    const box = errorBoxes[field][0];
    box.textContent = message;
    box.hidden = false;
    if (!first) first = shown[0] ?? null;
  }
  return first;
}

/** Domain and plausibility errors: one alert under the measurements, referenced by every involved field. */
function showGroupError(message: string, fields: BodyFatFieldName[]): HTMLElement | null {
  groupError.textContent = message;
  groupError.hidden = false;
  let first: HTMLElement | null = null;
  for (const field of fields) {
    for (const input of inputsByField[field].filter(visible)) {
      input.setAttribute('aria-invalid', 'true');
      addDescribedBy(input, GROUP_ERROR_ID);
      if (!first) first = input;
    }
  }
  return first;
}

const KILOGRAMS = 'kilograms';

/** Draw a view: field errors, the group alert, and whether a result is shown. Returns the first marked field (for focus). */
let view: BodyFatView = EMPTY_VIEW;
function render(next: BodyFatView): HTMLElement | null {
  view = next;
  clearErrors();
  const firstField = showFieldErrors(view.fieldErrors);
  const firstGroup = view.group ? showGroupError(view.group.message, view.group.fields) : null;
  showState(view.resultVisible ? 'result' : 'empty');
  if (!view.resultVisible) el('bf-ring').querySelector('.ring-fill')?.setAttribute('stroke-dashoffset', '100');
  return firstField ?? firstGroup;
}

function calculate(): void {
  const result = evaluateBodyFat(readInput());
  const first = render(viewFromEvaluation(result));

  if (result.status === 'invalid') {
    announce(ANNOUNCE, 'No result. Please correct the highlighted fields.');
    first?.focus();
    return;
  }
  if (result.status === 'check') {
    announce(ANNOUNCE, `No result. ${result.message}`);
    first?.focus();
    return;
  }

  el('bf-value').textContent = result.percentDisplay;
  const ring = el('bf-ring');
  ring.setAttribute('aria-label', `Estimated body fat: ${result.percentDisplay} percent.`);
  ring.querySelector('.ring-fill')?.setAttribute('stroke-dashoffset', String(100 - ringFill(result.percent)));

  const tiles = el('mass-tiles');
  tiles.hidden = result.mass === null;
  let massAnnouncement = '';
  if (result.mass) {
    el('fat-value').textContent = result.mass.fatDisplay;
    el('lean-value').textContent = result.mass.leanDisplay;
        massAnnouncement = ` Estimated fat mass: ${result.mass.fatDisplay} ${KILOGRAMS}. Estimated lean mass, all mass that is not fat: ${result.mass.leanDisplay} ${KILOGRAMS}.`;
  }
  announce(ANNOUNCE, `Estimated body fat: ${result.percentDisplay} percent.${massAnnouncement} These are estimates.`);
}

const clearAll = (): void => void render(EMPTY_VIEW);

/** The hip field is shown only for women; the waist label and help text follow the sex (CALCULATION-SPEC.md 4.4). */
function applySex(): void {
  const sex = currentSex();
  hipField.hidden = sex !== 'female';
  const text = WAIST_TEXT[sex];
  const label = form.querySelector<HTMLLabelElement>('label[for="waist"]');
  if (label) label.textContent = text.label;
  const hint = document.getElementById('waist-hint');
  if (hint) hint.textContent = text.hint;
}

// Editing any field removes that field's own error and hides an old result: a result is only ever shown for the values on screen.
for (const field of Object.keys(inputsByField) as BodyFatFieldName[]) {
  for (const input of inputsByField[field]) {
    input.addEventListener('input', () => void render(viewAfterEdit(view, field)));
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  calculate();
});

for (const radio of form.querySelectorAll<HTMLInputElement>('input[name="sex"]')) {
  radio.addEventListener('change', () => {
    if (!radio.checked) return;
    applySex();
    clearAll();
    announce(ANNOUNCE, `Sex changed to ${radio.value}. Press Calculate to see your result.`);
  });
}

form.addEventListener('reset', (event) => {
  event.preventDefault();
  form.reset();
  for (const input of [height, neck, waist, hip, weight]) input.value = '';
  const maleRadio = form.querySelector<HTMLInputElement>('input[name="sex"][value="male"]');
  if (maleRadio) maleRadio.checked = true;
  applySex();
  clearAll();
  announce(ANNOUNCE, 'Form reset. Results and errors cleared.');
  height.focus();
});

applySex();
clearAll();
document.documentElement.classList.add('bodyfat-ready');
