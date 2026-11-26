// Wires the BMR & TDEE page to the pure logic in src/calculators/bmr-tdee.ts. Nothing is stored or sent anywhere.
import { ACTIVITY_CATEGORIES, ELIGIBILITY_NOTICE, evaluateEnergy, findActivity } from '../calculators/bmr-tdee.ts';
import type { EnergyFieldName, EnergyInput, Sex } from '../calculators/bmr-tdee.ts';
import { announce, el } from './calc-form.ts';

const form = el<HTMLFormElement>('energy-form');
const age = el<HTMLInputElement>('age');
const height = el<HTMLInputElement>('height');
const weight = el<HTMLInputElement>('weight');
const activity = el<HTMLSelectElement>('activity');
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
  height: [height],
  weight: [weight],
  activity: [activity],
};
const errorBoxes: Record<EnergyFieldName, HTMLElement[]> = {
  age: [el('age-error')],
  height: [el('height-error')],
  weight: [el('weight-error')],
  activity: [el('activity-error')],
};

function checked(name: string): string {
  const input = form.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`);
  return input ? input.value : '';
}

function readInput(): EnergyInput {
  return {
    sex: (checked('sex') || 'male') as Sex,
    age: age.value,
    height: height.value,
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
    const box = errorBoxes[field][0];
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

form.addEventListener('submit', (event) => {
  event.preventDefault();
  calculate();
});

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
  for (const input of [age, height, weight]) input.value = '';
  activity.selectedIndex = 0;
  const maleRadio = form.querySelector<HTMLInputElement>('input[name="sex"][value="male"]');
  if (maleRadio) maleRadio.checked = true;
  renderActivityDescription();
  clearErrors();
  showState('empty');
  announce(ANNOUNCE, 'Form reset. Results cleared.');
  age.focus();
});

// Sanity check at start-up: the select must offer exactly the four approved categories plus the placeholder.
if (activity.options.length !== ACTIVITY_CATEGORIES.length + 1) throw new Error('Unexpected activity options');
activity.selectedIndex = 0;
renderActivityDescription();
showState('empty');
document.documentElement.classList.add('energy-ready');
