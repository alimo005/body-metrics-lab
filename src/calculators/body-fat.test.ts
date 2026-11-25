// Reference cases F1-F8 and the validation rules of CALCULATION-SPEC.md section 4 (4.3 to 4.8).
// Expected numbers are typed from the spec tables, separately from the code under test.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BODY_FAT_COEFFICIENTS, BODY_FAT_MESSAGES, bodyFatPercent, circumferenceValue, evaluateBodyFat, ringFill } from './body-fat.ts';
import type { BodyFatEvaluation, BodyFatInput, Sex } from './body-fat.ts';

type Ok = Extract<BodyFatEvaluation, { status: 'ok' }>;
type Invalid = Extract<BodyFatEvaluation, { status: 'invalid' }>;
type Check = Extract<BodyFatEvaluation, { status: 'check' }>;

const near = (a: number, b: number, tol: number, msg = '') => assert.ok(Math.abs(a - b) <= tol, `${msg} ${a} vs ${b}`);
const ok = (r: BodyFatEvaluation): Ok => {
  assert.equal(r.status, 'ok', JSON.stringify(r));
  return r as Ok;
};

function metric(sex: Sex, height: string | number, neck: string | number, waist: string | number, hip: string | number = '', weight: string | number = ''): BodyFatInput {
  return { system: 'metric', sex, heightMain: String(height), heightInches: '', neck: String(neck), waist: String(waist), hip: String(hip), weight: String(weight) };
}
function imperial(sex: Sex, feet: number, inches: number | string, neck: string | number, waist: string | number, hip: string | number = '', weight: string | number = ''): BodyFatInput {
  return { system: 'imperial', sex, heightMain: String(feet), heightInches: String(inches), neck: String(neck), waist: String(waist), hip: String(hip), weight: String(weight) };
}

describe('F1-F4: reference cases (CALCULATION-SPEC.md 4.8)', () => {
  it('F1: man, 70.0 in, neck 15.0, waist 35.0 -> CV 20.0, 19.4291, shown 19.4', () => {
    near(circumferenceValue('male', 35, 15), 20, 1e-12);
    near(bodyFatPercent('male', 70, 15, 35), 19.4291, 5e-5);
    assert.equal(ok(evaluateBodyFat(imperial('male', 5, 10, 15, 35))).percentDisplay, '19.4');
  });
  it('F2: woman, 58.0 in, neck 13.0, waist 28.0, hip 35.5 -> CV 50.5, 27.3400, shown 27.3', () => {
    near(circumferenceValue('female', 28, 13, 35.5), 50.5, 1e-12);
    near(bodyFatPercent('female', 58, 13, 28, 35.5), 27.34, 5e-5);
    assert.equal(ok(evaluateBodyFat(imperial('female', 4, 10, 13, 28, 35.5))).percentDisplay, '27.3');
  });
  it('F3: man, 178 cm, neck 38 cm, waist 84 cm, 76 kg -> 15.6873, shown 15.7; fat 11.9 kg, lean 64.1 kg', () => {
    const r = ok(evaluateBodyFat(metric('male', 178, 38, 84, '', 76)));
    near(r.percent, 15.6873, 5e-5);
    assert.equal(r.percentDisplay, '15.7');
    assert.ok(r.mass);
    assert.equal(r.mass.unit, 'kg');
    assert.equal(r.mass.fatDisplay, '11.9');
    assert.equal(r.mass.leanDisplay, '64.1');
  });
  it('F4: woman, 165 cm, neck 32 cm, waist 72 cm, hip 98 cm -> 27.7142, shown 27.7', () => {
    const r = ok(evaluateBodyFat(metric('female', 165, 32, 72, 98)));
    near(r.percent, 27.7142, 5e-5);
    assert.equal(r.percentDisplay, '27.7');
    assert.equal(r.mass, null);
  });
});

describe('F5-F7: errors and the hip rule', () => {
  it('F5: man with waist equal to neck (CV 0) is a domain error, with no number', () => {
    const r = evaluateBodyFat(metric('male', 178, 38, 38));
    assert.equal(r.status, 'check');
    const c = r as Check;
    assert.equal(c.kind, 'domain');
    assert.equal(c.message, 'The waist measurement must be larger than the neck measurement.');
    assert.deepEqual(c.fields, ['neck', 'waist']);
  });
  it('F6: woman without a hip value gets exactly "Enter your hip measurement." and no result', () => {
    const r = evaluateBodyFat(metric('female', 165, 32, 72, ''));
    assert.equal(r.status, 'invalid');
    assert.deepEqual((r as Invalid).errors, { hip: 'Enter your hip measurement.' });
  });
  it('F7: a man with any hip value gets the same result as without (the hip is hidden, ignored and never validated)', () => {
    const without = ok(evaluateBodyFat(metric('male', 178, 38, 84)));
    for (const hip of ['98', '1', 'abc', '9999', '-5']) {
      const withHip = ok(evaluateBodyFat(metric('male', 178, 38, 84, hip)));
      assert.equal(withHip.percent, without.percent, hip);
    }
  });
  it('the female equation always includes the hip term (it differs from the hip-less version)', () => {
    const withHip = bodyFatPercent('female', 64.9606, 12.5984, 28.3465, 38.5827);
    const noHip = bodyFatPercent('female', 64.9606, 12.5984, 28.3465, 0);
    assert.ok(withHip - noHip > 10, `${withHip} vs ${noHip}`);
    // and more hip means more body fat, less neck means more body fat
    assert.ok(bodyFatPercent('female', 65, 12.6, 28.3, 40) > bodyFatPercent('female', 65, 12.6, 28.3, 38));
  });
});

describe('F8: metric and imperial give the same result', () => {
  it('F3 and F4 in metric equal the same measurements in inches and pounds within 0.01', () => {
    const m3 = ok(evaluateBodyFat(metric('male', 178, 38, 84, '', 76)));
    const i3 = ok(evaluateBodyFat(imperial('male', 5, '10.0787', '14.9606', '33.0709', '', '167.55')));
    near(m3.percent, i3.percent, 0.01);
    assert.equal(m3.percentDisplay, i3.percentDisplay);
    const m4 = ok(evaluateBodyFat(metric('female', 165, 32, 72, 98)));
    const i4 = ok(evaluateBodyFat(imperial('female', 5, '4.9606', '12.5984', '28.3465', '38.5827')));
    near(m4.percent, i4.percent, 0.01);
  });
  it('imperial mass is shown in pounds and equals the metric mass converted', () => {
    const m = ok(evaluateBodyFat(metric('male', 178, 38, 84, '', 76))).mass!;
    const i = ok(evaluateBodyFat(imperial('male', 5, '10.0787', '14.9606', '33.0709', '', '167.55'))).mass!;
    assert.equal(i.unit, 'lb');
    near(i.fat, m.fat * 2.2046226218, 0.05);
    near(i.lean, m.lean * 2.2046226218, 0.1);
  });
});

describe('coefficients, base-10 logarithms and the equation order (CALCULATION-SPEC.md 4.3)', () => {
  it('stores the approved coefficients', () => {
    assert.deepEqual({ ...BODY_FAT_COEFFICIENTS.male }, { circumference: 86.01, height: 70.041, constant: 36.76 });
    assert.deepEqual({ ...BODY_FAT_COEFFICIENTS.female }, { circumference: 163.205, height: 97.684, constant: -78.387 });
  });
  it('the constant is the result at circumference value 1 and height 1 (log10 of 1 is 0)', () => {
    near(bodyFatPercent('male', 1, 0, 1), 36.76, 1e-12);
    near(bodyFatPercent('female', 1, 0, 1, 0), -78.387, 1e-12);
  });
  it('multiplying the circumference value by 10 adds exactly its coefficient (base-10 logarithm, not natural)', () => {
    near(bodyFatPercent('male', 60, 0, 20) - bodyFatPercent('male', 60, 0, 2), 86.01, 1e-9);
    near(bodyFatPercent('female', 60, 0, 40, 10) - bodyFatPercent('female', 60, 0, 4, 1), 163.205, 1e-9);
  });
  it('multiplying the height by 10 subtracts exactly its coefficient', () => {
    near(bodyFatPercent('male', 10, 0, 20) - bodyFatPercent('male', 100, 0, 20), 70.041, 1e-9);
    near(bodyFatPercent('female', 10, 0, 40, 10) - bodyFatPercent('female', 100, 0, 40, 10), 97.684, 1e-9);
  });
  it('doubling the circumference value adds coefficient x log10(2)', () => {
    near(bodyFatPercent('male', 70, 0, 40) - bodyFatPercent('male', 70, 0, 20), 86.01 * Math.log10(2), 1e-9);
  });
  it('the spot checks of the Navy tables (4.3) are reproduced to the printed whole numbers', () => {
    assert.equal(Math.round(bodyFatPercent('male', 60, 0, 20)), 24); // 24.118
    near(bodyFatPercent('male', 60, 0, 20), 24.118, 5e-4);
    near(bodyFatPercent('male', 79.5, 0, 20), 15.558, 5e-4);
    near(bodyFatPercent('female', 58, 0, 50.5), 27.34, 5e-4);
    near(bodyFatPercent('female', 67.5, 0, 50.5), 20.905, 5e-4);
  });
  it('the men use the waist minus the neck and the women the waist plus the hip minus the neck', () => {
    assert.equal(circumferenceValue('male', 35, 15, 99), 20);
    assert.equal(circumferenceValue('female', 28, 13, 35.5), 50.5);
  });
  it('weight does not enter the percentage', () => {
    const a = ok(evaluateBodyFat(metric('male', 178, 38, 84, '', 60)));
    const b = ok(evaluateBodyFat(metric('male', 178, 38, 84, '', 140)));
    assert.equal(a.percent, b.percent);
  });
  it('men and women use different equations', () => {
    assert.notEqual(bodyFatPercent('male', 65, 14, 32), bodyFatPercent('female', 65, 14, 32, 0));
  });
});

describe('optional weight, fat mass and lean mass (4.6, decisions D7 and D9)', () => {
  it('an empty weight gives the percentage without masses', () => {
    assert.equal(ok(evaluateBodyFat(metric('male', 178, 38, 84, '', ''))).mass, null);
    assert.equal(ok(evaluateBodyFat(metric('male', 178, 38, 84, '', '   '))).mass, null);
  });
  it('a provided but invalid weight is an error and nothing is calculated', () => {
    for (const w of ['abc', '-5', '0', '19.99', '500.01']) {
      const r = evaluateBodyFat(metric('male', 178, 38, 84, '', w));
      assert.equal(r.status, 'invalid', w);
      assert.ok((r as Invalid).errors.weight, w);
    }
  });
  it('fat mass is weight x %BF / 100 and lean mass is weight - fat mass, from the exact percentage', () => {
    const r = ok(evaluateBodyFat(metric('male', 178, 38, 84, '', 76)));
    near(r.mass!.fat, (76 * r.percent) / 100, 1e-12);
    near(r.mass!.fat + r.mass!.lean, 76, 1e-12);
  });
  it('uses the UNROUNDED percentage: 500 kg at 15.6873% gives 78.4 kg, not 78.5 kg from the shown 15.7%', () => {
    const r = ok(evaluateBodyFat(metric('male', 178, 38, 84, '', 500)));
    assert.equal(r.percentDisplay, '15.7');
    assert.equal(r.mass!.fatDisplay, '78.4');
    assert.equal(r.mass!.leanDisplay, '421.6');
  });
});

describe('validation (4.5, decision D8)', () => {
  const errors = (r: BodyFatEvaluation) => (r as Invalid).errors;

  it('reports every field error together: height, neck, waist, hip (women) and weight', () => {
    const r = evaluateBodyFat(metric('female', '', '', '', '', 'x'));
    assert.deepEqual(Object.keys(errors(r)).sort(), ['height', 'hip', 'neck', 'waist', 'weight']);
    const m = evaluateBodyFat(metric('male', '', '', ''));
    assert.deepEqual(Object.keys(errors(m)).sort(), ['height', 'neck', 'waist']);
  });
  it('limits for neck, waist and hip are 10 to 250 cm, inclusive, and height 100 to 250 cm', () => {
    assert.ok(errors(evaluateBodyFat(metric('male', 178, 9.99, 84))).neck);
    assert.ok(errors(evaluateBodyFat(metric('male', 178, 38, 250.01))).waist);
    assert.ok(errors(evaluateBodyFat(metric('female', 165, 32, 72, 250.01))).hip);
    assert.ok(errors(evaluateBodyFat(metric('male', 99.99, 38, 84))).height);
    assert.ok(errors(evaluateBodyFat(metric('male', 250.01, 38, 84))).height);
    assert.equal(evaluateBodyFat(metric('male', 178, 10, 11)).status, 'check'); // accepted by the limits; fails the plausibility check
  });
  it('imperial limits are applied after conversion', () => {
    assert.ok(errors(evaluateBodyFat(imperial('male', 5, 10, '3.9', 35))).neck);
    assert.ok(errors(evaluateBodyFat(imperial('male', 3, '3.37', 15, 35))).height);
  });
  it('domain, men: waist less than or equal to neck', () => {
    for (const waist of [38, 30]) {
      const c = evaluateBodyFat(metric('male', 178, 38, waist)) as Check;
      assert.equal(c.status, 'check');
      assert.equal(c.kind, 'domain');
      assert.equal(c.message, BODY_FAT_MESSAGES.domainMale);
    }
  });
  it('domain, women: waist plus hip less than or equal to neck', () => {
    const c = evaluateBodyFat(metric('female', 165, 100, 40, 60)) as Check;
    assert.equal(c.status, 'check');
    assert.equal(c.kind, 'domain');
    assert.equal(c.message, 'The waist and hip measurements added together must be larger than the neck measurement.');
    assert.deepEqual(c.fields, ['neck', 'waist', 'hip']);
  });
  it('a woman whose waist is below her neck is fine while waist + hip is above it (the hip term decides)', () => {
    assert.equal(evaluateBodyFat(metric('female', 165, 38, 36, 110)).status, 'ok'); // waist 36 < neck 38, but waist + hip = 146 > 38
    assert.equal((evaluateBodyFat(metric('male', 165, 38, 36)) as Check).kind, 'domain');
  });
  it('implausible results (<= 0 or > 100) give the separate message and no result', () => {
    const low = evaluateBodyFat(metric('male', 178, 38, 39)) as Check; // CV 0.39 in -> negative percentage
    assert.equal(low.status, 'check');
    assert.equal(low.kind, 'implausible');
    assert.equal(low.message, BODY_FAT_MESSAGES.implausible);
    assert.deepEqual(low.fields, ['height', 'neck', 'waist']);
    // Within the input limits the men's equation cannot exceed 100 (maximum about 94.9 at 100 cm, neck 10, waist 250), so
    // the "above 100" branch is reachable only for women (waist + hip up to 500 cm).
    const highMan = evaluateBodyFat(metric('male', 100, 10, 250));
    assert.equal(highMan.status, 'ok');
    const highWoman = evaluateBodyFat(metric('female', 100, 10, 250, 250)) as Check;
    assert.equal(highWoman.kind, 'implausible');
    assert.deepEqual(highWoman.fields, ['height', 'neck', 'waist', 'hip']);
  });
  it('field errors take priority over the domain check (no check while a field is invalid)', () => {
    assert.equal(evaluateBodyFat(metric('male', 178, 38, 'x')).status, 'invalid');
    assert.equal(evaluateBodyFat(metric('male', '', 38, 38)).status, 'invalid');
  });
  it('the approved messages are exact', () => {
    assert.equal(BODY_FAT_MESSAGES.domainMale, 'The waist measurement must be larger than the neck measurement.');
    assert.equal(BODY_FAT_MESSAGES.domainFemale, 'The waist and hip measurements added together must be larger than the neck measurement.');
    assert.equal(
      BODY_FAT_MESSAGES.implausible,
      'These measurements do not give a possible body-fat percentage (0% or below, or above 100%). Check each measurement and the selected units.',
    );
  });
  it('a comma decimal separator is accepted', () => {
    assert.equal(ok(evaluateBodyFat(metric('male', '178,0', '38,0', '84,0'))).percentDisplay, '15.7');
  });
});

describe('no NaN or Infinity ever reaches a result', () => {
  it('survives 20,000 random inputs, including text and out-of-range values', () => {
    let seed = 123456789;
    const rnd = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const pick = (): string => {
      const r = rnd();
      if (r < 0.04) return '';
      if (r < 0.08) return 'abc';
      if (r < 0.1) return '-' + (rnd() * 100).toFixed(1);
      if (r < 0.12) return '0';
      return (rnd() * 300).toFixed(1);
    };
    for (let i = 0; i < 20000; i += 1) {
      const sex: Sex = rnd() < 0.5 ? 'male' : 'female';
      const system = rnd() < 0.5 ? 'metric' : 'imperial';
      const input: BodyFatInput = { system, sex, heightMain: pick(), heightInches: rnd() < 0.5 ? '' : pick(), neck: pick(), waist: pick(), hip: pick(), weight: pick() };
      const r = evaluateBodyFat(input);
      assert.ok(['invalid', 'check', 'ok'].includes(r.status));
      if (r.status === 'ok') {
        assert.ok(Number.isFinite(r.percent) && r.percent > 0 && r.percent <= 100, JSON.stringify(input));
        assert.doesNotMatch(r.percentDisplay, /NaN|Infinity/);
        if (r.mass) {
          assert.ok(Number.isFinite(r.mass.fat) && Number.isFinite(r.mass.lean));
          assert.doesNotMatch(`${r.mass.fatDisplay} ${r.mass.leanDisplay}`, /NaN|Infinity/);
        }
      }
      assert.doesNotMatch(JSON.stringify(r), /NaN|Infinity|null,"lean"/);
    }
  });
  it('the exact error cases F5 and a zero circumference value never evaluate the logarithm', () => {
    const r = evaluateBodyFat(metric('male', 178, 38, 38));
    assert.equal(r.status, 'check');
    assert.doesNotMatch(JSON.stringify(r), /NaN|Infinity/);
  });
});

describe('result ring fill (decision D3)', () => {
  it('fills from 0 to 100 percent of the circle and clamps', () => {
    assert.equal(ringFill(0), 0);
    assert.equal(ringFill(15.7), 15.7);
    assert.equal(ringFill(100), 100);
    assert.equal(ringFill(-3), 0);
    assert.equal(ringFill(130), 100);
  });
});
