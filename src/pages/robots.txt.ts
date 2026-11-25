import type { APIRoute } from 'astro';
import { INDEXING_ENABLED, SITE_URL } from '../config/site';

// Generated from the single release switch in src/config/site.ts, so robots.txt and the page meta tags can never disagree.
export const GET: APIRoute = () => {
  const body = INDEXING_ENABLED
    ? `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap-index.xml\n`
    : 'User-agent: *\nDisallow: /\n';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
