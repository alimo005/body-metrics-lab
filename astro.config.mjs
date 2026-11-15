import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readFile, writeFile } from 'node:fs/promises';

// Check the rendered SEO tags so robots metadata and sitemap inclusion stay in sync.
const indexableUrls = new Set();
const collectIndexablePages = {
  name: 'bodymetrics-sitemap-indexability',
  hooks: {
    'astro:build:done': async ({ dir, pages }) => {
      indexableUrls.clear();
      for (const { pathname } of pages) {
        const relative = pathname.replace(/^\/+|\/+$/g, '');
        const file = relative === '404' ? '404.html' : [relative, 'index.html'].filter(Boolean).join('/');
        const html = await readFile(new URL(file, dir), 'utf8');
        if (/<meta name="robots" content="noindex">/i.test(html)) continue;
        const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
        if (canonical) indexableUrls.add(canonical);
      }
    },
  },
};

// The integration skips output entirely while all pages are marked noindex.
const emitEmptySitemap = {
  name: 'bodymetrics-empty-sitemap',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      if (indexableUrls.size !== 0) return;
      const xmlns = 'http://www.sitemaps.org/schemas/sitemap/0.9';
      await writeFile(new URL('sitemap-index.xml', dir), `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="${xmlns}"></sitemapindex>\n`);
      await writeFile(new URL('sitemap-0.xml', dir), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="${xmlns}"></urlset>\n`);
    },
  },
};

export default defineConfig({
  site: 'https://bodymetricslab.uk',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [collectIndexablePages, sitemap({ filter: url => indexableUrls.has(url) }), emitEmptySitemap],
  devToolbar: { enabled: false },
});
