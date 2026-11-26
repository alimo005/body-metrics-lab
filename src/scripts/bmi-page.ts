// Wires the BMI page to the pure logic in src/calculators/bmi.ts. Nothing is stored or sent anywhere.
import { evaluateBmi, spectrumPosition } from '../calculators/bmi.ts';
import type { FieldName, RawInput, Sex } from '../calculators/bmi.ts';
import { parseNumber } from '../calculators/units.ts';

function el<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing element #${id}`);
  return node as T;
}

const form = el<HTMLFormElement>('bmi-form');
const age = el<HTMLInputElement>('age');
const height = el<HTMLInputElement>('height');
const weight = el<HTMLInputElement>('weight');

const states = {
  empty: el('result-empty'),
  result: el('result-ok'),
  under20: el('result-under20'),
};

const fieldInputs: Record<FieldName, HTMLInputElement[]> = {
  age: [age],
  height: [height],
  weight: [weight],
};
const errorBoxes: Record<FieldName, HTMLElement[]> = {
  age: [el('age-error')],
  height: [el('height-error')],
  weight: [el('weight-error')],
};

function checked(name: string): string {
  const input = form.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`);
  return input ? input.value : '';
}

function readInput(): RawInput {
  return {
    sex: (checked('sex') || 'male') as Sex,
    age: age.value,
    height: height.value,
    weight: weight.value,
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

function showErrors(errors: Partial<Record<FieldName, string>>): HTMLInputElement | null {
  let first: HTMLInputElement | null = null;
  const order: FieldName[] = ['age', 'height', 'weight'];
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

function text(id: string, value: string): void {
  el(id).textContent = value;
}

function heightText(raw: RawInput): string {
  const parsed = parseNumber(raw.height);
  return parsed.state === 'ok' ? `${parsed.value} cm` : '';
}

/** Short spoken summary in the polite live region. Cleared first so a repeated identical result is announced again. */
function announce(message: string): void {
  const region = el('bmi-announce');
  region.textContent = '';
  window.setTimeout(() => {
    region.textContent = message;
  }, 50);
}

function calculate(): void {
  clearErrors();
  const raw = readInput();
  const result = evaluateBmi(raw);

  if (result.status === 'invalid') {
    showState('empty');
    const first = showErrors(result.errors);
    announce('No result. Please correct the highlighted fields.');
    first?.focus();
    return;
  }
  if (result.status === 'under20') {
    showState('under20');
    announce('Adult BMI is not shown for ages under 20. The adult categories do not apply.');
    return;
  }

  text('bmi-value', result.display);
  text('bmi-category', result.category.label);
  el('icon-healthy').hidden = result.category.group !== 'healthy';
  el('icon-other').hidden = result.category.group === 'healthy';
  text('bmi-threshold', `${result.category.range} kg/m²`);
  text('bmi-range', `${result.rangeText} for ${heightText(raw)}`);

  const pos = 3 + (spectrumPosition(result.exact) / 100) * 94;
  const marker = el('bmi-marker');
  marker.style.setProperty('--pos', String(pos));
  marker.hidden = false;
  text('bmi-marker-value', result.display);
  for (const node of document.querySelectorAll<HTMLElement>('.ref-bar [data-group]')) {
    node.classList.toggle('active', node.dataset.group === result.category.group);
  }

  const note = el('bmi-boundary');
  note.hidden = result.boundaryNote === null;
  text('bmi-boundary-text', result.boundaryNote ?? '');
  showState('result');
  announce(
    `Your BMI is ${result.display} kilograms per square metre. Category: ${result.category.label}. ` +
      `Healthy Weight range for your height: about ${result.rangeText}.` +
      (result.boundaryNote ? ` ${result.boundaryNote}` : ''),
  );
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  calculate();
});

form.addEventListener('reset', (event) => {
  event.preventDefault();
  form.reset();
  for (const input of [age, height, weight]) input.value = '';
  const maleRadio = form.querySelector<HTMLInputElement>('input[name="sex"][value="male"]');
  if (maleRadio) maleRadio.checked = true;
  clearErrors();
  showState('empty');
  announce('Form reset. Result cleared.');
  age.focus();
});

showState('empty');
document.documentElement.classList.add('bmi-ready');
