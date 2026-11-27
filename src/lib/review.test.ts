// Medical reviewer: the registry facts, the article attribution (only when the metadata confirms a review) and the structured data
// (DESIGN-SPEC.md 11.1, owner decision 2026-11-27). Nothing may be shown as reviewed by default.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { REVIEWERS, getReviewer, reviewerBiography, reviewerIds } from '../config/reviewers.ts';
import { reviewAttribution } from './review.ts';
import { articleProblems } from './article-rules.ts';
import { buildGraph, personId, personNode } from './seo.ts';

const root = new URL('../../', import.meta.url);
const read = (path: string): string => readFileSync(new URL(path, root), 'utf8');
const r = getReviewer('atta-al-jbour');

describe('registry: exactly the facts of the official profile (verified 2026-11-27)', () => {
  it('name, role, title, workplace and profile link', () => {
    assert.equal(r.name, 'Dr. Atta Mohammed Al-Jbour');
    assert.equal(r.role, 'Medical Reviewer');
    assert.equal(r.title, 'General Practitioner – Emergency');
    assert.deepEqual(r.workplace, { organisation: 'Dar Al Kamal Hospital', department: 'Emergency Department', place: 'Sharjah, United Arab Emirates' });
    assert.equal(r.profileUrl, 'https://daralkamal.ae/doctors/dr-atta-mohammed-al-jbour');
  });
  it('education, experience, licences, certifications and clinical experience', () => {
    assert.deepEqual(r.education, { degree: 'MBBS', institution: 'Sher-e-Bangla Medical College, University of Dhaka', country: 'Bangladesh', year: 2021 });
    assert.equal(r.experience.summary, 'More than four years of experience in emergency, inpatient and outpatient care in Palestine and the UAE.');
    assert.deepEqual(r.experience.previous.map((p) => `${p.place}|${p.location}|${p.period ?? ''}`), [
      'AACSH|Dubai, UAE|',
      'Nasser Medical Complex|Palestine|2022–2023',
      'Dr. Rami Clinic for Surgical Consultation|Palestine|2022–2024',
    ]);
    assert.deepEqual([...r.licences], ['Palestine', 'Dubai Health Authority (DHA)', 'Sharjah Health Authority (SHA)']);
    assert.deepEqual([...r.certifications], ['Basic Life Support (BLS)', 'Advanced Cardiac Life Support (ACLS)']);
    assert.equal(r.clinicalExperience.length, 6);
  });
  it('the biography states the verified facts and no unsupported title', () => {
    const bio = reviewerBiography(r);
    for (const fact of ['General Practitioner', 'Emergency Department', 'Dar Al Kamal Hospital', 'Sharjah', 'MBBS', 'Sher-e-Bangla Medical College', '2021', 'more than four years', 'Palestine', 'Dubai', 'BLS', 'ACLS']) {
      assert.ok(bio.toLowerCase().includes(fact.toLowerCase()), fact);
    }
  });
  it('never claims another specialty, qualification or award', () => {
    const everything = JSON.stringify(REVIEWERS) + reviewerBiography(r);
    for (const banned of ['nutritionist', 'dietitian', 'dietician', 'endocrinolog', 'obesity', 'specialist', 'consultant', 'professor', 'publication', 'board-certified', '\\bfellow']) {
      assert.doesNotMatch(everything, new RegExp(banned, 'i'), banned);
    }
    assert.doesNotMatch(everything, /\b(PhD|MD)\b/);
    assert.doesNotMatch(everything, /\bawards?\b/i); // "awarded in 2021" (the MBBS) is fine; an award is not
  });
  it('ids are exposed for the article schema', () => {
    assert.deepEqual([...reviewerIds], ['atta-al-jbour']);
  });
});

describe('article attribution: only when the metadata explicitly confirms a review', () => {
  it('no metadata, no attribution (nothing is inferred or defaulted)', () => {
    assert.equal(reviewAttribution(undefined), null);
    assert.equal(reviewAttribution(null), null);
  });
  it('an invalid date gives no attribution', () => {
    assert.equal(reviewAttribution({ reviewer: 'atta-al-jbour', reviewDate: new Date('not a date') }), null);
  });
  it('a confirmed review gives name, role, title, profile link and the real date', () => {
    const a = reviewAttribution({ reviewer: 'atta-al-jbour', reviewDate: new Date('2026-12-05') });
    assert.deepEqual(a, {
      reviewerId: 'atta-al-jbour',
      name: 'Dr. Atta Mohammed Al-Jbour',
      role: 'Medical Reviewer',
      title: 'General Practitioner – Emergency',
      profileUrl: 'https://daralkamal.ae/doctors/dr-atta-mohammed-al-jbour',
      dateIso: '2026-12-05',
    });
  });
  it('a review date in the future is a publishing problem', () => {
    const body = '## A section\n\ntext\n\n## Sources\n\n1. Author. [Title](https://example.org/x). Publisher, 2024.\n';
    const base = { slug: 'a-good-slug', body, pubDate: new Date('2026-11-01'), hasImage: false, hasImageAlt: false, now: new Date('2026-12-01') };
    assert.deepEqual(articleProblems({ ...base, reviewDate: new Date('2026-11-30') }), []);
    assert.match(articleProblems({ ...base, reviewDate: new Date('2026-12-02') }).join(' '), /reviewDate is in the future/);
    assert.deepEqual(articleProblems(base), []);
  });
  it('the phrase "medically reviewed" stays forbidden inside an article body (the template renders it, from metadata)', () => {
    const body = 'This article was medically reviewed.\n\n## Sources\n\n1. Author. [Title](https://example.org/x). Publisher, 2024.\n';
    assert.match(articleProblems({ slug: 'a-good-slug', body, pubDate: new Date('2026-11-01'), hasImage: false, hasImageAlt: false }).join(' '), /medically reviewed/);
  });
});

describe('only owner-confirmed reviews are recorded (no calculator, no other article)', () => {
  // The only article with a confirmed review, and the owner-confirmed values (2026-11-27: reviewed on 26 November 2026).
  // Adding any other file here is a deliberate decision that needs the owner's confirmation of that article's review.
  const CONFIRMED: Record<string, string> = { 'how-to-calculate-bmi-correctly.md': '2026-11-26' };
  it('only articles with an owner-confirmed review carry medicalReview metadata, with the confirmed reviewer and date', () => {
    const dir = new URL('src/content/journal/', root);
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
      const text = readFileSync(new URL(file, dir), 'utf8');
      const active = text.split('\n').filter((line) => !line.trimStart().startsWith('#')).join('\n');
      if (file in CONFIRMED) {
        assert.match(active, /medicalReview:\s*\n\s+reviewer: atta-al-jbour\s*\n\s+reviewDate: 2026-11-26\s*\n/, file);
        assert.match(active, /pubDate: 2026-11-27/, file); // the publication date stays separate from the review date
      } else {
        assert.doesNotMatch(active, /medicalReview/, file);
      }
    }
  });
  it('no calculator page shows a medical reviewer or says it was medically reviewed', () => {
    for (const page of ['bmi', 'bmr-tdee', 'body-fat']) {
      const text = read(`src/pages/calculators/${page}.astro`);
      assert.doesNotMatch(text, /MedicalReview|medically reviewed|reviewedBy|Al-Jbour/i, page);
    }
    assert.doesNotMatch(read('src/pages/calculators/index.astro'), /medically reviewed|Al-Jbour/i);
  });
  it('the About page does not claim any article or calculator has been medically reviewed', () => {
    const about = read('src/pages/about.astro');
    assert.doesNotMatch(about, /medically reviewed/i);
    assert.match(about, /only when that article records a completed review, and on a calculator only after he has reviewed and approved it/);
  });
});

describe('About page markup rules', () => {
  const about = read('src/pages/about.astro');
  it('has the "Our Medical Reviewer" section with the role label and the safe profile link', () => {
    assert.match(about, /<h2 id="reviewer-heading">Our Medical Reviewer<\/h2>/);
    assert.match(about, /View Professional Profile/);
    assert.match(about, /href=\{reviewer\.profileUrl\} target="_blank" rel="noopener noreferrer"/);
  });
  it('uses the local optimised photograph with alt text, never a hot-linked image', () => {
    assert.match(about, /import portrait from '\.\.\/assets\/team\/dr-atta-al-jbour\.webp'/);
    assert.match(about, /alt=\{reviewer\.photoAlt\}/);
    assert.doesNotMatch(about, /https?:\/\/[^"']*\.(jpe?g|png|webp)/i);
  });
  it('states that the hospital does not sponsor or endorse the site, and uses no hospital logo', () => {
    assert.match(about, /not affiliated with, and does not sponsor or endorse, BodyMetrics Lab/);
    assert.doesNotMatch(about, /logo/i);
  });
  it('keeps the owner-approved statement and the three role cards', () => {
    assert.match(about, /developed, written, and reviewed by specialists from the BodyMetrics Lab team/);
    for (const role of ['Software Development Team', 'Health Content Writers', 'Specialist Content Reviewer']) assert.ok(about.includes(role), role);
  });
});

describe('structured data', () => {
  it('Person: only displayed facts, the official profile as sameAs, no credential or specialty property', () => {
    const p = personNode('atta-al-jbour', 'https://bodymetricslab.uk/_astro/x.webp');
    assert.equal(p['@type'], 'Person');
    assert.equal(p.name, 'Dr. Atta Mohammed Al-Jbour');
    assert.equal(p.jobTitle, 'General Practitioner – Emergency');
    assert.equal(p.sameAs, 'https://daralkamal.ae/doctors/dr-atta-mohammed-al-jbour');
    assert.deepEqual(p.worksFor, { '@type': 'Organization', name: 'Dar Al Kamal Hospital' });
    for (const banned of ['hasCredential', 'medicalSpecialty', 'award', 'knowsAbout', 'aggregateRating', 'review', 'telephone', 'email', 'address']) {
      assert.equal(banned in p, false, banned);
    }
  });
  it('a page without confirmed review has no reviewedBy and no lastReviewed, and no Person', () => {
    const g = buildGraph({ pathname: '/journal/x/', title: 't', description: 'd' });
    assert.equal(JSON.stringify(g).includes('reviewedBy'), false);
    assert.equal(JSON.stringify(g).includes('lastReviewed'), false);
    assert.equal(g['@graph'].some((n) => n['@type'] === 'Person'), false);
  });
  it('a page with confirmed review references the Person and carries the real date', () => {
    const g = buildGraph({ pathname: '/journal/x/', title: 't', description: 'd', review: { reviewer: 'atta-al-jbour', date: '2026-12-05' } });
    const page = g['@graph'][0];
    assert.deepEqual(page.reviewedBy, { '@id': personId('atta-al-jbour') });
    assert.equal(page.lastReviewed, '2026-12-05');
    assert.ok(g['@graph'].some((n) => n['@type'] === 'Person' && n['@id'] === personId('atta-al-jbour')));
  });
  it('the Organization and WebSite nodes on the home page are unchanged', () => {
    const types = buildGraph({ pathname: '/', title: 'Home', description: 'd' })['@graph'].map((n) => n['@type']);
    assert.deepEqual(types, ['Organization', 'WebSite', 'WebPage']);
  });
});
