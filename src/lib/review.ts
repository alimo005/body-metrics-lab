// Medical-review attribution for a page (an article now; a calculator later, only after its content has really been reviewed).
// Pure functions, unit-tested. An attribution exists ONLY when the page's own metadata names a reviewer and a review date;
// there is no default and nothing is inferred, so no article or draft can be shown as reviewed by accident.
import { getReviewer } from '../config/reviewers.ts';
import type { MedicalReviewMeta, ReviewerId } from '../config/reviewers.ts';

export interface ReviewAttribution {
  reviewerId: ReviewerId;
  /** "Dr. Atta Mohammed Al-Jbour" */
  name: string;
  /** "Medical Reviewer" */
  role: string;
  /** "General Practitioner – Emergency" */
  title: string;
  profileUrl: string;
  /** Review date, YYYY-MM-DD (UTC). */
  dateIso: string;
}

/** The attribution to display, or null when the metadata does not confirm a review. */
export function reviewAttribution(meta: MedicalReviewMeta | undefined | null): ReviewAttribution | null {
  if (!meta) return null;
  const reviewer = getReviewer(meta.reviewer);
  if (Number.isNaN(meta.reviewDate.getTime())) return null;
  return {
    reviewerId: meta.reviewer,
    name: reviewer.name,
    role: reviewer.role,
    title: reviewer.title,
    profileUrl: reviewer.profileUrl,
    dateIso: meta.reviewDate.toISOString().slice(0, 10),
  };
}
