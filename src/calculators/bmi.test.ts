// Reference cases, boundary cases and invalid-input cases from CALCULATION-SPEC.md section 2.10 and 1.6.
// Version 1 is metric-only (CALCULATION-SPEC.md 1.3): the imperial reference rows (B1, B8-B16, R4, R5) are historical and are not tested here;
// the exact-threshold behaviour they illustrated is covered by the metric boundary and threshold-scan tests below.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  ADULT_MIN_AGE,
  calculateBmi,
  categorize,
  evaluateBmi,
  healthyWeightRange,
  spectrumPosition,
} from './bmi.ts';
import type { BmiEvaluation, RawInput, Sex } from './bmi.ts';

type Ok = Extract<BmiEvaluation, { status: 'ok' }>;

function metric(age: number | string, heightCm: number | string, weightKg: number | string, sex: Sex = 'male'): RawInput {
  return { sex, age: String(age), height: String(heightCm), weight: String(weightKg) };
}
function ok(result: BmiEvaluation): Ok {
  assert.equal(result.status, 'ok', JSON.stringify(result));
  return result as Ok;
}

describe('B-cases: BMI value, category and boundary note (CALCULATION-SPEC.md 2.10)', () => {
  const cases: Array<{ id: string; input: RawInput; exact: number; display: string; category: string; note: boolean }> = [
    { id: 'B2 male 178 cm 74 kg', input: metric(28, 178, 74, 'male'), exact: 23.3556, display: '23.4', category: 'Healthy Weight', note: false },
    { id: 'B3 female 178 cm 74 kg', input: metric(28, 178, 74, 'female'), exact: 23.3556, display: '23.4', category: 'Healthy Weight', note: false },
    { id: 'B4 50 kg', input: metric(30, 178, 50), exact: 15.7808, display: '15.8', category: 'Underweight', note: false },
    { id: 'B5 80 kg', input: metric(30, 178, 80), exact: 25.2493, display: '25.2', category: 'Overweight', note: false },
    { id: 'B6 95 kg (29.984 shows 30.0)', input: metric(30, 178, 95), exact: 29.9836, display: '30.0', category: 'Overweight', note: true },
    { id: 'B7 111 kg', input: metric(30, 178, 111), exact: 35.0335, display: '35.0', category: 'Class 2 Obesity', note: false },
    { id: 'B18 age exactly 20 is adult', input: metric(20, 175, 70), exact: 22.8571, display: '22.9', category: 'Healthy Weight', note: false },
  ];
  for (const c of cases) {
    it(c.id, () => {
      const r = ok(evaluateBmi(c.input));
      assert.ok(Math.abs(r.exact - c.exact) < 5e-5, `exact ${r.exact}`);
      assert.equal(r.display, c.display);
      assert.equal(r.category.label, c.category);
      assert.equal(r.boundaryNote !== null, c.note);
    });
  }

  it('the boundary note names the exact value (B6: 95 kg at 178 cm)', () => {
    const r = ok(evaluateBmi(metric(30, 178, 95)));
    assert.equal(r.boundaryNote, 'BMI is shown rounded to one decimal. Your category is determined from the exact, unrounded BMI (29.984).');
  });
});

describe('category is decided from the exact value, never the rounded one', () => {
  it('uses exact thresholds 18.5, 25, 30, 35, 40 (lower bound inclusive) with exact inputs', () => {
    // 200 cm gives a divisor of exactly 4, so these BMIs are exactly 18.5, 25, 30, 35, 40.
    const expected: Array<[number, number, string]> = [
      [74, 18.5, 'Healthy Weight'],
      [100, 25, 'Overweight'],
      [120, 30, 'Class 1 Obesity'],
      [140, 35, 'Class 2 Obesity'],
      [160, 40, 'Class 3 Obesity'],
    ];
    for (const [kg, bmi, label] of expected) {
      const r = ok(evaluateBmi(metric(40, 200, kg)));
      assert.equal(r.exact, bmi);
      assert.equal(r.category.label, label);
      assert.equal(r.boundaryNote, null);
    }
  });
  it('categorize handles values just below each threshold', () => {
    assert.equal(categorize(18.4999999).id, 'underweight');
    assert.equal(categorize(24.9999999).id, 'healthy');
    assert.equal(categorize(29.9999999).id, 'overweight');
    assert.equal(categorize(34.9999999).id, 'obesity1');
    assert.equal(categorize(39.9999999).id, 'obesity2');
    assert.equal(categorize(40).id, 'obesity3');
    assert.equal(categorize(80).id, 'obesity3');
  });
  it('a value that rounds up to a threshold stays in the lower category and gets the note', () => {
    const r = ok(evaluateBmi(metric(30, 178, 95)));
    assert.equal(r.display, '30.0');
    assert.equal(r.category.id, 'overweight');
    assert.ok(r.boundaryNote);
  });
});

describe('threshold scan: classification follows the exact BMI, verified with integer arithmetic', () => {
  // BMI >= num/den, tested without floating point:
  //   metric (H whole cm, W in tenths of kg):  (W/10) x 10000 / H^2 >= num/den  <=>  W x 1000 x den >= num x H^2
  const thresholds: Array<{ name: string; num: number; den: number }> = [
    { name: '18.5', num: 37, den: 2 },
    { name: '25', num: 25, den: 1 },
    { name: '30', num: 30, den: 1 },
    { name: '35', num: 35, den: 1 },
    { name: '40', num: 40, den: 1 },
  ];
  const ids = ['underweight', 'healthy', 'overweight', 'obesity1', 'obesity2', 'obesity3'];
  const expectedId = (atOrAbove: (t: { num: number; den: number }) => boolean) => ids[thresholds.filter((t) => atOrAbove(t)).length];

  it('metric: every weight in a 0.7 kg window around each threshold, for heights 100 to 250 cm', () => {
    let checked = 0;
    for (let h = 100; h <= 250; h += 1) {
      for (const t of thresholds) {
        const first = Math.ceil((t.num * h * h) / (1000 * t.den)); // smallest tenths-of-kg weight at or above the threshold
        for (let w10 = first - 3; w10 <= first + 3; w10 += 1) {
          if (w10 < 200 || w10 > 5000) continue;
          const truth = expectedId((x) => w10 * 1000 * x.den >= x.num * h * h);
          const r = ok(evaluateBmi(metric(30, h, (w10 / 10).toFixed(1))));
          assert.equal(r.category.id, truth, `${h} cm, ${w10 / 10} kg, exact ${r.exact}`);
          checked += 1;
        }
      }
    }
    assert.ok(checked > 3000);
  });
  it('shows 18.5, 25 and 30 exactly at the threshold (metric 200 cm) and one step either side', () => {
    const cases: Array<[number, number, string, number, string]> = [
      // threshold weight, threshold BMI, label at threshold, step below weight is 0.1 kg
      [74, 18.5, 'Healthy Weight', 73.9, 'Underweight'],
      [100, 25, 'Overweight', 99.9, 'Healthy Weight'],
      [120, 30, 'Class 1 Obesity', 119.9, 'Overweight'],
    ];
    for (const [w, bmi, label, below, belowLabel] of cases) {
      const at = ok(evaluateBmi(metric(40, 200, w)));
      assert.equal(at.exact, bmi);
      assert.equal(at.category.label, label);
      assert.equal(ok(evaluateBmi(metric(40, 200, below))).category.label, belowLabel);
      assert.equal(ok(evaluateBmi(metric(40, 200, w + 0.1))).category.label, label);
    }
  });
  it('a displayed 25.0 or 30.0 is not enough to change category when the exact BMI is below the threshold', () => {
    // 178 cm: 79.2 kg is 24.996 (rounds to 25.0, Healthy) and 79.3 kg is 25.028 (Overweight)
    const below = ok(evaluateBmi(metric(30, 178, 79.2)));
    assert.equal(below.display, '25.0');
    assert.equal(below.category.id, 'healthy');
    assert.ok(below.boundaryNote);
    assert.equal(ok(evaluateBmi(metric(30, 178, 79.3))).category.id, 'overweight');
  });
});

describe('sex never changes the adult BMI result (B2 and B3)', () => {
  it('gives identical results for both sexes across several inputs', () => {
    const inputs: Array<[number, number, number]> = [[30, 178, 74], [45, 160, 90], [60, 190, 55], [25, 150, 40]];
    for (const [age, h, w] of inputs) {
      const a = ok(evaluateBmi(metric(age, h, w, 'male')));
      const b = ok(evaluateBmi(metric(age, h, w, 'female')));
      assert.deepEqual({ ...a }, { ...b });
    }
  });
});

describe('age eligibility (B17, B18, B19)', () => {
  it('shows no adult BMI or category under age 20', () => {
    for (const age of [1, 10, 19]) {
      const r = evaluateBmi(metric(age, 175, 70));
      assert.deepEqual(r, { status: 'under20', age });
    }
  });
  it('shows the under-20 notice even when height and weight are empty or invalid', () => {
    assert.equal(evaluateBmi(metric(19, '', '')).status, 'under20');
    assert.equal(evaluateBmi(metric(19, 'abc', '-3')).status, 'under20');
  });
  it('treats exactly 20 as adult', () => {
    assert.equal(ADULT_MIN_AGE, 20);
    assert.equal(ok(evaluateBmi(metric(20, 175, 70))).display, '22.9');
  });
  it('rejects ages that are not whole numbers from 1 to 120', () => {
    for (const age of ['0', '121', '20.5', '-4', 'abc', '', '1e2']) {
      const r = evaluateBmi(metric(age, 175, 70));
      assert.equal(r.status, 'invalid', age);
      assert.ok((r as Extract<BmiEvaluation, { status: 'invalid' }>).errors.age, age);
    }
    assert.equal(ok(evaluateBmi(metric(120, 175, 70))).display, '22.9');
  });
});

describe('input validation on canonical units (CALCULATION-SPEC.md 1.3)', () => {
  const errors = (r: BmiEvaluation) => (r as Extract<BmiEvaluation, { status: 'invalid' }>).errors;

  it('accepts the metric height limits inclusively and rejects values just outside', () => {
    assert.equal(evaluateBmi(metric(30, 100, 50)).status, 'ok');
    assert.equal(evaluateBmi(metric(30, 250, 90)).status, 'ok');
    assert.ok(errors(evaluateBmi(metric(30, 99.99, 50))).height);
    assert.ok(errors(evaluateBmi(metric(30, 250.01, 90))).height);
  });
  it('accepts the weight limits inclusively and rejects values just outside', () => {
    assert.equal(evaluateBmi(metric(30, 175, 20)).status, 'ok');
    assert.equal(evaluateBmi(metric(30, 175, 500)).status, 'ok');
    assert.ok(errors(evaluateBmi(metric(30, 175, 19.99))).weight);
    assert.ok(errors(evaluateBmi(metric(30, 175, 500.01))).weight);
  });
  it('rejects empty, text, negative, zero and NaN values with a message for each field', () => {
    const r = evaluateBmi(metric(30, '', ''));
    assert.deepEqual(Object.keys(errors(r)).sort(), ['height', 'weight']);
    for (const bad of ['abc', 'NaN', '-175', '0', '1e2', ' ']) {
      assert.equal(evaluateBmi(metric(30, bad, 70)).status, 'invalid', `height ${bad}`);
      assert.equal(evaluateBmi(metric(30, 175, bad)).status, 'invalid', `weight ${bad}`);
    }
  });
  it('accepts a comma decimal separator', () => {
    assert.equal(ok(evaluateBmi(metric(30, '175,5', '70,5'))).display, ok(evaluateBmi(metric(30, '175.5', '70.5'))).display);
  });
  it('rejects what a metric-only field cannot hold, with a message that says what to type', () => {
    const bad = ['84 cm', '175cm', "5'10", '١٧٨', '175٫5', '1,7,5', '175..5', '--5'];
    for (const value of bad) {
      const h = errors(evaluateBmi(metric(30, value, 70))).height ?? '';
      assert.match(h, /centimetres.*digits and a decimal point only.*Do not add units/, `height ${value}`);
      const w = errors(evaluateBmi(metric(30, 175, value))).weight ?? '';
      assert.match(w, /kilograms.*digits and a decimal point only.*Do not add units/, `weight ${value}`);
    }
  });
  it('accepts decimal metric values', () => {
    assert.equal(ok(evaluateBmi(metric(30, '175.5', '70.25'))).display, '22.8');
    assert.equal(ok(evaluateBmi(metric(30, '178', '74.0'))).display, '23.4');
  });
  it('empty fields say what to enter and in which unit', () => {
    const e = errors(evaluateBmi(metric(30, '', '')));
    assert.equal(e.height, 'Enter your height in centimetres.');
    assert.equal(e.weight, 'Enter your weight in kilograms.');
  });
  it('messages state technical limits only (no health wording)', () => {
    const r = errors(evaluateBmi(metric(30, 99, 19)));
    assert.match(r.height ?? '', /between 100 and 250 cm/);
    assert.match(r.weight ?? '', /between 20 and 500 kg/);
    for (const msg of Object.values(r)) assert.doesNotMatch(msg, /healthy|safe|recommend|medical/i);
  });
});

describe('BMI value is a pure function of the metric inputs', () => {
  it('calculateBmi(height cm, weight kg)', () => {
    assert.ok(Math.abs(calculateBmi(178, 74) - 23.3556) < 1e-4);
    assert.equal(calculateBmi(200, 74), 18.5);
  });
});

describe('healthy-weight range (R-cases, CALCULATION-SPEC.md 2.8 and 2.10)', () => {
  const cases: Array<[string, number, number, number]> = [
    ['R1 178 cm', 178, 58.7, 79.2],
    ['R2 165 cm', 165, 50.4, 68.0],
    ['R3 160 cm (exact multiple at the upper end)', 160, 47.4, 63.9],
  ];
  for (const [id, height, min, max] of cases) {
    it(id, () => {
      const r = healthyWeightRange(height);
      assert.equal(r.min, min);
      assert.equal(r.max, max);
      assert.equal(r.unit, 'kg');
    });
  }
  it('every endpoint is inside the Healthy Weight category by exact BMI', () => {
    const cm = [100, 123.4, 150, 160, 165, 170.5, 178, 190, 200, 250];
    for (const h of cm) {
      const r = healthyWeightRange(h);
      assert.ok(calculateBmi(h, r.min) >= 18.5, `min ${h}`);
      assert.ok(calculateBmi(h, r.max) < 25, `max ${h}`);
      // one step beyond each end is outside
      assert.ok(calculateBmi(h, Math.round((r.min - 0.1) * 10) / 10) < 18.5, `below ${h}`);
      assert.ok(calculateBmi(h, Math.round((r.max + 0.1) * 10) / 10) >= 25, `above ${h}`);
    }
  });
  it('is shown as text in kg', () => {
    assert.equal(ok(evaluateBmi(metric(30, 178, 74))).rangeText, '58.7 to 79.2 kg');
  });
});

describe('reference spectrum position', () => {
  it('maps 15 to 40 onto 0 to 100 and clamps', () => {
    assert.equal(spectrumPosition(15), 0);
    assert.equal(spectrumPosition(40), 100);
    assert.equal(spectrumPosition(27.5), 50);
    assert.equal(spectrumPosition(10), 0);
    assert.equal(spectrumPosition(60), 100);
  });
});
