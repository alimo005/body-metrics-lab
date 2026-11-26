// Wires the BMI page to the pure logic in src/calculators/bmi.ts. Nothing is stored or sent anywhere.
import { evaluateBmi, spectrumPosition } from '../calculators/bmi.ts';
import type { FieldName, RawInput, Sex, System } from '../calculators/bmi.ts';
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

function el<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing element #${id}`);
  return node as T;
}

const form = el<HTMLFormElement>('bmi-form');
const age = el<HTMLInputElement>('age');
const heightCm = el<HTMLInputElement>('height-cm');
const heightFt = el<HTMLInputElement>('height-ft');
const heightIn = el<HTMLInputElement>('height-in');
const weight = el<HTMLInputElement>('weight');
const weightUnit = el('weight-unit');
const metricHeight = el('height-metric');
const imperialHeight = el('height-imperial');

const states = {
  empty: el('result-empty'),
  result: el('result-ok'),
  under20: el('result-under20'),
};

const fieldInputs: Record<FieldName, HTMLInputElement[]> = {
  age: [age],
  height: [heightCm, heightFt, heightIn],
  weight: [weight],
};
const errorBoxes: Record<FieldName, HTMLElement[]> = {
  age: [el('age-error')],
  height: [el('height-cm-error'), el('height-ft-error')],
  weight: [el('weight-error')],
};

let system: System = 'metric';

function checked(name: string): string {
  const input = form.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`);
  return input ? input.value : '';
}

function readInput(): RawInput {
  const imperial = system === 'imperial';
  return {
    system,
    sex: (checked('sex') || 'male') as Sex,
    age: age.value,
    heightMain: imperial ? heightFt.value : heightCm.value,
    heightInches: imperial ? heightIn.value : '',
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
    const box = field === 'height' ? (system === 'imperial' ? errorBoxes.height[1] : errorBoxes.height[0]) : errorBoxes[field][0];
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
  if (raw.system === 'metric') {
    const parsed = parseNumber(raw.heightMain);
    return parsed.state === 'ok' ? `${parsed.value} cm` : '';
  }
  const feet = parseNumber(raw.heightMain);
  const inches = parseNumber(raw.heightInches);
  const inchValue = inches.state === 'ok' ? inches.value : 0;
  return feet.state === 'ok' ? `${feet.value} ft ${inchValue} in` : '';
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

function formatConverted(value: number): string {
  return String(roundHalfUp(value, 1));
}

/** Convert already-typed values when the unit system changes; fields that are empty or invalid stay as typed. */
function switchSystem(next: System): void {
  if (next === system) return;
  const prev = system;
  if (prev === 'metric') {
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
  announce(`Units changed to ${next}. Your entered values were converted. Press Calculate to see your result.`);
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
    if (radio.checked) switchSystem(radio.value as System);
  });
}

form.addEventListener('reset', (event) => {
  event.preventDefault();
  form.reset();
  for (const input of [age, heightCm, heightFt, heightIn, weight]) input.value = '';
  system = 'metric';
  const metricRadio = form.querySelector<HTMLInputElement>('input[name="system"][value="metric"]');
  if (metricRadio) metricRadio.checked = true;
  const maleRadio = form.querySelector<HTMLInputElement>('input[name="sex"][value="male"]');
  if (maleRadio) maleRadio.checked = true;
  applySystem();
  clearErrors();
  showState('empty');
  announce('Form reset. Result cleared.');
  age.focus();
});

applySystem();
showState('empty');
document.documentElement.classList.add('bmi-ready');
