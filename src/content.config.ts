// Journal content collection (DESIGN-SPEC.md 9.3). One Markdown file per article in src/content/journal/; the file name is the slug.
// Adding a file is all that is needed: the article page, the listing and its pagination, the home page, the sitemap and the
// related-calculator banner are generated from it. Extra checks (Sources section, reserved slug, trust phrases) are in src/lib/journal.ts.
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { calculatorSlugs } from './config/site';
import { reviewerIds } from './config/reviewers';

const journal = defineCollection({
  // Files whose name starts with "_" (the template and the readme) are ignored, so they never become articles.
  loader: glob({ pattern: '[!_]*.md', base: './src/content/journal' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string().min(10).max(120),
        description: z.string().min(50).max(200),
        pubDate: z.coerce.date(),
        updatedDate: z.coerce.date().optional(),
        /** Optional until a licensed image is approved; without one the article shows a neutral illustration. */
        image: image().optional(),
        imageAlt: z.string().min(10).optional(),
        /** One of the active (Version 1) calculators only. */
        relatedCalculator: z.enum(calculatorSlugs),
        draft: z.boolean().default(false),
        /**
         * OPTIONAL medical-review attribution. Leave it out unless the article has really been reviewed: it is the ONLY thing that makes
         * an article show "Medically reviewed by ...". `reviewer` is an id from src/config/reviewers.ts; `reviewDate` is the real review date.
         */
        medicalReview: z.object({ reviewer: z.enum(reviewerIds), reviewDate: z.coerce.date() }).optional(),
      })
      .refine((data) => !data.image || Boolean(data.imageAlt), { message: 'imageAlt is required when image is set', path: ['imageAlt'] }),
});

export const collections = { journal };
