// Wires the Body Fat page to the pure logic in src/calculators/body-fat.ts. Nothing is stored or sent anywhere.
import { evaluateBodyFat, ringFill } from '../calculators/body-fat.ts';
import type { BodyFatFieldName, BodyFatInput, Sex } from '../calculators/body-fat.ts';
import type { MeasurementSystem } from '../calculators/inputs.ts';
import { cmToInches, feetInchesToInches, inchesToCm, inchesToFeetInches, kgToLb, lbToKg, parseNumber, roundHalfUp } from '../calculators/units.ts';
import { announce, el } from './calc-form.ts';

const form = el<HTMLFormElement>('bodyfat-form');
const heightCm = el<HTMLInputElement>('height-cm');
const heightFt = el<HTMLInputElement>('height-ft');
const heightIn = el<HTMLInputElement>('height-in');
const neck = el<HTMLInputElement>('neck');
const waist = el<HTMLInputElement>('waist');
const hip = el<HTMLInputElement>('hip');
const weight = el<HTMLInputElement>('weight');
const metricHeight = el('height-metric');
const imperialHeight = el('height-imperial');
const hipField = el('hip-field');
const groupError = el('bf-group-error');
const ANNOUNCE = 'bf-announce';
const GROUP_ERROR_ID = 'bf-group-error';

const states = { empty: el('result-empty'), result: el('result-ok') };

const inputsByField: Record<BodyFatFieldName, HTMLInputElement[]> = {
  height: [heightCm, heightFt, heightIn],
  neck: [neck],
  waist: [waist],
  hip: [hip],
  weight: [weight],
};
const errorBoxes: Record<BodyFatFieldName, HTMLElement[]> = {
  height: [el('height-cm-error'), el('height-ft-error')],
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

let system: MeasurementSystem = 'metric';

function checked(name: string): string {
  const input = form.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`);
  return input ? input.value : '';
}
const currentSex = (): Sex => (checked('sex') === 'female' ? 'female' : 'male');

function readInput(): BodyFatInput {
  const imperial = system === 'imperial';
  return {
    system,
    sex: currentSex(),
    heightMain: imperial ? heightFt.value : heightCm.value,
    heightInches: imperial ? heightIn.value : '',
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
    const box = field === 'height' ? (system === 'imperial' ? errorBoxes.height[1] : errorBoxes.height[0]) : errorBoxes[field][0];
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

function unitWord(unit: 'kg' | 'lb'): string {
  return unit === 'kg' ? 'kilograms' : 'pounds';
}

function calculate(): void {
  clearErrors();
  const result = evaluateBodyFat(readInput());

  if (result.status === 'invalid') {
    showState('empty');
    const first = showFieldErrors(result.errors);
    announce(ANNOUNCE, 'No result. Please correct the highlighted fields.');
    first?.focus();
    return;
  }
  if (result.status === 'check') {
    showState('empty');
    const first = showGroupError(result.message, result.fields);
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
    el('fat-unit').textContent = result.mass.unit;
    el('lean-unit').textContent = result.mass.unit;
    massAnnouncement = ` Estimated fat mass: ${result.mass.fatDisplay} ${unitWord(result.mass.unit)}. Estimated lean mass, all mass that is not fat: ${result.mass.leanDisplay} ${unitWord(result.mass.unit)}.`;
  }
  showState('result');
  announce(ANNOUNCE, `Estimated body fat: ${result.percentDisplay} percent.${massAnnouncement} These are estimates.`);
}

function clearResult(): void {
  showState('empty');
  el('bf-ring').querySelector('.ring-fill')?.setAttribute('stroke-dashoffset', '100');
}

const formatConverted = (value: number): string => String(roundHalfUp(value, 1));

function convertField(input: HTMLInputElement, convert: (value: number) => number): void {
  const parsed = parseNumber(input.value);
  if (parsed.state === 'ok' && parsed.value > 0) input.value = formatConverted(convert(parsed.value));
}

/** Convert already-typed values when the unit system changes; empty or invalid fields stay as typed. */
function switchSystem(next: MeasurementSystem): void {
  if (next === system) return;
  if (system === 'metric') {
    const h = parseNumber(heightCm.value);
    if (h.state === 'ok' && h.value > 0) {
      const { feet, inches } = inchesToFeetInches(cmToInches(h.value));
      heightFt.value = String(feet);
      heightIn.value = String(inches);
    }
    for (const input of [neck, waist, hip]) convertField(input, cmToInches);
    convertField(weight, kgToLb);
  } else {
    const ft = parseNumber(heightFt.value);
    const inch = parseNumber(heightIn.value);
    if (ft.state === 'ok' && ft.value >= 0 && inch.state !== 'invalid') {
      const extra = inch.state === 'ok' ? inch.value : 0;
      heightCm.value = formatConverted(inchesToCm(feetInchesToInches(ft.value, extra)));
    }
    for (const input of [neck, waist, hip]) convertField(input, inchesToCm);
    convertField(weight, lbToKg);
  }
  system = next;
  applySystem();
  clearErrors();
  clearResult();
  announce(ANNOUNCE, `Units changed to ${next}. Your entered values were converted. Press Calculate to see your result.`);
}

function applySystem(): void {
  const imperial = system === 'imperial';
  metricHeight.hidden = imperial;
  imperialHeight.hidden = !imperial;
  const length = imperial ? 'in' : 'cm';
  for (const id of ['neck-unit', 'waist-unit', 'hip-unit']) el(id).textContent = length;
  el('weight-unit').textContent = imperial ? 'lb' : 'kg';
}

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

form.addEventListener('submit', (event) => {
  event.preventDefault();
  calculate();
});

for (const radio of form.querySelectorAll<HTMLInputElement>('input[name="system"]')) {
  radio.addEventListener('change', () => {
    if (radio.checked) switchSystem(radio.value as MeasurementSystem);
  });
}

for (const radio of form.querySelectorAll<HTMLInputElement>('input[name="sex"]')) {
  radio.addEventListener('change', () => {
    if (!radio.checked) return;
    applySex();
    clearErrors();
    clearResult();
    announce(ANNOUNCE, `Sex changed to ${radio.value}. Press Calculate to see your result.`);
  });
}

form.addEventListener('reset', (event) => {
  event.preventDefault();
  form.reset();
  for (const input of [heightCm, heightFt, heightIn, neck, waist, hip, weight]) input.value = '';
  system = 'metric';
  const metricRadio = form.querySelector<HTMLInputElement>('input[name="system"][value="metric"]');
  if (metricRadio) metricRadio.checked = true;
  const maleRadio = form.querySelector<HTMLInputElement>('input[name="sex"][value="male"]');
  if (maleRadio) maleRadio.checked = true;
  applySystem();
  applySex();
  clearErrors();
  clearResult();
  announce(ANNOUNCE, 'Form reset. Results and errors cleared.');
  heightCm.focus();
});

applySystem();
applySex();
showState('empty');
document.documentElement.classList.add('bodyfat-ready');
