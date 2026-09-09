---

description: "Task list template for feature implementation"
---

# Tasks: Owner Name SEO & Full Post Indexing

**Input**: Design documents from `/specs/006-seo-owner-search-index/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not requested in the feature specification — no test tasks included. Validation is manual (quickstart.md) plus quality gates (`pnpm check`, `pnpm build`).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Single Astro project at repository root: `src/`, `public/`. Paths below match `plan.md`'s Project Structure.

---

## Phase 1: Setup (Feature Initialization)

**Purpose**: Prepare the single new shared constants file that all user stories depend on

- [X] T001 Create `src/constants/seo.ts` exporting a typed `ownerIdentity` constant (`name: "Alexandros Argyriou"`, `alternateName: ["Alex Argyriou", "Alexander Argyriou"]`, `sameAs: ["https://www.linkedin.com/in/alexander-argyriou/", "https://github.com/AlexanderArgyriou"]`, `url` derived from site root) with a matching `OwnerIdentity` TypeScript interface, per [data-model.md](./data-model.md)

**Checkpoint**: `ownerIdentity` constant exists and type-checks (`pnpm type-check`) — ready for use by all user stories

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No additional blocking shared infrastructure is required beyond Phase 1 — `@astrojs/sitemap`, `robots.txt.ts`, and draft-filtering in `src/utils/content-utils.ts` already satisfy the indexing requirements (confirmed in [research.md](./research.md)). This phase only verifies that baseline.

- [X] T002 Verify (no code change) that `getSortedPosts()`/`getStaticPaths()` in `src/pages/posts/[...slug].astro` exclude `draft: true` posts in production builds, by running `pnpm build` and confirming draft post slugs are absent from `dist/`

**Checkpoint**: Foundation confirmed — user story implementation can now begin

---

## Phase 3: User Story 1 - Discoverable by owner's name (Priority: P1) 🎯 MVP

**Goal**: Every page on the site carries structured data and metadata associating the owner's canonical name with all three name variants, verifiable via view-source and schema validators.

**Independent Test**: Build the site, view-source any page (homepage, a post, `/experience/`, `/education/`), and confirm a `Person` JSON-LD block with `alternateName` containing all three name variants and `sameAs` links to LinkedIn/GitHub.

### Implementation for User Story 1

- [X] T003 [US1] In `src/layouts/Layout.astro`, add a sitewide `Person` + `WebSite` JSON-LD `<script type="application/ld+json">` block in the existing `<head>`, sourced from `ownerIdentity` (imported from `src/constants/seo.ts`), per [contracts/person-website-schema.json](./contracts/person-website-schema.json)
- [X] T004 [US1] In `src/layouts/Layout.astro`, add a single `<link rel="canonical" href={...}>` tag (normalized against `Astro.url`, respecting `trailingSlash: "always"`) in the existing `<head>`
- [X] T005 [P] [US1] In `src/pages/experience.astro`, replace the hardcoded `"name": "Alexandros Argyriou"` and `"sameAs": [...]` literals in `structuredData` with values from `ownerIdentity`, and add `"alternateName": ownerIdentity.alternateName`
- [X] T006 [P] [US1] In `src/pages/education.astro`, add `"alternateName": ownerIdentity.alternateName` (and align `name`/`sameAs` fields with `ownerIdentity`, if present) to its existing `structuredData`
- [X] T007 [US1] In `src/pages/experience.astro` and `src/pages/education.astro`, remove the now-duplicate per-page `<link rel="canonical" ...>` tags in favor of the sitewide one added in T004
- [X] T008 [US1] Run `pnpm dev`, view-source the homepage, `/experience/`, and `/education/`, and confirm exactly one canonical link and one Person JSON-LD block per page with all three name variants present

**Preservation Check**: Confirm no existing markup, styling, or page structure was removed — only `<head>` metadata was added/adjusted

**Checkpoint**: User Story 1 is fully functional and independently testable — owner-identity metadata is present sitewide

---

## Phase 4: User Story 2 - All blog posts indexed and searchable (Priority: P1)

**Goal**: Confirm every published post is present in the sitemap, uncrawlable-blockers-free, and automatically kept in sync on each build — no behavior change expected, this phase is verification-only per research.md.

**Independent Test**: Run `pnpm build`, count `<url>` entries in `dist/sitemap-0.xml`, and confirm the count matches the number of non-draft posts under `src/content/posts/`, with zero draft slugs present.

### Implementation for User Story 2

- [X] T009 [US2] Run `pnpm build` and inspect `dist/sitemap-0.xml` / `dist/sitemap-index.xml` to confirm every published post URL is listed (per [quickstart.md](./quickstart.md) Section 3)
- [X] T010 [P] [US2] Inspect `dist/robots.txt` to confirm no post paths are disallowed and the sitemap index URL is referenced (no code change expected in `src/pages/robots.txt.ts`)
- [X] T011 [P] [US2] Temporarily set `draft: true` on a test post's frontmatter, rebuild, and confirm it disappears from both `dist/` routes and `dist/sitemap-0.xml`; then revert the test change
- [X] T012 [US2] Document verification outcome: if any published post is missing from the sitemap or blocked by robots.txt, identify root cause and file a follow-up fix (expected: no issues found, per research.md)

**Checkpoint**: User Story 2 confirmed — sitemap and robots.txt already satisfy full-post-indexing requirements without code changes

---

## Phase 5: User Story 3 - Consistent owner identity across posts (Priority: P2)

**Goal**: Every individual post page's structured data includes the same owner identity (name, alternate names, profile links) as the rest of the site.

**Independent Test**: View-source a sample of at least 3 different post pages and confirm identical `author.name`, `author.alternateName`, and `author.sameAs` values, matching `ownerIdentity`.

### Implementation for User Story 3

- [X] T013 [US3] In `src/pages/posts/[...slug].astro`, extend the existing `jsonLd.author` object with `alternateName: ownerIdentity.alternateName` and `sameAs: ownerIdentity.sameAs` (importing `ownerIdentity` from `src/constants/seo.ts`), per [contracts/blogposting-author-schema.json](./contracts/blogposting-author-schema.json)
- [X] T014 [US3] Run `pnpm dev`, view-source 3+ distinct post pages, and confirm the `BlogPosting.author` JSON-LD is identical (name, alternateName, sameAs) across all sampled posts

**Preservation Check**: Confirm only the `author` object within the existing `jsonLd` was extended — no other fields of the `BlogPosting` schema were altered

**Checkpoint**: All three user stories are independently functional — owner identity is consistent sitewide, on profile pages, and on every post

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across all user stories before considering the feature complete

- [X] T015 Run `pnpm check` and `pnpm type-check` to confirm no type/diagnostic errors were introduced
- [X] T016 Run `pnpm format` and `pnpm lint` (Biome) and fix any reported issues in changed files
- [X] T017 Run `pnpm build` end-to-end (confirms Pagefind indexing still completes) and re-verify `dist/sitemap-0.xml` and `dist/robots.txt` outputs
- [ ] T018 [P] Validate JSON-LD output from a sample of pages (homepage, one post, `/experience/`, `/education/`) against [Schema Markup Validator](https://validator.schema.org/) / Google Rich Results Test, per [quickstart.md](./quickstart.md) Section 2 — *requires manual submission to an external tool; not performable in this session*
- [ ] T019 Execute the remaining steps in [quickstart.md](./quickstart.md) (post-deploy Search Console submission and name-search spot checks) after the next deploy — *requires a live deploy; pending*

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately (T001)
- **Foundational (Phase 2)**: Depends on Setup completion — verification only (T002), blocks nothing further but confirms assumptions before US2 work
- **User Story 1 (Phase 3)**: Depends on Phase 1 (`ownerIdentity` constant) — no dependency on Phase 2
- **User Story 2 (Phase 4)**: Depends on Phase 2 verification baseline — independent of US1/US3 code changes
- **User Story 3 (Phase 5)**: Depends on Phase 1 (`ownerIdentity` constant) — independent of US1/US2, can run in parallel with US1
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after T001 — no dependency on US2 or US3
- **User Story 2 (P1)**: Can start after T002 — pure verification, no dependency on US1 or US3
- **User Story 3 (P2)**: Can start after T001 — no dependency on US1 or US2 (touches a different file, `[...slug].astro`)

### Within Each User Story

- T005 and T006 (US1) are `[P]` — different files (`experience.astro`, `education.astro`)
- T010 and T011 (US2) are `[P]` — independent verification checks
- Core implementation (T003, T004, T013) before manual verification tasks (T008, T014)

### Parallel Opportunities

- US1 and US3 can be implemented in parallel (different files: `Layout.astro`/`experience.astro`/`education.astro` vs. `[...slug].astro`), both depending only on T001
- US2 is pure verification and can run in parallel with US1/US3 implementation at any time after T002
- T005 + T006 in parallel; T010 + T011 in parallel; T018 can run alongside T015-T017

---

## Parallel Example: User Story 1

```bash
# After T001 (ownerIdentity constant) is done:
Task: "In src/pages/experience.astro, replace hardcoded name/sameAs with ownerIdentity, add alternateName"
Task: "In src/pages/education.astro, add alternateName from ownerIdentity to structuredData"
```

## Parallel Example: Across User Stories

```bash
# After T001 is done, these can run in parallel by different contributors:
Task: "US1 - Add sitewide Person/WebSite JSON-LD + canonical link to src/layouts/Layout.astro"
Task: "US3 - Extend BlogPosting.author JSON-LD in src/pages/posts/[...slug].astro"
# US2 verification (after T002) can run independently of both:
Task: "US2 - Verify sitemap/robots.txt coverage via pnpm build output"
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational verification (T002)
3. Complete Phase 3: User Story 1 (sitewide + profile-page owner identity)
4. Complete Phase 4: User Story 2 (confirm full-post indexing already works)
5. **STOP and VALIDATE**: Both P1 stories deliver the core stated goal — name association + full indexing
6. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational verification → ready
2. Add User Story 1 → validate via quickstart.md Section 1 → deploy (MVP!)
3. Add User Story 2 → validate via quickstart.md Section 3 → deploy
4. Add User Story 3 → validate via quickstart.md Section 1 (per-post check) → deploy
5. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- No test tasks included — not requested in spec.md; validation is manual per quickstart.md
- Total tasks: 19 (T001-T019)
