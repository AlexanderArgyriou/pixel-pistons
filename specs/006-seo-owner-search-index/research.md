# Research: Owner Name SEO & Full Post Indexing

## Unknowns Resolved

All items in the feature spec's Technical Context were determinable from the existing codebase; no items required external research beyond inspecting current implementation.

### Decision: Centralize owner identity data

- **Decision**: Introduce a single typed constant (`ownerIdentity`) in `src/constants/` holding the canonical name ("Alexandros Argyriou"), the `alternateName` array (["Alex Argyriou", "Alexander Argyriou"]), and `sameAs` profile links (LinkedIn, GitHub).
- **Rationale**: `experience.astro` and `education.astro` already hardcode the canonical name and `sameAs` links inline; `[...slug].astro`'s `BlogPosting.author` and `Layout.astro` have no owner-identity JSON-LD at all. A single source of truth avoids drift between pages (violates FR-010 otherwise) and satisfies the Configuration Over Code principle.
- **Alternatives considered**: Hardcoding the three name variants separately in each file — rejected because it risks inconsistent spelling/format across pages, which directly undermines the entity-association goal (FR-010).

### Decision: Add sitewide Person/WebSite JSON-LD in the shared Layout

- **Decision**: Inject a `Person` (with `alternateName`, `sameAs`) plus `WebSite` JSON-LD block into `Layout.astro`'s `<head>`, rendered on every page (home, posts, archive, about, experience, education).
- **Rationale**: Only `experience.astro` and `education.astro` currently carry a `Person` schema. The homepage and all post pages — the pages most likely to be found via a name search — have no entity association. Centralizing in `Layout.astro` guarantees every page (including all future pages) carries the identity signal without per-page duplication.
- **Alternatives considered**: Adding the schema only to the homepage — rejected because post pages are the highest-traffic, most-indexed content and need the same signal (User Story 3); duplicating the JSON-LD block per page — rejected as it violates Minimal Change / DRY and risks drift (same issue as above).

### Decision: Add a canonical `<link>` tag in Layout.astro

- **Decision**: Add `<link rel="canonical" href={Astro.url}>` (normalized, trailing-slash consistent with `trailingSlash: "always"` in `astro.config.mjs`) to `Layout.astro`.
- **Rationale**: No canonical tag currently exists anywhere in the site. Without it, search engines may treat query-string or trailing-slash variants as separate/duplicate pages, diluting indexing signal (FR-007).
- **Alternatives considered**: Per-page canonical tags (already partially done ad-hoc in `experience.astro`/`education.astro` using `Astro.site + "experience/"`) — superseded by the sitewide version in `Layout.astro`, so the duplicate per-page canonical links in those two files should be removed to avoid conflicting/duplicate canonical tags.

### Decision: Confirm existing draft/sitemap/robots behavior needs no changes

- **Decision**: No changes to `astro.config.mjs` (`@astrojs/sitemap` integration), `robots.txt.ts`, or `src/content/config.ts`.
- **Rationale**: Verified in code:
  - `getSortedPosts()` / `getStaticPaths()` in `[...slug].astro` filter `data.draft !== true` when `import.meta.env.PROD`, so draft posts are never built as static pages in production and therefore can never appear in the sitemap (satisfies FR-005).
  - `@astrojs/sitemap` auto-discovers all built static routes at build time, so every published post automatically appears in `sitemap-0.xml` with no manual maintenance (satisfies FR-003, FR-008).
  - `robots.txt.ts` only disallows `/_astro/` (build assets) and references the sitemap index; no post paths are blocked (satisfies FR-004).
  - No `noindex` meta tag or `X-Robots-Tag` header exists anywhere in the codebase (satisfies FR-004).
- **Alternatives considered**: Adding a custom sitemap filter — rejected as unnecessary; the existing build-time exclusion of drafts already achieves the same outcome with zero extra code.

### Decision: Extend per-post BlogPosting author, not the whole schema

- **Decision**: In `[...slug].astro`, extend only the existing `jsonLd.author` object with `alternateName` and `sameAs` fields sourced from `ownerIdentity`; leave the rest of the `BlogPosting` schema unchanged.
- **Rationale**: Minimal, surgical diff; satisfies FR-006 (consistent author identity across all posts) without restructuring the existing, working JSON-LD block.
- **Alternatives considered**: Replacing `BlogPosting` with a more elaborate schema — rejected as out of scope and riskier than a targeted field addition.

## Summary

No open unknowns remain. All decisions favor centralizing owner-identity data in one new constants file and layering it additively onto existing JSON-LD/meta output in the shared layout and the three pages that already carry Person-like schema, with zero changes to sitemap/robots/build configuration since existing behavior already satisfies the indexing requirements.
