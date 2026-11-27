// Medical reviewers: ONE registry, so the About page, the article attribution and the structured data always agree and a further
// reviewer is added in one place (DESIGN-SPEC.md 11.1, owner decision 2026-11-27).
//
// Every fact below was checked against the official hospital profile on 2026-11-27 (see `profileUrl`). Nothing is added that the
// profile does not state: no further degrees, specialist titles, awards, publications or years of experience. Adding a person here
// does NOT mark anything as reviewed: an article shows a review only through its own `medicalReview` metadata.

export interface Reviewer {
  /** Stable id used in article metadata (`medicalReview.reviewer`). */
  id: string;
  name: string;
  /** Role label on the site. */
  role: 'Medical Reviewer';
  /** Published professional title (verbatim from the official profile, with the site's dash). */
  title: string;
  workplace: { organisation: string; department: string; place: string };
  /** Official professional profile (the one external link). */
  profileUrl: string;
  education: { degree: string; institution: string; country: string; year: number };
  /** Experience as published: a summary sentence and the earlier posts. */
  experience: { summary: string; previous: Array<{ place: string; location: string; period?: string }> };
  licences: string[];
  certifications: string[];
  clinicalExperience: string[];
  /** Accessible description of the portrait (a plain description, nothing about credentials). */
  photoAlt: string;
}

export const REVIEWERS = {
  'atta-al-jbour': {
    id: 'atta-al-jbour',
    name: 'Dr. Atta Mohammed Al-Jbour',
    role: 'Medical Reviewer',
    title: 'General Practitioner – Emergency',
    workplace: { organisation: 'Dar Al Kamal Hospital', department: 'Emergency Department', place: 'Sharjah, United Arab Emirates' },
    profileUrl: 'https://daralkamal.ae/doctors/dr-atta-mohammed-al-jbour',
    education: { degree: 'MBBS', institution: 'Sher-e-Bangla Medical College, University of Dhaka', country: 'Bangladesh', year: 2021 },
    experience: {
      summary: 'More than four years of experience in emergency, inpatient and outpatient care in Palestine and the UAE.',
      previous: [
        { place: 'AACSH', location: 'Dubai, UAE' },
        { place: 'Nasser Medical Complex', location: 'Palestine', period: '2022–2023' },
        { place: 'Dr. Rami Clinic for Surgical Consultation', location: 'Palestine', period: '2022–2024' },
      ],
    },
    licences: ['Palestine', 'Dubai Health Authority (DHA)', 'Sharjah Health Authority (SHA)'],
    certifications: ['Basic Life Support (BLS)', 'Advanced Cardiac Life Support (ACLS)'],
    clinicalExperience: [
      'Emergency triage and assessment',
      'Resuscitation and stabilisation',
      'Abdominal pain assessment',
      'Fever and infection emergencies',
      'IV fluids and rehydration',
      'Wound care and suturing',
    ],
    photoAlt: 'Portrait of Dr. Atta Mohammed Al-Jbour, a bearded man wearing a white coat over dark blue scrubs',
  },
} as const satisfies Record<string, Reviewer>;

export type ReviewerId = keyof typeof REVIEWERS;
/** Tuple of ids for the content schema (`z.enum`). */
export const reviewerIds = Object.keys(REVIEWERS) as [ReviewerId, ...ReviewerId[]];

export const getReviewer = (id: ReviewerId): Reviewer => REVIEWERS[id];

/** The biography shown on the About page, written from the verified facts above (no claim beyond them). */
export function reviewerBiography(reviewer: Reviewer): string {
  const { workplace, education } = reviewer;
  return (
    `${reviewer.name} is a General Practitioner working in the ${workplace.department} at ${workplace.organisation} in Sharjah, UAE. ` +
    `He holds an ${education.degree} from ${education.institution}, ${education.country}, awarded in ${education.year}. ` +
    `With more than four years of experience in emergency, inpatient and outpatient care across Palestine and the UAE, his clinical background includes emergency assessment, patient stabilisation and acute medical care. ` +
    `He holds medical licences in Palestine, Dubai and Sharjah, and certifications in Basic Life Support (BLS) and Advanced Cardiac Life Support (ACLS).`
  );
}

/** What an article's metadata may say about a medical review. Both fields are required together; there is no default. */
export interface MedicalReviewMeta {
  reviewer: ReviewerId;
  reviewDate: Date;
}
