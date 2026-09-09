# Quickstart: Validating Owner Name SEO & Full Post Indexing

## Prerequisites

- `pnpm install` completed
- Local build ability: `pnpm build` (runs Astro build + Pagefind indexing)

## 1. Verify structured data locally

```bash
pnpm build
pnpm preview
```

Then, in a browser:

1. Open the homepage (`/`) → View Page Source → confirm a single `<script type="application/ld+json">` block containing `"@type": "Person"` with `"alternateName": ["Alex Argyriou", "Alexander Argyriou"]` and `"sameAs"` linking to LinkedIn/GitHub.
2. Open any post page (`/posts/<slug>/`) → View Page Source → confirm the `BlogPosting` JSON-LD's `author` object includes the same `name`/`alternateName`/`sameAs` values.
3. Open `/experience/` and `/education/` → confirm their existing `Person` JSON-LD now also includes `alternateName`.
4. Confirm every page has exactly one `<link rel="canonical" href="...">` tag pointing to its own trailing-slash URL (no duplicates between `Layout.astro` and page-level overrides).

## 2. Validate structured data with external tools

- Paste each page's JSON-LD (or the live URL, once deployed) into [Schema Markup Validator](https://validator.schema.org/) and [Google Rich Results Test](https://search.google.com/test/rich-results) — expect **zero errors**.

## 3. Verify sitemap coverage (SC-001, SC-002)

```bash
pnpm build
cat dist/sitemap-0.xml | grep -c "<url>"
```

- Compare this count to the number of published (non-draft) posts under `src/content/posts/` — they should match (plus any static pages).
- Grep for any draft-only post slugs to confirm they are absent:

```bash
grep -i "<slug-of-a-known-draft>" dist/sitemap-0.xml   # expect no output
```

- Fetch `dist/robots.txt` (or `/robots.txt` in preview) and confirm no post paths are disallowed and the sitemap index URL is present.

## 4. Post-deploy validation (SC-003, SC-004)

1. Deploy to Vercel as usual.
2. In Google Search Console (existing verified property, or newly verified for `https://pixel-pistons.com/`):
   - Submit `https://pixel-pistons.com/sitemap-index.xml`.
   - Use URL Inspection on a sample of post URLs → confirm "URL is on Google" / request indexing if not yet crawled.
3. After the next crawl cycle, check the Coverage/Pages report for the percentage of submitted URLs marked "Indexed".
4. Periodically search "Alex Argyriou", "Alexander Argyriou", "Alexandros Argyriou" on Google (incognito, no personalization) to track SERP appearance over time.

## Rollback

All changes are additive/config-driven: revert `src/constants/seo.ts` and the small diffs in `Layout.astro`, `[...slug].astro`, `experience.astro`, `education.astro` to fully restore prior behavior. No data migrations or irreversible steps are involved.
