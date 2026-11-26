// Tests T1 to T11 of CALCULATION-SPEC.md section 3.9 and the validation rules of 3.3.
// The expected numbers below are typed from the spec tables on purpose, separately from the code under test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  ACTIVITY_CATEGORIES,
  ACTIVITY_REQUIRED_MESSAGE,
  ELIGIBILITY_NOTICE,
  ELIGIBLE_AGE,
  TEE_COEFFICIENTS,
  calculateRee,
  calculateTee,
  evaluateEnergy,
  formatKcal,
  roundKcal,
} from './bmr-tdee.ts';
import type { ActivityCategory, EnergyEvaluation, EnergyInput, Sex } from './bmr-tdee.ts';

type Ok = Extract<EnergyEvaluation, { status: 'ok' }>;
type Invalid = Extract<EnergyEvaluation, { status: 'invalid' }>;

const categories: ActivityCategory[] = ['inactive', 'lowActive', 'active', 'veryActive'];

function metric(sex: Sex, age: number | string, heightCm: number | string, weightKg: number | string, activity: string = 'lowActive'): EnergyInput {
  return { sex, age: String(age), height: String(heightCm), weight: String(weightKg), activity };
}
function ok(r: EnergyEvaluation): Ok {
  assert.equal(r.status, 'ok', JSON.stringify(r));
  return r as Ok;
}
const near = (a: number, b: number, tol: number, msg?: string) => assert.ok(Math.abs(a - b) <= tol, `${msg ?? ''} ${a} vs ${b}`);

describe('T1-T6 full reference table (CALCULATION-SPEC.md 3.9)', () => {
  // [id, sex, age, height cm, weight kg, REE, [Inactive, Low Active, Active, Very Active]]
  const table: Array<[string, Sex, number, number, number, number, [number, number, number, number]]> = [
    ['T1', 'male', 28, 178, 74, 1717.5, [2650.23, 2861.19, 3039.48, 3371.6]],
    ['T2', 'female', 30, 165, 60, 1320.25, [2021.0, 2182.87, 2319.45, 2551.68]],
    ['T3', 'male', 40, 175, 70, 1598.75, [2444.37, 2646.57, 2826.32, 3118.37]],
    ['T4', 'female', 25, 160, 55, 1264, [1968.9, 2124.22, 2260.1, 2478.58]],
    ['T5', 'male', 19, 178, 74, 1762.5, [2747.7, 2958.66, 3136.95, 3469.07]],
    ['T6', 'female', 78, 160, 55, 999, [1597.37, 1752.69, 1888.57, 2107.05]],
  ];
  for (const [id, sex, age, h, w, ree, tees] of table) {
    it(`${id}: ${sex}, ${age} y, ${h} cm, ${w} kg`, () => {
      near(calculateRee(sex, age, h, w), ree, 1e-9, `${id} REE`);
      categories.forEach((c, i) => near(calculateTee(sex, c, age, h, w), tees[i], 0.005, `${id} ${c}`));
    });
    it(`${id}: whole-kcal display from the page function, all four categories`, () => {
      categories.forEach((c, i) => {
        const r = ok(evaluateEnergy(metric(sex, age, h, w, c)));
        assert.equal(r.reeDisplay, formatKcal(Math.round(ree + 1e-9)));
        assert.equal(r.teeDisplay, formatKcal(Math.round(tees[i] + 1e-9)));
        assert.equal(r.category.id, c);
      });
    });
  }
  it('prints the whole-kcal values listed in the spec (T1 to T6)', () => {
    const expected: Record<string, [string, string[]]> = {
      T1: ['1,718', ['2,650', '2,861', '3,039', '3,372']],
      T2: ['1,320', ['2,021', '2,183', '2,319', '2,552']],
      T3: ['1,599', ['2,444', '2,647', '2,826', '3,118']],
      T4: ['1,264', ['1,969', '2,124', '2,260', '2,479']],
      T5: ['1,763', ['2,748', '2,959', '3,137', '3,469']],
      T6: ['999', ['1,597', '1,753', '1,889', '2,107']],
    };
    for (const [id, sex, age, h, w] of table) {
      const [ree, tees] = expected[id];
      categories.forEach((c, i) => {
        const r = ok(evaluateEnergy(metric(sex, age, h, w, c)));
        assert.equal(r.reeDisplay, ree, `${id} REE`);
        assert.equal(r.teeDisplay, tees[i], `${id} ${c}`);
      });
    }
  });
});

describe('published National Academies worked examples TE1-TE3 (3.9)', () => {
  it('TE1: woman, 22 y, 165 cm, 63 kg, Low Active -> 2275.37 (report prints 2,275)', () => {
    near(calculateTee('female', 'lowActive', 22, 165, 63), 2275.37, 0.005);
    assert.equal(roundKcal(calculateTee('female', 'lowActive', 22, 165, 63)), 2275);
  });
  it('TE2: woman, 53.9 y, 162.3 cm, 71.9 kg, Active -> 2281.10 (Table 5-8: 2,281)', () => {
    near(calculateTee('female', 'active', 53.9, 162.3, 71.9), 2281.1, 0.005);
  });
  it('TE3: man, 50.3 y, 175.9 cm, 83.1 kg, Active -> 2929.06 (printed 2,930 from unrounded inputs; within 1.5)', () => {
    near(calculateTee('male', 'active', 50.3, 175.9, 83.1), 2929.06, 0.005);
    near(calculateTee('male', 'active', 50.3, 175.9, 83.1), 2930, 1.5);
  });
});

describe('T10: all eight TEE equations, coefficient by coefficient (3.4)', () => {
  // Independent transcription of CALCULATION-SPEC.md 3.4: [intercept, per-year age term (subtracted), height, weight].
  const spec: Record<Sex, Record<ActivityCategory, [number, number, number, number]>> = {
    male: {
      inactive: [753.07, 10.83, 6.5, 14.1],
      lowActive: [581.47, 10.83, 8.3, 14.94],
      active: [1004.82, 10.83, 6.52, 15.91],
      veryActive: [-517.88, 10.83, 15.61, 19.11],
    },
    female: {
      inactive: [584.9, 7.01, 5.72, 11.71],
      lowActive: [575.77, 7.01, 6.6, 12.14],
      active: [710.25, 7.01, 6.54, 12.34],
      veryActive: [511.83, 7.01, 9.07, 12.56],
    },
  };
  for (const sex of ['male', 'female'] as const) {
    for (const c of categories) {
      const [k, a, h, w] = spec[sex][c];
      it(`${sex} ${c}: constants and one-unit changes`, () => {
        // The stored table equals the spec (sign and value of every constant).
        assert.deepEqual(TEE_COEFFICIENTS[sex][c], { intercept: k, age: a, height: h, weight: w });
        // Value at a probe point.
        near(calculateTee(sex, c, 30, 170, 70), k - a * 30 + h * 170 + w * 70, 1e-9, 'probe');
        // The intercept is the value at age 0, height 0, weight 0.
        near(calculateTee(sex, c, 0, 0, 0), k, 1e-9, 'intercept');
        // One more year lowers TEE by the age coefficient; one more cm / kg raises it by its coefficient.
        near(calculateTee(sex, c, 31, 170, 70) - calculateTee(sex, c, 30, 170, 70), -a, 1e-9, 'age');
        near(calculateTee(sex, c, 30, 171, 70) - calculateTee(sex, c, 30, 170, 70), h, 1e-9, 'height');
        near(calculateTee(sex, c, 30, 170, 71) - calculateTee(sex, c, 30, 170, 70), w, 1e-9, 'weight');
      });
    }
  }
  it('men, Very Active keeps its NEGATIVE constant -517.88', () => {
    assert.equal(TEE_COEFFICIENTS.male.veryActive.intercept, -517.88);
    near(calculateTee('male', 'veryActive', 28, 178, 74), 3371.6, 0.005); // T1: -517.88 - 303.24 + 2778.58 + 1414.14
    near(-517.88 - 10.83 * 28 + 15.61 * 178 + 19.11 * 74, 3371.6, 0.005);
  });
  it('the age coefficient is identical for the four categories of a sex', () => {
    for (const sex of ['male', 'female'] as const) {
      assert.equal(new Set(categories.map((c) => TEE_COEFFICIENTS[sex][c].age)).size, 1);
    }
  });
  it('has exactly 4 categories x 2 sexes', () => {
    assert.deepEqual(Object.keys(TEE_COEFFICIENTS).sort(), ['female', 'male']);
    for (const sex of ['male', 'female'] as const) assert.deepEqual(Object.keys(TEE_COEFFICIENTS[sex]).sort(), [...categories].sort());
  });
});

describe('REE: Mifflin-St Jeor (3.3)', () => {
  it('uses 10 x kg + 6.25 x cm - 5 x age, +5 for men and -161 for women', () => {
    assert.equal(calculateRee('male', 28, 178, 74), 10 * 74 + 6.25 * 178 - 5 * 28 + 5);
    assert.equal(calculateRee('female', 30, 165, 60), 10 * 60 + 6.25 * 165 - 5 * 30 - 161);
  });
  it('men differ from women by exactly 166 kcal/day at the same inputs', () => {
    for (const [a, h, w] of [[28, 178, 74], [45, 160, 55], [78, 190, 120]] as const) {
      near(calculateRee('male', a, h, w) - calculateRee('female', a, h, w), 166, 1e-9);
    }
  });
  it('REE does not depend on the activity category, but TEE does (independence)', () => {
    const results = categories.map((c) => ok(evaluateEnergy(metric('male', 28, 178, 74, c))));
    assert.equal(new Set(results.map((r) => r.reeDisplay)).size, 1);
    assert.equal(new Set(results.map((r) => r.ree)).size, 1);
    assert.equal(new Set(results.map((r) => r.teeDisplay)).size, 4);
  });
  it('TEE is not derived from REE: no fixed ratio between them across the four categories', () => {
    const r = categories.map((c) => ok(evaluateEnergy(metric('female', 30, 165, 60, c))));
    const ratios = r.map((x) => x.tee / x.ree);
    assert.ok(new Set(ratios.map((x) => x.toFixed(6))).size === 4);
  });
});

describe('T7 (historical): imperial input was removed (metric-only policy, CALCULATION-SPEC.md 1.3)', () => {
  const invalid = (r: EnergyEvaluation) => (r as Extract<EnergyEvaluation, { status: 'invalid' }>).errors;
  it('the energy input has no system, feet, inches or pounds field', () => {
    const input = metric('male', 28, 178, 74, 'active');
    assert.deepEqual(Object.keys(input).sort(), ['activity', 'age', 'height', 'sex', 'weight']);
  });
  it('decimal metric values with a period work; a comma decimal is rejected', () => {
    const a = ok(evaluateEnergy(metric('female', 30, '165.5', '60.5', 'active')));
    assert.ok(a.tee > 0 && a.ree > 0);
    assert.ok(invalid(evaluateEnergy(metric('female', 30, '165,5', '60.5', 'active'))).height);
    assert.ok(invalid(evaluateEnergy(metric('female', 30, '165.5', '60,5', 'active'))).weight);
  });
  it('rejects unit text, feet-and-inches notation and non-ASCII digits in height and weight', () => {
    for (const bad of ['178 cm', '178cm', "5'10", '١٧٨', '75kg', '74٫5']) {
      assert.ok(invalid(evaluateEnergy(metric('male', 30, bad, 70))).height, `height ${bad}`);
      assert.ok(invalid(evaluateEnergy(metric('male', 30, 170, bad))).weight, `weight ${bad}`);
    }
  });
});

describe('T8 and T9: age eligibility 19 to 78 inclusive (3.3)', () => {
  it('exports the approved range', () => {
    assert.deepEqual({ ...ELIGIBLE_AGE }, { min: 19, max: 78 });
  });
  it('T9: ages 19 and 78 are accepted for both sexes', () => {
    for (const sex of ['male', 'female'] as const) for (const age of [19, 78]) assert.equal(evaluateEnergy(metric(sex, age, 170, 70)).status, 'ok', `${sex} ${age}`);
  });
  it('T8: ages 18 and 79 give the notice and no numbers, for both sexes', () => {
    for (const sex of ['male', 'female'] as const) {
      for (const age of [18, 79]) assert.deepEqual(evaluateEnergy(metric(sex, age, 170, 70)), { status: 'ineligible', age });
    }
  });
  it('every valid whole age outside 19-78 is ineligible (1-18 and 79-120)', () => {
    for (let age = 1; age <= 120; age += 1) {
      const eligible = age >= 19 && age <= 78;
      assert.equal(evaluateEnergy(metric('male', age, 170, 70)).status, eligible ? 'ok' : 'ineligible', String(age));
    }
  });
  it('the notice text is the approved sentence', () => {
    assert.equal(ELIGIBILITY_NOTICE, 'This equation was developed in adults aged 19–78; no estimate is shown.');
  });
});

describe('T11: validation priority (3.3)', () => {
  const invalid = (r: EnergyEvaluation) => (r as Invalid).errors;

  it('1. invalid age gives an age error and no result', () => {
    for (const age of ['', '   ', 'abc', 'NaN', '20.5', '0', '-3', '121', '1e2']) {
      const r = evaluateEnergy(metric('male', age, 170, 70));
      assert.equal(r.status, 'invalid', age);
      assert.ok(invalid(r).age, age);
    }
  });
  it('2. a valid but ineligible age gives the notice even when other fields are empty or invalid', () => {
    for (const age of [1, 18, 79, 120]) {
      assert.deepEqual(evaluateEnergy({ sex: 'female', age: String(age), height: '', weight: '', activity: '' }), { status: 'ineligible', age });
      assert.equal(evaluateEnergy(metric('male', age, 'abc', '-3', '')).status, 'ineligible');
      assert.equal(evaluateEnergy(metric('male', age, 9999, 9999, 'nonsense')).status, 'ineligible');
    }
  });
  it('3. age 19-78 validates height, weight and activity, with one message per field and no result', () => {
    const r = evaluateEnergy({ sex: 'male', age: '30', height: '', weight: 'abc', activity: '' });
    assert.deepEqual(Object.keys(invalid(r)).sort(), ['activity', 'height', 'weight']);
    assert.equal(invalid(r).activity, ACTIVITY_REQUIRED_MESSAGE);
  });
  it('a missing activity category alone is an error and gives no result', () => {
    const r = evaluateEnergy(metric('female', 30, 165, 60, ''));
    assert.deepEqual(Object.keys(invalid(r)), ['activity']);
    assert.equal(ACTIVITY_REQUIRED_MESSAGE, 'Choose an activity category.');
  });
  it('an unknown activity value is treated as missing', () => {
    assert.equal(evaluateEnergy(metric('female', 30, 165, 60, '1.55')).status, 'invalid');
    assert.equal(evaluateEnergy(metric('female', 30, 165, 60, 'moderate')).status, 'invalid');
  });
  it('4. an invalid age is reported together with the other field errors', () => {
    const r = evaluateEnergy({ sex: 'male', age: 'x', height: '', weight: '', activity: 'active' });
    assert.deepEqual(Object.keys(invalid(r)).sort(), ['age', 'height', 'weight']);
  });
  it('height and weight limits are inclusive and just outside is rejected', () => {
    assert.equal(evaluateEnergy(metric('male', 30, 100, 20)).status, 'ok');
    assert.equal(evaluateEnergy(metric('male', 30, 250, 500)).status, 'ok');
    assert.ok(invalid(evaluateEnergy(metric('male', 30, 99.99, 70))).height);
    assert.ok(invalid(evaluateEnergy(metric('male', 30, 250.01, 70))).height);
    assert.ok(invalid(evaluateEnergy(metric('male', 30, 170, 19.99))).weight);
    assert.ok(invalid(evaluateEnergy(metric('male', 30, 170, 500.01))).weight);
  });
  it('a comma decimal separator is rejected and a decimal age is not accepted either', () => {
    assert.ok(invalid(evaluateEnergy(metric('male', 30, '175,5', '70.5'))).height);
    assert.ok(invalid(evaluateEnergy(metric('male', '30.5', 175, 70))).age);
  });
  it('sex matters: the same inputs give different REE and TEE for men and women', () => {
    const m = ok(evaluateEnergy(metric('male', 30, 170, 70)));
    const f = ok(evaluateEnergy(metric('female', 30, 170, 70)));
    assert.notEqual(m.reeDisplay, f.reeDisplay);
    assert.notEqual(m.teeDisplay, f.teeDisplay);
  });
});

describe('rounding: whole kcal/day, half up (3.6, 1.4)', () => {
  it('rounds exact halves up: 1717.5 -> 1,718, 1762.5 -> 1,763, 1598.75 -> 1,599', () => {
    assert.equal(ok(evaluateEnergy(metric('male', 28, 178, 74))).reeDisplay, '1,718');
    assert.equal(ok(evaluateEnergy(metric('male', 19, 178, 74))).reeDisplay, '1,763');
    assert.equal(ok(evaluateEnergy(metric('male', 40, 175, 70))).reeDisplay, '1,599');
  });
  it('roundKcal handles halves, values below the half and four-digit values', () => {
    assert.equal(roundKcal(2.5), 3);
    assert.equal(roundKcal(2.4999), 2);
    assert.equal(roundKcal(999.5), 1000);
    assert.equal(formatKcal(2650.23), '2,650');
    assert.equal(formatKcal(999), '999');
    assert.equal(formatKcal(1000), '1,000');
  });
  it('rounding never changes the exact values or the eligibility decision', () => {
    const r = ok(evaluateEnergy(metric('male', 28, 178, 74)));
    assert.equal(r.ree, 1717.5); // exact value is kept
    assert.equal(evaluateEnergy(metric('male', 78, 178, 74)).status, 'ok');
  });
});

describe('activity categories (3.5)', () => {
  it('lists the four approved categories with PAL ranges and no multipliers', () => {
    assert.deepEqual(ACTIVITY_CATEGORIES.map((a) => a.label), ['Inactive', 'Low Active', 'Active', 'Very Active']);
    assert.deepEqual(ACTIVITY_CATEGORIES.map((a) => a.pal), [
      'PAL 1.00 to less than 1.53',
      'PAL 1.53 to less than 1.68',
      'PAL 1.68 to less than 1.85',
      'PAL 1.85 to less than 2.50',
    ]);
    for (const a of ACTIVITY_CATEGORIES) {
      assert.ok(a.description.length > 20);
      assert.doesNotMatch(`${a.label} ${a.description} ${a.pal}`, /×|\bx ?1\.|multipl|days\/wk|per week|sedentary|moderate/i);
    }
  });
});
