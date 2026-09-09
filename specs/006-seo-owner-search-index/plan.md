# Implementation Plan: Owner Name SEO & Full Post Indexing

**Branch**: `006-seo-owner-search-index` | **Date**: 2026-09-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-seo-owner-search-index/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Strengthen the site's SEO entity association with the owner's name variants ("Alex Argyriou", "Alexander Argyriou", "Alexandros Argyriou") and guarantee that every published blog post is crawlable, canonical, and sitemap-listed. Approach: add a sitewide `Person`/`WebSite` JSON-LD block (with `alternateName` and `sameAs` profile links) plus a canonical `<link>` tag to the shared `Layout.astro` head, extend the existing per-post `BlogPosting` JSON-LD author object with the same `alternateName`/`sameAs` data, and verify (without behavior change) that the existing draft-filtering in `getSortedPosts`/`getStaticPaths` already keeps unpublished posts out of the sitemap and out of the build entirely. No new integrations, dependencies, or routes are required — `@astrojs/sitemap` and `robots.txt.ts` already work correctly and only need the owner-identity metadata layered on top.

## Technical Context

**Framework**: Astro 5.x with Svelte integration (Fuwari template base)

**Styling**: Tailwind CSS 3.x + custom Stylus for markdown rendering

**Content**: Markdown with remark/rehype plugins (`src/plugins/`)

**Build**: Vite-based (via Astro), pnpm package manager

**Search**: Pagefind (integrated in build: `pnpm build`)

**Deployment**: Vercel (serverless edge runtime)

**Testing**: Manual validation in dev mode (`pnpm dev`), type checking (`pnpm check`), linting/formatting (Biome)

**Quality Gates**: `pnpm check`, `pnpm type-check`, `pnpm format`, `pnpm lint`, `pnpm build`

**Performance Goals**: Fast page loads (<2s), smooth transitions, mobile-responsive

**Constraints**: No breaking changes to existing Fuwari structure, minimal file modifications, configuration-first approach

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Preservation-First**: Does this feature modify core Fuwari structure?
- [x] NO modifications to existing layouts/components/styles OR justified as critical bug fix — `Layout.astro` and `experience.astro`/`education.astro` gain additive head metadata only (new JSON-LD block, new canonical link, new `alternateName`/`sameAs` fields); no existing markup, styling, or structure is removed or restructured.
- [x] Feature can be added through extension rather than modification — new owner-identity constants live in `src/constants/`, consumed by the shared layout and per-page structured data.

**Minimal Change**: Can this be achieved with fewer file changes?
- [x] Configuration changes explored before code changes — owner name variants and `sameAs` links centralized as a new constant, referenced everywhere instead of hardcoded per page.
- [x] New functionality isolated in new files — new `src/constants/seo.ts` (or similar) holds the shared Person identity data.
- [x] Existing file modifications are surgical and targeted — `Layout.astro` (head: canonical link + sitewide JSON-LD), `[...slug].astro` (author object enrichment), `experience.astro`/`education.astro` (add `alternateName` field to existing `structuredData`).
- [x] Clear rollback path identified — each change is a small, additive diff; reverting the new constants file and the few added lines fully restores prior behavior.

**Component Isolation**: Is feature properly isolated?
- [x] New components in dedicated files (src/components/ or src/plugins/) — N/A, no new UI components; new identity data isolated in `src/constants/`.
- [x] Dependencies explicitly declared — constants imported explicitly where used, no global state.
- [x] Independently testable in isolation — each page's structured data can be validated independently via view-source / Rich Results Test.
- [x] No implicit global coupling — identity constants are plain data, no side effects.

**Configuration Over Code**: Are settings configurable?
- [x] Behavior configurable via src/config.ts or astro.config.mjs — owner name/alternate names/`sameAs` links defined as typed constants, not hardcoded inline strings repeated per page.
- [x] No hardcoded magic values in component logic — existing hardcoded name strings in `experience.astro`/`education.astro` are replaced with references to the shared constant.
- [x] New constants in src/constants/ or config files — yes.
- [x] TypeScript types for all config options — a typed interface describes the owner identity shape.

**Development Validation**: Can this be validated before commit?
- [x] Testable with `pnpm dev`
- [x] Build completes with `pnpm build`
- [x] Type-safe: passes `pnpm check` and `pnpm type-check`
- [x] No breaking changes to routes/RSS/sitemap — sitemap/robots/RSS generation untouched; draft filtering already excludes unpublished posts.
- [x] Light and dark mode both supported — changes are head-only metadata, no visible UI impact.
- [x] Mobile responsive — no layout/UI changes.

## Project Structure

### Documentation (this feature)

```text
specs/006-seo-owner-search-index/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

**Astro Blog Structure** (Fuwari template - PRESERVE existing structure):

```text
src/
├── components/           # Existing components (preserve structure)
│   ├── [NEW_FEATURE]/   # New feature components go here
│   ├── control/
│   ├── misc/
│   └── widget/
├── content/             # Markdown content + schema
│   ├── config.ts       # Content collections schema
│   └── posts/          # Blog posts
├── layouts/            # Page layouts (minimal changes)
├── pages/              # Astro pages/routes (minimal changes)
├── plugins/            # Remark/rehype plugins for markdown
│   └── [new-plugin]/   # New plugins go here
├── styles/             # Global styles (avoid modifying)
├── utils/              # Utility functions
└── config.ts           # Site configuration (prefer changes here)

public/                 # Static assets
├── favicon/
└── [feature-assets]/   # New feature static files

[Root config files - modify only as needed]
astro.config.mjs        # Build config, integrations
tailwind.config.cjs     # Tailwind configuration
biome.json              # Linting/formatting
```

**Feature Addition Pattern**:
- New components → `src/components/[feature-name]/`
- New plugins → `src/plugins/[plugin-name]/`
- Configuration → `src/config.ts` (preferred) or `astro.config.mjs`
- Static assets → `public/[feature-name]/`
- Content schema changes → `src/content/config.ts`

**Minimal Change Strategy**:
- `src/constants/seo.ts` (NEW): typed `ownerIdentity` constant — canonical name, `alternateName` array (3 variants), `sameAs` profile URLs. Single source of truth reused everywhere identity data is needed.
- `src/layouts/Layout.astro` (MODIFY, surgical): add a canonical `<link rel="canonical">` tag (currently missing site-wide) and a sitewide `Person`/`WebSite` JSON-LD `<script>` block in the existing `<head>`, sourced from `ownerIdentity`. Required because this is the single shared layout rendered by every page — there is no config-only way to inject per-page `<head>` content site-wide.
- `src/pages/posts/[...slug].astro` (MODIFY, surgical): extend the existing `jsonLd.author` object with `alternateName` and `sameAs` from `ownerIdentity` (2-3 line change).
- `src/pages/experience.astro`, `src/pages/education.astro` (MODIFY, surgical): replace hardcoded name/`sameAs` literals in `structuredData` with `ownerIdentity` fields and add `alternateName`; no structural change.
- No changes needed to `astro.config.mjs`, `robots.txt.ts`, or content schema — sitemap generation and draft-exclusion (`getSortedPosts`) already satisfy FR-003/FR-004/FR-005/FR-008.

## Complexity Tracking

> No constitution violations — all changes are additive/config-driven and confined to the minimal set of shared head/metadata files. This section is not applicable.
