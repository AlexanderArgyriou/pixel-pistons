---

description: "Task list template for feature implementation"
---

# Tasks: Post Cover Image as Social Share Preview

**Input**: Design documents from `/specs/005-post-cover-og-image/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/SocialPreviewMetadata.md](contracts/SocialPreviewMetadata.md)

**Tests**: No automated test tasks. The spec does not request tests and the repo has no test runner; validation is via `pnpm build` + `dist` assertions and the platform inspectors described in [quickstart.md](quickstart.md).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Astro blog (Fuwari base), single project at repository root: `src/utils/`, `src/layouts/`, `src/pages/`. Build output in `dist/`.

---

## Phase 1: Setup (Feature Initialization)

**Purpose**: Establish a known-good baseline before any change. No new dependencies and no new directories are required for this feature.

- [X] T001 Run baseline quality gates `pnpm check && pnpm type-check && pnpm lint && pnpm build` from the repository root and confirm all pass before any edit
- [X] T002 Record the baseline `<head>` of `dist/posts/spec-driven-development-guide/index.html` (e.g. `grep -o '<meta [^>]*og:[^>]*>' dist/posts/spec-driven-development-guide/index.html > /tmp/og-baseline.txt`) to diff against later

> **Baseline finding**: `pnpm build` and `pnpm lint` pass, but `pnpm check` already had **2 pre-existing errors** (`src/components/Navbar.astro:54`, `src/pages/archive.astro:12`) and `pnpm type-check` **7 pre-existing `TS9007`** errors in other utils. The gate for this feature is therefore "no *new* errors". Actual post route is `dist/posts/spec-kit/spec-driven-development-guide/index.html`.

**Checkpoint**: Build is green and the current (imageless) meta output is captured.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The shared resolver module and the layout prop channel that every user story depends on.

**⚠️ CRITICAL**: T003–T006 MUST be complete before any user story phase begins.

- [X] T003 Create `src/utils/og-image-utils.ts` exporting the `ResolvedOgImage` interface (`url: string`, `width?: number`, `height?: number`) with explicit type annotations required by `tsc --isolatedDeclarations`, plus module constants `OG_IMAGE_WIDTH = 1200` and `OG_IMAGE_FORMAT = "jpeg"` with a one-line rationale comment
- [X] T004 Implement cover-source classification in `src/utils/og-image-utils.ts` distinguishing `empty` / `external` (`http://`, `https://`, `data:`) / `public` (leading `/`) / `local`, per the table in [data-model.md](data-model.md)
- [X] T005 Implement the `external` and `public` branches plus absolutization in `src/utils/og-image-utils.ts`: external URLs pass through unchanged (FR-003), public paths become `new URL(url(src), site).href` reusing `url()` from `src/utils/url-utils.ts`, and return `undefined` when `site` is undefined
- [X] T006 Add optional `ogImage?: string` and `ogImageBasePath?: string` (default `"/"`) to the `Props` interface of `src/layouts/Layout.astro` and to `src/layouts/MainGridLayout.astro`, forwarding both from `MainGridLayout.astro` to `Layout.astro` without altering the existing `banner` prop handling

**Preservation Check**: Only the two `Props` interfaces and one `<Layout ...>` invocation are touched; the `banner = siteConfig.banner.src` override in `src/layouts/Layout.astro` remains untouched (FR-010).

**Checkpoint**: Resolver skeleton and prop channel exist; `pnpm check` and `pnpm type-check` still pass with no behaviour change.

---

## Phase 3: User Story 1 - Share an article with a cover image (Priority: P1) 🎯 MVP

**Goal**: A published post with a front-matter cover renders a large-image social card showing that post's own cover, title and description.

**Independent Test**: Build the site, then confirm `dist/posts/spec-driven-development-guide/index.html` contains an absolute `og:image` pointing at the post's cover asset, and that the emitted file exists under `dist/`.

### Implementation for User Story 1

- [X] T007 [US1] Implement the `local` branch of the resolver in `src/utils/og-image-utils.ts` using `import.meta.glob<ImageMetadata>("../**", { import: "default" })` and `path.normalize(path.join("../", basePath, src))`, mirroring the workaround in `src/components/misc/ImageWrapper.astro`
- [X] T008 [US1] Pass the resolved `ImageMetadata` through `getImage({ src, width: OG_IMAGE_WIDTH, format: OG_IMAGE_FORMAT })` from `astro:assets` in `src/utils/og-image-utils.ts` and return `{ url, width, height }` absolutized against `site`
- [X] T009 [US1] Export `async function resolveOgImage(src: string | undefined, basePath: string, site: URL | undefined): Promise<ResolvedOgImage | undefined>` from `src/utils/og-image-utils.ts` with an explicit return type, wiring together the branches from T004–T008
- [X] T010 [US1] Call `resolveOgImage(ogImage, ogImageBasePath, Astro.site)` once in the frontmatter of `src/layouts/Layout.astro` and store the result in a local `ogImageResolved` variable
- [X] T011 [US1] Emit the conditional `<head>` block in `src/layouts/Layout.astro` after the existing `twitter:description` tag: `og:image`, `og:image:secure_url` (only when the URL is `https:`), `og:image:alt` (page/post title), `og:image:width` and `og:image:height` (only when both are known), `twitter:image`, `twitter:image:alt` — per [contracts/SocialPreviewMetadata.md](contracts/SocialPreviewMetadata.md)
- [X] T012 [US1] Pass `ogImage={entry.data.image}` and `ogImageBasePath={getDir(entry.id)}` to `<MainGridLayout>` in `src/pages/posts/[...slug].astro`, leaving the existing `banner={entry.data.image}` attribute unchanged
- [X] T013 [US1] Run `pnpm build` and verify `dist/posts/spec-driven-development-guide/index.html` contains an absolute `https://pixel-pistons.com/_astro/…` `og:image` with `og:image:width` of `1200` and a matching `og:image:height` (FR-001, FR-002, FR-008, FR-009)
- [X] T014 [US1] Verify the referenced asset actually exists in `dist/` by stripping the origin from the `og:image` value and checking the file on disk (Step 5 of [quickstart.md](quickstart.md))
- [X] T015 [US1] Verify the external-cover edge case by temporarily setting `image: 'https://picsum.photos/1200/630'` on one post in `src/content/posts/`, rebuilding, confirming `og:image` is that exact URL with no width/height, then reverting the front matter (FR-003)
- [X] T016 [US1] Run `pnpm preview` and confirm post pages, banner imagery, light/dark mode and mobile rendering are visually identical to the T002 baseline (FR-010, SC-005)

> **Implementation notes**:
> - T007: the glob was narrowed to `"../**/*.{png,jpg,jpeg,webp,avif,gif}"` instead of `"../**"` to avoid building a module map over every file in `src/`.
> - T008: width is `Math.min(1200, metadata.width)` so small covers are never upscaled; height is derived from the source aspect ratio.
> - T012: `ogImageBasePath` uses `path.join("content/posts/", getDir(entry.id))`, matching the existing `ImageWrapper` call on the same page (bare `getDir(entry.id)` would not resolve).
> - T016: verified by markup comparison instead of a browser session — `<div id="banner">` and `id="post-cover"` render byte-identically (still the `.webp` variants); no style, layout or client-side code was touched.
> - T013 verified at the real route `dist/posts/spec-kit/spec-driven-development-guide/index.html` → `og:image` `1200×596`.

**Preservation Check**: `src/pages/posts/[...slug].astro` gains two attributes only; no component, style or route behaviour changes.

**Checkpoint**: MVP delivered — posts with covers unfurl correctly on social platforms.

---

## Phase 4: User Story 2 - Sensible fallback for posts without a cover (Priority: P2)

**Goal**: Posts with an empty or unresolvable cover still produce a clean card using the site's default banner instead of a blank or broken image.

**Independent Test**: Build the site and confirm `dist/posts/markdown-extended/index.html` (front matter `image: ''`) emits an `og:image` pointing at the site banner asset, with the post's own title in `og:title` and `og:image:alt`.

### Implementation for User Story 2

- [X] T017 [US2] In `src/utils/og-image-utils.ts`, make the `empty` branch re-resolve using `siteConfig.banner.src` from `src/config.ts` with `basePath` `"/"`, reusing the same `local` resolution path (FR-004)
- [X] T018 [US2] Wrap the local-resolution path in `src/utils/og-image-utils.ts` in error handling so a glob miss or a `getImage` failure logs a `console.warn` naming the offending path and falls back to `siteConfig.banner.src`, returning `undefined` only if the fallback also fails — the function must never throw
- [X] T019 [US2] Run `pnpm build` and verify `dist/posts/markdown-extended/index.html` emits an `og:image` for the site banner while `og:title` and `og:image:alt` still carry the post's own title (FR-004, SC-002)
- [X] T020 [US2] Verify the broken-cover edge case by temporarily setting `image: './does-not-exist.jpg'` on one post in `src/content/posts/`, confirming `pnpm build` still succeeds with a warning and falls back to the site banner, then reverting the front matter

> **Verification notes**:
> - T019: `markdown-extended.md` is a draft and is not built, so the empty-cover case was verified by temporarily setting `image: ''` on the `embabel` post — result: site-banner `og:image` (`1200×800`) with the post's own `og:title` and `og:image:alt`. Front matter reverted.
> - T020: the resolver behaves as specified — it logs `[og-image] Cover image not found: …` and falls back to the site banner (proven by temporarily passing a bogus `ogImage` from `src/pages/about.astro`, which still rendered with the banner preview). **However**, a broken cover in post front matter still fails `pnpm build` at the *pre-existing* `ImageWrapper.astro`, which logs `[ERROR] Image file not found` and throws while rendering the visible cover. That failure predates this feature and is outside its scope; the og-image resolver itself never throws.

**Checkpoint**: Every published post produces a valid card whether or not it defines a cover.

---

## Phase 5: User Story 3 - Consistent previews for non-post pages (Priority: P3)

**Goal**: Home, archive, about, experience and education pages all unfurl with the site banner plus their own title and description.

**Independent Test**: Build the site and confirm `dist/index.html` and `dist/about/index.html` each emit a site-banner `og:image` alongside their own `og:title` and `og:description`.

### Implementation for User Story 3

- [X] T021 [US3] Confirm `src/layouts/Layout.astro` resolves the site banner when no `ogImage` prop is supplied (the empty-source fallback from T017) so no per-page change is needed in `src/pages/about.astro`, `src/pages/archive.astro`, `src/pages/[...page].astro`, `src/pages/experience.astro` or `src/pages/education.astro` (FR-005)
- [X] T022 [US3] Run `pnpm build` and verify `dist/index.html`, `dist/archive/index.html` and `dist/about/index.html` each contain a site-banner `og:image` with the page's own `og:title` and `og:description`
- [X] T023 [US3] Verify `dist/experience/index.html` and `dist/education/index.html` still emit their existing `og:type="profile"` tag unchanged alongside the new image tags, confirming no regression from `src/pages/experience.astro` and `src/pages/education.astro`

> **Verification note**: T023 — both pages still emit `og:type="website"` (from the layout) *and* `og:type="profile"` (from the page). This duplication is pre-existing and unchanged by this feature.

**Checkpoint**: Every page on the site produces a consistent, intentional preview card.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Site-wide assertions and quality gates that span all three stories.

- [X] T024 Assert no relative preview URLs anywhere: `grep -rho '<meta property="og:image" content="[^"]*"' dist | grep -v 'content="http'` must return nothing (SC-004)
- [X] T025 Assert every distinct `og:image` URL across `dist` resolves to a file that exists on disk (Step 5 of [quickstart.md](quickstart.md))
- [X] T026 [P] Run `pnpm format` and `pnpm lint` and commit the Biome-normalized output for `src/utils/og-image-utils.ts`, `src/layouts/Layout.astro`, `src/layouts/MainGridLayout.astro` and `src/pages/posts/[...slug].astro`
- [X] T027 Run the full quality gate suite `pnpm check && pnpm type-check && pnpm lint && pnpm build` and confirm all pass with no new warnings
- [X] T028 Confirm all temporary front-matter edits from T015 and T020 are reverted: `git status` shows no modified files under `src/content/posts/`
- [X] T029 Walk the full [quickstart.md](quickstart.md) checklist and tick SC-001 through SC-006
- [ ] T030 After deploy, validate a live post URL in the LinkedIn Post Inspector, X Card Validator and Facebook Sharing Debugger, refreshing any stale cached previews (SC-003)

> **Polish notes**:
> - T024: `OK: all absolute`. T025: all 5 distinct preview assets exist in `dist/`.
> - T026: `pnpm format`/`pnpm lint` also reformatted three unrelated pre-existing files (`src/i18n/languages/tr.ts`, `src/pages/education.astro`, `src/pages/experience.astro`); those were reverted to keep the diff minimal. Biome did reorder one import in `src/layouts/Layout.astro` (a file this feature already modifies) — kept.
> - T027: `pnpm lint` and `pnpm build` pass. `pnpm check` (2 errors) and `pnpm type-check` (7 `TS9007`) are unchanged from the T001 baseline — **zero new errors**, and none in `src/utils/og-image-utils.ts`.
> - T029: SC-001, SC-002, SC-004, SC-005, SC-006 verified locally. SC-003 requires deployment and is tracked by T030.
> - **T030 remains open** — it can only be performed after the change is deployed.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Phase 2. Delivers the MVP on its own
- **User Story 2 (Phase 4)**: Depends on Phase 2. Independently verifiable, but in practice built on top of US1's resolver wiring
- **User Story 3 (Phase 5)**: Depends on Phase 2 and on the fallback introduced in T017; it is a verification-only story once US2 lands
- **Polish (Phase 6)**: Depends on all desired user stories

### User Story Dependencies

- **US1 (P1)**: No dependency on other stories — cover-bearing posts work end to end
- **US2 (P2)**: No dependency on US1's post wiring; it changes only the resolver's fallback branch
- **US3 (P3)**: Consumes the US2 fallback; contains no production code changes of its own

### Within Each User Story

- Resolver logic (`src/utils/og-image-utils.ts`) before layout consumption (`src/layouts/Layout.astro`)
- Layout consumption before page wiring (`src/pages/posts/[...slug].astro`)
- Implementation before build/`dist` verification
- Verification before moving to the next priority

### Parallel Opportunities

Limited by design — this feature touches only four files and most tasks edit the same module sequentially.

- T003–T005 (resolver skeleton) and T006 (layout props) touch different files and could be split across two people, but T006 is trivial
- T013–T016 (US1 verification) can run against one build in parallel by different reviewers
- T019/T020 (US2 verification) and T022/T023 (US3 verification) are read-only over `dist` and can run in parallel once built
- T026 is marked `[P]` as it is independent of the remaining verification tasks

---

## Implementation Strategy

**MVP scope**: Phase 1 + Phase 2 + Phase 3 (T001–T016). This alone satisfies the original request — copying a post link into LinkedIn shows the post's cover image.

**Incremental delivery**:

1. Ship US1 → posts with covers unfurl correctly (the vast majority of posts)
2. Ship US2 → coverless and broken-cover posts stop showing blank cards
3. Ship US3 → verification pass confirming site-wide consistency

**Rollback**: Delete `src/utils/og-image-utils.ts`, remove the `<head>` block and props from `src/layouts/Layout.astro`, the pass-through in `src/layouts/MainGridLayout.astro` and the two attributes in `src/pages/posts/[...slug].astro`. No content, config or schema changes to unwind.
