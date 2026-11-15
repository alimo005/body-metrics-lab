const $=s=>document.querySelector(s);
const icons={bmi:'<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 8a4 4 0 0 1 8 0M12 8l2-2M8 16h8"/>',tdee:'<path d="M13 2c1 6-5 6-3 11 2-1 3-3 3-5 5 4 6 6 5 9a7 7 0 0 1-13-1c-1-5 4-7 8-14Z"/>',fat:'<circle cx="12" cy="12" r="9"/><path d="m8 16 8-8"/><circle cx="8.5" cy="8.5" r="1"/><circle cx="15.5" cy="15.5" r="1"/>',ideal:'<path d="M12 3v18M5 6h14M3 13l3-7 3 7ZM15 13l3-7 3 7ZM8 21h8"/>',macros:'<circle cx="12" cy="12" r="9"/><path d="M12 3v9h9M12 12l-6 6"/>',water:'<path d="M12 2S5 10 5 15a7 7 0 0 0 14 0c0-5-7-13-7-13ZM9 15c0 2 1 3 3 3"/>',children:'<circle cx="12" cy="5" r="3"/><path d="M4 10l8 3 8-3M12 13v5m-5 4 5-4 5 4"/>'};
const icon=k=>`<span class="icon-box"><svg viewBox="0 0 24 24" aria-hidden="true">${icons[k]}</svg></span>`;
const calcs=[['bmi','BMI Calculator','Understand your weight in relation to your height.','Body mass index'],['tdee','BMR & TDEE Calculator','Find your resting energy needs and daily calorie estimate.','Mifflin–St Jeor equation'],['fat','Body Fat Calculator','Look beyond the scale with a body composition estimate.','US Navy method'],['ideal','Ideal Weight Calculator','Explore a reference weight range for your height.','BMI-based reference range'],['macros','Macro Calculator','Break your daily calories into protein, carbs and fats.','Balanced macro distribution'],['water','Water Intake Calculator','Get a simple starting point for your daily hydration.','EFSA reference intake'],['children','Children & Teens BMI','Understand BMI-for-age percentiles for growing bodies.','CDC growth charts']];
const articles=[{slug:'understanding-bmi',tag:'BODY BASICS',time:'5 min read',title:'What your BMI does (and doesn’t) tell you',desc:'A useful starting point. One part of a much bigger picture.',img:'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=900&q=85',alt:'A person running on a quiet outdoor path',body:`<p>Body mass index compares weight with height using a simple formula. It is a screening measure, and cannot describe your whole health.</p><h2>Start with the number, then add context</h2><p>For adults aged 20 and older, CDC categories use BMI below 18.5 for underweight, 18.5 to below 25 for healthy weight, 25 to below 30 for overweight, and 30 or more for obesity. These labels describe screening categories, not personal worth or a diagnosis.</p><h2>What the formula cannot see</h2><p>BMI cannot distinguish muscle from fat or show where fat is stored. Age, medical history and other measurements matter. Pregnancy and a high muscle mass can make a standard interpretation less useful. Health risks can also differ across ethnic backgrounds.</p><p>Discuss the result with a clinician in the context of your blood pressure, health history and other findings.</p><p>Source: <a href="https://www.cdc.gov/bmi/faq/index.html" target="_blank" rel="noopener">CDC: BMI frequently asked questions</a>.</p>`},
{slug:'daily-energy',tag:'NUTRITION',time:'4 min read',title:'BMR vs. TDEE: know your energy needs',desc:'Two numbers that help make sense of daily calories.',img:'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=900&q=85',alt:'A colorful bowl of vegetables and grains',body:`<p>Your body uses energy at rest and during everyday activity. Understanding this distinction makes calorie estimates easier to interpret.</p><h2>Resting energy is the foundation</h2><p>The Mifflin–St Jeor equation estimates resting energy expenditure from weight, height, age and sex. It is often labeled BMR in consumer calculators, although resting and basal measurements are not identical.</p><h2>Your day adds to the total</h2><p>TDEE is an estimate of your total daily energy expenditure. Our tool multiplies resting energy by a selected activity factor. These factors are broad approximations; your real needs vary with work, exercise and physiology.</p><p>Treat the result as a starting estimate. For a personalized nutrition plan, seek advice from a qualified professional.</p><p>Source: <a href="https://pubmed.ncbi.nlm.nih.gov/2305711/" target="_blank" rel="noopener">Mifflin et al., 1990</a>.</p>`},
{slug:'hydration',tag:'EVERYDAY WELLNESS',time:'3 min read',title:'Hydration: small habits, a healthier day',desc:'A practical guide to understanding your fluid needs.',img:'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=85',alt:'A reusable water bottle in natural light',body:`<p>Water needs vary from person to person. A reference value can help orient you, but it is not a strict drinking target.</p><h2>Food counts, too</h2><p>EFSA adequate intake values for adults are 2.0 litres for women and 2.5 litres for men per day. These values include water in food and all beverages, under moderate conditions.</p><h2>Adjust for your circumstances</h2><p>Heat, exercise, pregnancy and breastfeeding can change needs. People with kidney or heart conditions may have specific fluid limits. Follow advice from your healthcare professional.</p><p>Keep water available and pay attention to thirst. A calculator cannot assess dehydration or determine your individual treatment needs.</p><p>Source: <a href="https://www.efsa.europa.eu/en/efsajournal/pub/1459" target="_blank" rel="noopener">EFSA dietary reference values for water</a>.</p>`}];
const card=c=>`<a href="#/${c[0]}" class="calc-card ${c[0]==='bmi'?'featured':''}"><div class="card-top">${icon(c[0])}${c[0]==='bmi'?'<span class="badge">MOST POPULAR</span>':''}</div><h3>${c[1]}</h3><p>${c[2]}</p><div class="card-bottom"><span>${c[3]}</span><b aria-hidden="true">↗</b></div></a>`;
const articleCards=(heading='Latest health trends')=>`<section class="section journal-section"><div class="wrap"><div class="section-heading"><div><span class="eyebrow">THE HEALTH JOURNAL</span><h2>${heading}</h2><p>A little knowledge goes a long way. Explore our latest guides.</p></div><a class="text-link" href="#/articles">View all articles <span>↗</span></a></div><div class="article-grid">${articles.map(a=>`<a class="article-card" href="#/article/${a.slug}"><img class="article-image" src="${a.img}" alt="${a.alt}" loading="lazy"><div class="article-meta">${a.tag}<span>• &nbsp; ${a.time}</span></div><h3>${a.title}</h3><p>${a.desc}</p></a>`).join('')}</div></div></section>`;
const scale=()=>'<div class="scale" aria-hidden="true"><span></span><span></span><span></span><span></span></div><div class="scale-labels"><span>Underweight</span><span>Healthy</span><span>Overweight</span><span>Obesity</span></div>';
function home(){return `<section class="hero"><div class="wrap hero-grid"><div><span class="pill">✧ &nbsp; A LITTLE SCIENCE. A LOT OF CLARITY.</span><h1>Free accurate<br>health calculators.<br><em>For a healthier you.</em></h1><p>Understand your body, one number at a time. Simple, evidence-informed tools to help you make more confident health decisions.</p><div class="actions"><a class="btn" href="#/bmi">Calculate my BMI <span>↗</span></a><a class="btn secondary" href="#/#calculators">Explore calculators <span>↓</span></a></div><div class="micro-trust"><span>Always free</span><span>No sign-up</span><span>Private by design</span></div></div><div class="hero-demo"><div class="demo-card"><div class="demo-heading">${icon('bmi')}<span>A little insight into you</span><span class="live">● &nbsp; BMI PREVIEW</span></div><div class="demo-measures"><div>Height<strong>175 <small>cm</small></strong></div><div>Weight<strong>70 <small>kg</small></strong></div></div><div class="demo-score"><small>YOUR BODY MASS INDEX</small><div class="number">22.9</div><span class="category">Healthy weight</span><small>A starting point for understanding your body.</small></div>${scale()}<a class="demo-link" href="#/bmi">Discover your numbers &nbsp; ↗</a></div><div class="float-note"><span class="check">✓</span><span><b>Science you can see</b>Transparent formulas. Trusted sources.</span></div></div></div></section><div class="trust-strip"><div class="wrap trust-inner"><span class="trust-caption">◈ &nbsp; Informed by established science</span><div class="source-logos"><a class="source-item" href="https://www.who.int/health-topics/obesity" target="_blank" rel="noopener">◎ WHO</a><a href="https://www.cdc.gov/bmi/" target="_blank" rel="noopener">CDC</a><a class="source-item" href="https://pubmed.ncbi.nlm.nih.gov/2305711/" target="_blank" rel="noopener">⌘ <small>PEER-REVIEWED<br>RESEARCH</small></a></div><span>Independent tools. Not affiliated or endorsed.</span></div></div><section id="calculators" class="section wrap"><div class="section-heading"><div><span class="eyebrow">YOUR HEALTH, BETTER UNDERSTOOD</span><h2>Find your starting point.</h2><p>Useful numbers. Clear explanations. Choose a calculator to begin.</p></div><span class="subtle">Free. Simple. Built for you.</span></div><div class="calculator-grid">${calcs.slice(0,6).map(card).join('')}</div><a class="children-link" href="#/children">${icon('children')} Looking for a younger family member? <b>Children & teens BMI &nbsp; ↗</b></a></section>${articleCards()}<section class="wrap approach"><div><span class="eyebrow">OUR APPROACH</span><h2>Good information.<br>Better decisions.</h2></div><div class="approach-items"><div class="approach-item"><span>◎</span><strong>Grounded in science</strong>Established methods, with sources you can explore.</div><div class="approach-item"><span>♧</span><strong>Designed for real life</strong>Clear results without the information overload.</div><div class="approach-item"><span>◇</span><strong>Your numbers stay yours</strong>Calculations happen right in your browser.</div></div></section>`}
const CM_PER_INCH = 2.54;
const KG_PER_POUND = 0.45359237;
const measurements = {
  height: [100, 250, CM_PER_INCH, 'cm', 'in'],
  weight: [25, 400, KG_PER_POUND, 'kg', 'lb'],
  fatWeight: [25, 400, KG_PER_POUND, 'kg', 'lb'],
  waist: [35, 250, CM_PER_INCH, 'cm', 'in'],
  neck: [20, 80, CM_PER_INCH, 'cm', 'in'],
  hip: [40, 250, CM_PER_INCH, 'cm', 'in'],
  age: [20, 120, 1, 'years', 'years'],
  protein: [0, 100, 1, '%', '%'],
  carbs: [0, 100, 1, '%', '%'],
  fat: [0, 100, 1, '%', '%']
};
const activityLevels = {
  '1.2': 'Sedentary · little exercise',
  '1.375': 'Lightly active · 1–3 days/week',
  '1.55': 'Moderately active · 3–5 days/week',
  '1.725': 'Very active · 6–7 days/week',
  '1.9': 'Extra active · physical work & training'
};
let unit = 'metric', result = null, current = 'bmi';
const values = {
  weight: 70, height: 175, age: 30, sex: 'male', activity: '1.375',
  waist: 85, neck: 38, hip: 100, fatWeight: null, protein: 25, carbs: 45, fat: 30
};
const sources = {
  bmi: ['Body mass index: weight (kg) ÷ height (m)². Category uses the unrounded BMI.', 'CDC adult BMI categories', 'https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html'],
  ideal: ['BMI-based reference weight range: 18.5 × height (m)² to 24.9 × height (m)².', 'CDC adult BMI categories', 'https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html'],
  tdee: ['Mifflin–St Jeor: 10W + 6.25H − 5A + s (W in kg, H in cm, A in years, s = +5 male or −161 female). TDEE = resting energy × selected activity factor.', 'Mifflin et al. (1990)', 'https://pubmed.ncbi.nlm.nih.gov/2305711/'],
  fat: ['US Navy circumference method (all lengths in inches). Male: 86.010 log₁₀(abdomen − neck) − 70.041 log₁₀(height) + 36.76. Female: 163.205 log₁₀(waist + hip − neck) − 97.684 log₁₀(height) − 78.387. Fat mass = weight × body fat % ÷ 100. Fat-free mass = weight − fat mass.', 'Traditional circumference equations (AR 600–9, Table B–5)', 'https://api.army.mil/e2/c/downloads/566071.pdf'],
  macros: ['Atwater general factors: grams = daily calories × (percentage ÷ 100) ÷ kcal per gram. Use 4 kcal/g for protein and carbohydrate and 9 kcal/g for fat. Daily calories come from the Mifflin–St Jeor resting estimate × the selected activity factor.', 'USDA: Atwater general factors', 'https://fdc.nal.usda.gov/faq/'],
  water: ['EFSA adequate total water intake: 2,500 mL/day (2.5 L) for adult males and 2,000 mL/day (2.0 L) for adult females. Includes food and all beverages, in moderate conditions.', 'EFSA dietary reference values for water', 'https://www.efsa.europa.eu/en/efsajournal/pub/1459']
};
const formula = k => `<div class="formula"><b>Formula & source</b><br>${sources[k][0]}<br><a href="${sources[k][2]}" target="_blank" rel="noopener">${sources[k][1]} ↗</a>${k === 'macros' ? `<br><a href="${sources.tdee[2]}" target="_blank" rel="noopener">${sources.tdee[1]} ↗</a>` : ''}</div>`;

function input(name, label) {
  const [min, max, conversion, metricLabel, imperialLabel] = measurements[name];
  const factor = unit === 'imperial' ? conversion : 1;
  // Round converted inputs for readability. capture() retains their exact canonical values.
  const display = n => conversion === 1 ? n : Number((n / factor).toFixed(2));
  const value = values[name] === null ? '' : display(values[name]);
  return `<div class="field"><label for="${name}">${label}</label><div class="input-wrap"><input id="${name}" name="${name}" type="number" inputmode="decimal" ${name === 'fatWeight' ? '' : 'required'} min="${Math.floor(min / factor * 100) / 100}" max="${Math.ceil(max / factor * 100) / 100}" step="any" value="${value}"><span>${unit === 'imperial' ? imperialLabel : metricLabel}</span></div></div>`;
}

function fields(k) {
  if (k === 'water') return sexField();
  let out = input('height', 'Height');
  if (k !== 'ideal' && k !== 'fat') out += input('weight', 'Weight');
  if (['bmi', 'tdee', 'macros'].includes(k)) out += input('age', 'Age');
  if (k !== 'ideal') out += sexField();
  if (k === 'bmi') out += '<div class="field full"><small>For adults aged 20+. Age and sex do not change the adult BMI formula or categories.</small></div>';
  if (k === 'tdee' || k === 'macros') {
    const options = Object.entries(activityLevels).map(([factor, label]) => `<option value="${factor}" ${values.activity === factor ? 'selected' : ''}>${label}</option>`).join('');
    out += `<div class="field full"><label for="activity">Activity level</label><select id="activity" name="activity">${options}</select></div>`;
  }
  if (k === 'macros') {
    out += input('protein', 'Protein share') + input('carbs', 'Carbohydrate share') + input('fat', 'Fat share');
    out += '<div class="field full"><small>The three percentages must add up to 100%.</small></div>';
  }
  if (k === 'fat') {
    out += input('waist', values.sex === 'male' ? 'Abdomen circumference' : 'Waist circumference') + input('neck', 'Neck circumference');
    if (values.sex === 'female') out += input('hip', 'Hip circumference');
    out += input('fatWeight', 'Weight (optional)');
    out += '<div class="field full"><small>Use a level tape without compressing skin. Male: abdomen at navel. Female: natural waist and widest hip. Measure neck just below the larynx.</small><small>Enter weight to estimate fat mass and fat-free mass.</small></div>';
  }
  return out;
}

function sexField() {
  return `<div class="field"><label for="sex">Sex used by formula</label><select id="sex" name="sex"><option value="male" ${values.sex === 'male' ? 'selected' : ''}>Male</option><option value="female" ${values.sex === 'female' ? 'selected' : ''}>Female</option></select></div>`;
}

const disclaimer='<div class="notice"><span>ⓘ</span><span><b>A number is a starting point, not a diagnosis.</b> These estimates are for general education. They may not be suitable during pregnancy, for athletes, or for people with certain health conditions. A healthcare professional can help put your result in context.</span></div>';
function calculator(k){current=k;const c=calcs.find(c=>c[0]===k);return `<section class="page-head"><div class="wrap"><div class="breadcrumb"><a href="#/">Home</a> &nbsp; / &nbsp; <a href="#/#calculators">Calculators</a> &nbsp; / &nbsp; ${c[1]}</div><span class="eyebrow">A CLEARER PICTURE OF YOU</span><h1>${c[1]}</h1><p>${c[2]} ${k==='bmi'?'A simple, evidence-informed starting point for adults aged 20 and over.':'Transparent methods. Clear explanations. No sign-up required.'}</p></div></section><section class="section wrap"><div class="calc-layout"><form class="form-panel" id="calculator-form"><div class="panel-title"><h2>Your measurements</h2>${k==='water'?'':`<div class="unit-toggle" aria-label="Measurement units"><button type="button" data-unit="metric" class="${unit==='metric'?'active':''}" aria-pressed="${unit==='metric'}">Metric</button><button type="button" data-unit="imperial" class="${unit==='imperial'?'active':''}" aria-pressed="${unit==='imperial'}">Imperial</button></div>`}</div><div class="form-grid">${fields(k)}</div><div class="error" id="error" role="alert"></div><button class="btn" type="submit">${k==='bmi'?'Calculate my BMI':'Calculate my result'} <span>→</span></button><p class="form-foot">◇ &nbsp; Your measurements stay in your browser.</p></form><div id="result" aria-live="polite">${result?resultMarkup(k):`<div class="result-panel empty">${icon(k)}<h2 style="margin-top:20px">Your next insight starts here.</h2><p>Enter your details and calculate to see your result and what it means.</p><span class="tiny-label">SIMPLE INPUTS. CLEAR ANSWERS.</span></div>`}</div></div>${disclaimer}</section><section class="section wrap" style="padding-top:0"><div class="faq"><h2>${k==='bmi'?'Understanding your BMI':'Understanding your estimate'}</h2><details><summary>How is this calculated?</summary><p>${sources[k][0]}</p><p><a class="text-link" href="${sources[k][2]}" target="_blank" rel="noopener">Read the original source ↗</a></p></details><details><summary>How accurate is my result?</summary><p>The arithmetic follows the displayed formula, but individual health needs vary. These are screening or planning estimates. Measurements, body composition, ethnicity, health conditions and life stage can affect interpretation.</p></details><details><summary>Are my measurements saved?</summary><p>No. Your inputs are kept only in memory while this page is open. They are not submitted to a server or saved to browser storage.</p></details></div></section>${articleCards('A little more understanding.')}<section class="section wrap"><div class="section-heading"><div><span class="eyebrow">KEEP EXPLORING</span><h2>Other calculators</h2></div></div><div class="other-links">${calcs.filter(c=>c[0]!==k).map(c=>`<a href="#/${c[0]}">${c[1]} ↗</a>`).join('')}</div></section>`}


function capture(form) {
  for (const input of form.querySelectorAll('input[type="number"]')) {
    if (input.value === input.defaultValue && !input.validity.badInput) continue;
    const factor = unit === 'imperial' ? measurements[input.name][2] : 1;
    values[input.name] = input.value === '' ? null : input.valueAsNumber * factor;
    input.defaultValue = input.value;
  }
  for (const select of form.querySelectorAll('select')) values[select.name] = select.value;
}

function validateMeasurements(...names) {
  for (const name of names) {
    const [min, max, factor] = measurements[name];
    const value = values[name];
    // Allow only floating-point noise at a unit-converted endpoint.
    const tolerance = factor === 1 ? 0 : Number.EPSILON * max * 4;
    if (!Number.isFinite(value) || value < min - tolerance || value > max + tolerance) {
      throw Error('Please enter values within the supported ranges.');
    }
  }
}

function validateSex() {
  if (values.sex !== 'male' && values.sex !== 'female') throw Error('Select a sex for this calculation.');
}

const bmiBands = [
  [18.5, 'Underweight', '#dcecf3'],
  [25, 'Normal Weight', '#e3f0df'],
  [30, 'Overweight', '#f5e9c4'],
  [35, 'Obesity Class I', '#f1d9d3'],
  [40, 'Obesity Class II', '#f1d9d3'],
  [Infinity, 'Obesity Class III', '#f1d9d3']
];

function bmiResult() {
  validateMeasurements('weight', 'height');
  const bmi = values.weight / (values.height / 100) ** 2;
  const [upper, cat, color] = bmiBands.find(([limit]) => bmi < limit);
  let display = bmi.toFixed(1);
  if (Number(display) >= upper) display = bmi.toFixed(2);
  if (Number(display) >= upper) display = `< ${upper.toFixed(1)}`;
  return {
    n: display, cat, color, label: 'YOUR BODY MASS INDEX',
    explain: 'BMI is a screening measure of weight relative to height. It does not measure body fat or distinguish muscle from fat. Your overall health needs more context.'
  };
}

function energyResult(k) {
  validateMeasurements('weight', 'height', 'age');
  validateSex();
  if (!Object.hasOwn(activityLevels, values.activity)) throw Error('Select a valid activity level.');
  const {weight, height, age, sex, activity} = values;
  const bmr = 10 * weight + 6.25 * height - 5 * age + (sex === 'male' ? 5 : -161);
  if (bmr <= 0) throw Error('These inputs give a non-positive resting energy estimate. Check your measurements.');
  const tdee = bmr * Number(activity);
  const daily = {n: formatEnergy(tdee), label: 'ESTIMATED DAILY ENERGY · KCAL'};
  if (k === 'tdee') return {
    ...daily, cat: 'Maintenance estimate',
    details: [['Resting energy (BMR estimate)', `${formatEnergy(bmr)} kcal/day`]],
    explain: 'Daily energy is the resting estimate multiplied by your selected activity factor. Actual needs may differ.'
  };

  validateMeasurements('protein', 'carbs', 'fat');
  const {protein, carbs, fat} = values;
  if (Math.abs(protein + carbs + fat - 100) > Number.EPSILON * 100 * 4) {
    throw Error('Protein, carbohydrate and fat percentages must add up to 100%.');
  }
  return {
    ...daily, cat: 'Illustrative maintenance plan',
    details: [
      ['Protein', `${(tdee * (protein / 100) / 4).toFixed(1)} g`],
      ['Carbohydrate', `${(tdee * (carbs / 100) / 4).toFixed(1)} g`],
      ['Fat', `${(tdee * (fat / 100) / 9).toFixed(1)} g`]
    ],
    explain: 'Grams are calculated from the unrounded daily energy estimate and your selected percentages.'
  };
}

const formatEnergy = kcal => Math.round(kcal).toLocaleString('en-US');
const weightText = kg => `${(unit === 'imperial' ? kg / KG_PER_POUND : kg).toFixed(1)} ${unit === 'imperial' ? 'lb' : 'kg'}`;

function fatResult() {
  validateSex();
  validateMeasurements('height', 'waist', 'neck');
  const female = values.sex === 'female';
  if (female) validateMeasurements('hip');
  const height = values.height / CM_PER_INCH;
  const circumference = (values.waist + (female ? values.hip : 0) - values.neck) / CM_PER_INCH;
  if (circumference <= 0) throw Error('Waist (plus hip for females) must be greater than neck circumference.');
  // The female intercept of −78.387 is the published inch-based constant.
  const percent = female
    ? 163.205 * Math.log10(circumference) - 97.684 * Math.log10(height) - 78.387
    : 86.010 * Math.log10(circumference) - 70.041 * Math.log10(height) + 36.76;
  if (percent <= 0 || percent >= 100) throw Error('These measurements produce a body fat estimate outside 0–100%. Please check your measurements.');

  const details = [];
  if (values.fatWeight !== null) {
    validateMeasurements('fatWeight');
    const fatMass = values.fatWeight * percent / 100;
    details.push(['Fat mass', weightText(fatMass)], ['Fat-free mass', weightText(values.fatWeight - fatMass)]);
  }
  return {
    n: percent.toFixed(1) + '%', label: 'ESTIMATED BODY FAT', cat: 'US Navy circumference estimate', details,
    explain: 'Tape-based body fat estimates can differ from clinical measurements. Technique and body proportions affect the result. No diagnostic category is assigned.'
  };
}

function calculate(k) {
  switch (k) {
    case 'bmi': result = bmiResult(); break;
    case 'tdee':
    case 'macros': result = energyResult(k); break;
    case 'fat': result = fatResult(); break;
    case 'ideal':
      validateMeasurements('height');
      result = {
        n: range(), label: 'BMI-BASED REFERENCE WEIGHT RANGE', cat: 'A range, not a goal',
        explain: 'There is no single ideal weight for everyone. This range corresponds to adult BMI 18.5–24.9 and is not a personalized target.'
      };
      break;
    case 'water':
      validateSex();
      result = {
        n: values.sex === 'male' ? '2.5' : '2.0', label: 'LITRES · TOTAL WATER PER DAY', cat: 'Population reference value',
        details: [['Total water per day', values.sex === 'male' ? '2,500 mL' : '2,000 mL']],
        explain: 'This includes water in food and all drinks. It is not an amount to drink on top of meals. Needs vary with climate, activity and health; follow any prescribed fluid limits.'
      };
      break;
    default: throw Error('Unknown calculator.');
  }
  return result;
}

function range() {
  const heightSquared = (values.height / 100) ** 2;
  const low = weightText(18.5 * heightSquared).split(' ')[0];
  return `${low}–${weightText(24.9 * heightSquared)}`;
}

function resultMarkup(k) {
  const detailRows = (result.details || []).map(([label, value]) => `<div class="result-range"><span>${label}</span><strong>${value}</strong></div>`).join('');
  const bmiRange = k === 'bmi' ? scale() + `<div class="result-range"><span>Healthy Weight Range<br><small>For your height · BMI 18.5–24.9</small></span><strong>${range()}</strong></div>` : '';
  return `<section class="result-panel"><div class="panel-title"><h2>Your results</h2><span class="tiny-label">✓ CALCULATED</span></div><div class="tiny-label" style="text-align:center">${result.label}</div><div class="result-number" style="${k === 'ideal' ? 'font-size:36px;letter-spacing:-1px' : ''}">${result.n}</div><div class="result-category"><span class="category" style="background:${result.color || '#e3eee1'};color:#314e43">${result.cat}</span></div>${bmiRange}${detailRows}<p class="result-explain">${result.explain}</p>${formula(k)}</section>`;
}

function bindCalc() {
  const form = $('#calculator-form');
  if (!form) return;
  function refreshForm() {
    $('#app').innerHTML = calculator(current);
    bindCalc();
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    capture(form);
    try {
      calculate(current);
      $('#error').textContent = '';
      $('#result').innerHTML = resultMarkup(current);
      if (innerWidth < 761) $('#result').scrollIntoView({behavior: 'smooth', block: 'start'});
    } catch (error) {
      $('#error').textContent = error.message;
      result = null;
      $('#result').innerHTML = '';
    }
  });
  form.addEventListener('input', () => {
    $('#error').textContent = '';
    if (result) {
      result = null;
      $('#result').innerHTML = '<div class="result-panel empty"><h2>Measurements updated</h2><p>Calculate again to refresh your result.</p></div>';
    }
  });
  for (const button of form.querySelectorAll('[data-unit]')) {
    button.addEventListener('click', () => {
      if (unit === button.dataset.unit) return;
      capture(form);
      unit = button.dataset.unit;
      if (result) calculate(current);
      refreshForm();
      $(`[data-unit="${unit}"]`).focus();
    });
  }
  if (current === 'fat') $('#sex').addEventListener('change', () => {
    capture(form);
    result = null;
    refreshForm();
    $('#sex').focus();
  });
}

function prose(title,body){return `<div class="wrap"><article class="prose"><span class="eyebrow">BODYMETRICS LAB</span><h1>${title}</h1>${body}</article></div>`}
function childPage(){return prose('Children & teens BMI',`<p>Growing bodies need a different approach. For ages 2–19, BMI is interpreted using age- and sex-specific percentiles, rather than adult cutoffs.</p><aside><h2>Use the CDC percentile calculator</h2><p>The official tool reports BMI, BMI-for-age percentile and category using CDC growth charts. Accurate percentiles require the reference dataset; this site does not approximate them with adult categories.</p><a class="btn" href="https://www.cdc.gov/bmi/child-teen-calculator/" target="_blank" rel="noopener">Open CDC calculator ↗</a></aside><h2>Before you begin</h2><p>You will need age, sex, measured height and weight. Discuss a child's growth over time with their healthcare professional. A single percentile cannot determine overall health.</p>${disclaimer}<p><a href="#/bmi">For ages 20 and older, use our Adult BMI Calculator →</a></p>`)}
function route(){const path=(location.hash.slice(1)||'/').split('#')[0];result=null;$('#nav').classList.remove('open');$('.mobile-toggle').setAttribute('aria-expanded','false');$('#drop-list').classList.remove('open');$('#calc-menu').setAttribute('aria-expanded','false');let html;if(path==='/'||path==='')html=home();else if(path==='/children')html=childPage();else if(calcs.some(c=>'/'+c[0]===path))html=calculator(path.slice(1));else if(path==='/articles')html=`<section class="page-head"><div class="wrap"><span class="eyebrow">INFORMATION THAT MAKES SENSE</span><h1>The health journal.</h1><p>Clear guides to body metrics, nutrition and everyday wellbeing.</p></div></section>${articleCards('Explore our guides')}`;else if(path.startsWith('/article/')){const a=articles.find(a=>path==='/article/'+a.slug);html=a?prose(a.title,`<div class="article-meta">${a.tag} · ${a.time}</div><img class="article-image" src="${a.img}" alt="${a.alt}">${a.body}<aside><b>Put your knowledge into practice</b><p>Explore the numbers with a transparent calculator.</p><a class="btn" href="#/${a.slug==='daily-energy'?'tdee':a.slug==='hydration'?'water':'bmi'}">Try the related calculator ↗</a></aside>`)+articleCards('Keep reading'):prose('Guide not found','<p><a href="#/articles">Browse the health journal →</a></p>')}else if(path==='/about')html=prose('A clearer picture of your health.',`<p>BodyMetrics Lab makes body metrics easier to understand with free tools, transparent formulas and plain-language explanations.</p><h2>Evidence you can explore</h2><p>Our adult BMI and reference weight tools use CDC categories. Energy estimates use Mifflin–St Jeor. Body fat uses the US Navy circumference method. Water intake shows EFSA total water reference values. Macro amounts are an illustrative calorie split.</p><ul>${Object.values(sources).map(s=>`<li><a href="${s[2]}" target="_blank" rel="noopener">${s[1]}</a> — ${s[0]}</li>`).join('')}</ul><h2>Independent, with clear limits</h2><p>We are not affiliated with WHO, CDC or the authors of these formulas. Referencing their work does not imply endorsement. Content is educational and has not been individually reviewed by a clinician.</p><h2>Medical disclaimer</h2><p>Calculators provide estimates, not diagnoses or individualized care plans. BMI is one screening tool and does not directly measure body fat. Seek qualified medical guidance when interpreting your health, particularly during pregnancy, with chronic conditions, or for children.</p>`);else if(path==='/privacy')html=prose('Privacy, in plain language.',`<p>Your body measurements belong to you. Calculator values are processed in your browser and are not submitted to our server or saved in browser storage.</p><h2>What this site uses</h2><p>This site does not require accounts, use advertising trackers, or set analytics cookies. Your hosting provider may process ordinary request details such as IP address and browser information to deliver and secure the website.</p><h2>Third-party content</h2><p>Fonts load from Google Fonts and article photography loads from Unsplash. These providers receive standard request information when your browser retrieves those resources. Source links lead to independent websites with their own privacy practices.</p><h2>Contact information</h2><p>The contact page prepares an email in your chosen email app. Nothing is sent by this website. Avoid including private medical details.</p><p>Last updated: November 7, 2026.</p>`);else if(path==='/contact')html=prose('Let’s make things clearer.',`<p>Have feedback about a calculator or found an issue? Prepare a message below. This demo opens your email app so you can choose the recipient and review before sending.</p><p>We cannot provide personal medical advice. Please do not include sensitive health information.</p><form id="contact-form" class="contact-form"><div class="field"><label for="subject">Subject</label><input id="subject" required maxlength="150" placeholder="Calculator feedback"></div><div class="field"><label for="message">Your message</label><textarea id="message" required maxlength="5000" placeholder="Tell us what we could improve…"></textarea></div><button class="btn" type="submit">Prepare email draft ↗</button><p class="subtle" id="contact-status" role="status">No message is sent by this website.</p></form>`);else html=prose('Page not found','<p><a href="#/">Back to the homepage →</a></p>');$('#app').innerHTML=html;document.title=(path==='/'?'Free Health Calculators':$('#app h1')?.textContent||'Health journal')+' | BodyMetrics Lab';bindCalc();$('#contact-form')?.addEventListener('submit',e=>{e.preventDefault();location.href=`mailto:?subject=${encodeURIComponent($('#subject').value)}&body=${encodeURIComponent($('#message').value)}`;$('#contact-status').textContent='Email draft requested. Add your chosen recipient in your email app.'});if(location.hash.includes('#calculators'))setTimeout(()=>$('#calculators')?.scrollIntoView(),0);else window.scrollTo(0,0)}
$('#drop-list').innerHTML=calcs.map(c=>`<a href="#/${c[0]}">${c[1]}</a>`).join('');$('#calc-menu').addEventListener('click',()=>{const open=$('#drop-list').classList.toggle('open');$('#calc-menu').setAttribute('aria-expanded',String(open))});$('.mobile-toggle').addEventListener('click',()=>{const open=$('#nav').classList.toggle('open');$('.mobile-toggle').setAttribute('aria-expanded',String(open))});document.addEventListener('click',e=>{if(!e.target.closest('.dropdown')){$('#drop-list').classList.remove('open');$('#calc-menu').setAttribute('aria-expanded','false')}});document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('#drop-list').classList.remove('open');$('#nav').classList.remove('open');$('#calc-menu').setAttribute('aria-expanded','false');$('.mobile-toggle').setAttribute('aria-expanded','false')}});window.addEventListener('hashchange',route);route();
