// Wires the BMR & TDEE page to the pure logic in src/calculators/bmr-tdee.ts. Nothing is stored or sent anywhere.
import { ACTIVITY_CATEGORIES, ELIGIBILITY_NOTICE, evaluateEnergy, findActivity } from '../calculators/bmr-tdee.ts';
import type { EnergyFieldName, EnergyInput, Sex } from '../calculators/bmr-tdee.ts';
import type { MeasurementSystem } from '../calculators/inputs.ts';
import {
  cmToInches,
  feetInchesToInches,
  inchesToCm,
  inchesToFeetInches,
  kgToLb,
  lbToKg,
  parseNumber,
  roundHalfUp,
} from '../calculators/units.ts';
import { announce, el } from './calc-form.ts';

const form = el<HTMLFormElement>('energy-form');
const age = el<HTMLInputElement>('age');
const heightCm = el<HTMLInputElement>('height-cm');
const heightFt = el<HTMLInputElement>('height-ft');
const heightIn = el<HTMLInputElement>('height-in');
const weight = el<HTMLInputElement>('weight');
const activity = el<HTMLSelectElement>('activity');
const weightUnit = el('weight-unit');
const metricHeight = el('height-metric');
const imperialHeight = el('height-imperial');
const activityDescription = el('activity-description');
const ACTIVITY_PROMPT = 'Choose a category to see what it means and its physical activity level (PAL) range.';
const ANNOUNCE = 'energy-announce';

const states = {
  empty: el('result-empty'),
  result: el('result-ok'),
  ineligible: el('result-ineligible'),
};

const fieldInputs: Record<EnergyFieldName, Array<HTMLInputElement | HTMLSelectElement>> = {
  age: [age],
  height: [heightCm, heightFt, heightIn],
  weight: [weight],
  activity: [activity],
};
const errorBoxes: Record<EnergyFieldName, HTMLElement[]> = {
  age: [el('age-error')],
  height: [el('height-cm-error'), el('height-ft-error')],
  weight: [el('weight-error')],
  activity: [el('activity-error')],
};

let system: MeasurementSystem = 'metric';

function checked(name: string): string {
  const input = form.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`);
  return input ? input.value : '';
}

function readInput(): EnergyInput {
  const imperial = system === 'imperial';
  return {
    system,
    sex: (checked('sex') || 'male') as Sex,
    age: age.value,
    heightMain: imperial ? heightFt.value : heightCm.value,
    heightInches: imperial ? heightIn.value : '',
    weight: weight.value,
    activity: activity.value,
  };
}

function showState(name: keyof typeof states): void {
  for (const [key, node] of Object.entries(states)) node.hidden = key !== name;
}

function clearErrors(): void {
  for (const inputs of Object.values(fieldInputs)) for (const input of inputs) input.removeAttribute('aria-invalid');
  for (const boxes of Object.values(errorBoxes)) {
    for (const box of boxes) {
      box.hidden = true;
      box.textContent = '';
    }
  }
}

function showErrors(errors: Partial<Record<EnergyFieldName, string>>): HTMLElement | null {
  let first: HTMLElement | null = null;
  const order: EnergyFieldName[] = ['age', 'height', 'weight', 'activity'];
  for (const field of order) {
    const message = errors[field];
    if (!message) continue;
    const visibleInputs = fieldInputs[field].filter((input) => input.offsetParent !== null);
    for (const input of visibleInputs) input.setAttribute('aria-invalid', 'true');
    const box = field === 'height' ? (system === 'imperial' ? errorBoxes.height[1] : errorBoxes.height[0]) : errorBoxes[field][0];
    box.textContent = message;
    box.hidden = false;
    if (!first) first = visibleInputs[0] ?? null;
  }
  return first;
}

function renderActivityDescription(): void {
  const chosen = findActivity(activity.value);
  activityDescription.replaceChildren();
  if (!chosen) {
    activityDescription.textContent = ACTIVITY_PROMPT;
    return;
  }
  const title = document.createElement('strong');
  title.textContent = `${chosen.label} (${chosen.pal})`;
  activityDescription.append(title, ' ', chosen.description);
}

function calculate(): void {
  clearErrors();
  const result = evaluateEnergy(readInput());

  if (result.status === 'invalid') {
    showState('empty');
    const first = showErrors(result.errors);
    announce(ANNOUNCE, 'No result. Please correct the highlighted fields.');
    first?.focus();
    return;
  }
  if (result.status === 'ineligible') {
    showState('ineligible');
    announce(ANNOUNCE, ELIGIBILITY_NOTICE);
    return;
  }

  el('tee-value').textContent = result.teeDisplay;
  el('ree-value').textContent = result.reeDisplay;
  el('tee-category').textContent = result.category.label;
  showState('result');
  announce(
    ANNOUNCE,
    `Estimated total energy expenditure, TEE: ${result.teeDisplay} kilocalories per day, for the activity category ${result.category.label}. ` +
      `Estimated resting energy expenditure, REE, Mifflin–St Jeor: ${result.reeDisplay} kilocalories per day. These are estimates.`,
  );
}

function formatConverted(value: number): string {
  return String(roundHalfUp(value, 1));
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
    const w = parseNumber(weight.value);
    if (w.state === 'ok' && w.value > 0) weight.value = formatConverted(kgToLb(w.value));
  } else {
    const ft = parseNumber(heightFt.value);
    const inch = parseNumber(heightIn.value);
    if (ft.state === 'ok' && ft.value >= 0 && inch.state !== 'invalid') {
      const extra = inch.state === 'ok' ? inch.value : 0;
      heightCm.value = formatConverted(inchesToCm(feetInchesToInches(ft.value, extra)));
    }
    const w = parseNumber(weight.value);
    if (w.state === 'ok' && w.value > 0) weight.value = formatConverted(lbToKg(w.value));
  }
  system = next;
  applySystem();
  clearErrors();
  showState('empty');
  announce(ANNOUNCE, `Units changed to ${next}. Your entered values were converted. Press Calculate to see your result.`);
}

function applySystem(): void {
  const imperial = system === 'imperial';
  metricHeight.hidden = imperial;
  imperialHeight.hidden = !imperial;
  weightUnit.textContent = imperial ? 'lb' : 'kg';
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

activity.addEventListener('change', () => {
  renderActivityDescription();
  activity.removeAttribute('aria-invalid');
  const box = errorBoxes.activity[0];
  box.hidden = true;
  box.textContent = '';
});

form.addEventListener('reset', (event) => {
  event.preventDefault();
  form.reset();
  for (const input of [age, heightCm, heightFt, heightIn, weight]) input.value = '';
  activity.selectedIndex = 0;
  system = 'metric';
  const metricRadio = form.querySelector<HTMLInputElement>('input[name="system"][value="metric"]');
  if (metricRadio) metricRadio.checked = true;
  const maleRadio = form.querySelector<HTMLInputElement>('input[name="sex"][value="male"]');
  if (maleRadio) maleRadio.checked = true;
  applySystem();
  renderActivityDescription();
  clearErrors();
  showState('empty');
  announce(ANNOUNCE, 'Form reset. Results cleared.');
  age.focus();
});

// Sanity check at start-up: the select must offer exactly the four approved categories plus the placeholder.
if (activity.options.length !== ACTIVITY_CATEGORIES.length + 1) throw new Error('Unexpected activity options');
activity.selectedIndex = 0;
applySystem();
renderActivityDescription();
showState('empty');
document.documentElement.classList.add('energy-ready');
