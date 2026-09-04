# Implementation Plan: Post Cover Image as Social Share Preview

**Branch**: `005-post-cover-og-image` | **Date**: 2026-09-04 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/005-post-cover-og-image/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Shared post links currently unfurl with no image at all: `twitter:card` is already `summary_large_image`, but no `og:image` or `twitter:image` tag exists anywhere in the site. This feature emits share-preview image metadata driven by each post's existing front-matter `image` cover, falling back to the site banner for coverless posts and non-post pages.

Technical approach: a new build-time util (`src/utils/og-image-utils.ts`) classifies the cover path (empty / external / public-root / src-local), resolves src-local colocated covers via the `import.meta.glob` workaround already proven in `ImageWrapper.astro`, normalizes them through `getImage({ width: 1200, format: "jpeg" })` for cross-platform compatibility and known dimensions, and absolutizes against `Astro.site`. `Layout.astro` and `MainGridLayout.astro` gain an optional `ogImage` / `ogImageBasePath` prop pair; the post page passes `entry.data.image` plus `getDir(entry.id)`. The existing `banner` prop and its rendering are untouched, so no page changes visually.

## Technical Context

**Framework**: Astro 5.13.10 with Svelte integration (Fuwari template base)

**Styling**: Tailwind CSS 3.x + custom Stylus for markdown rendering — *not touched by this feature*

**Content**: Markdown with remark/rehype plugins (`src/plugins/`) — schema unchanged

**Build**: Vite-based (via Astro), pnpm package manager. Static output (no adapter) → images emitted to `/_astro/` at build time.

**Site**: `site: "https://pixel-pistons.com/"`, `base: "/"`, `trailingSlash: "always"`

**Search**: Pagefind (integrated in build: `pnpm build`) — unaffected

**Deployment**: Vercel (static)

**Testing**: `pnpm build` + grep assertions over `dist/**/index.html`, `pnpm preview` visual check, platform inspectors post-deploy (see [quickstart.md](quickstart.md))

**Quality Gates**: `pnpm check`, `pnpm type-check`, `pnpm format`, `pnpm lint`, `pnpm build`

**Performance Goals**: Zero runtime cost — all resolution is build-time; no new client JS. Build time increase limited to one extra 1200px JPEG transform per distinct cover.

**Constraints**: No new dependencies. `pnpm type-check` runs `tsc --noEmit --isolatedDeclarations`, so all exported util symbols need explicit type annotations. Resolution must never throw — a bad cover path must not break the build.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Preservation-First**: Does this feature modify core Fuwari structure?
- [x] NO modifications to existing layouts/components/styles OR justified as critical bug fix — three surgical additions only: two optional props threaded through `MainGridLayout.astro` → `Layout.astro`, a `<head>` meta block, and two props on the post page. No existing behaviour is altered or removed.
- [x] Feature can be added through extension rather than modification — all logic lives in a new util file; layouts only consume it.

**Minimal Change**: Can this be achieved with fewer file changes?
- [x] Configuration changes explored before code changes — rejected: OG tags must be per-page and derived from post data; `src/config.ts` cannot express this. Config is still used as the fallback source (`siteConfig.banner.src`).
- [x] New functionality isolated in new files — `src/utils/og-image-utils.ts`
- [x] Existing file modifications are surgical and targeted — 4 files, additive edits only (see Minimal Change Strategy below)
- [x] Clear rollback path identified — delete the new util, the `<head>` block, and the new props; nothing else depends on them.

**Component Isolation**: Is feature properly isolated?
- [x] New components in dedicated files (src/components/ or src/plugins/) — util in `src/utils/`, consistent with existing `url-utils.ts` / `content-utils.ts`; no new component is warranted for `<head>` metadata
- [x] Dependencies explicitly declared — `astro:assets` (`getImage`), `siteConfig`, `url-utils`
- [x] Independently testable in isolation — the resolver is a pure async function over `(src, basePath, site)`; verifiable per cover-kind via the quickstart edge-case table
- [x] No implicit global coupling — no shared mutable state; `Astro.site` is passed in as an argument rather than read ambiently

**Configuration Over Code**: Are settings configurable?
- [x] Behavior configurable via src/config.ts or astro.config.mjs — fallback image is `siteConfig.banner.src`; site origin and base come from `astro.config.mjs`
- [x] No hardcoded magic values in component logic — `1200` width and `"jpeg"` format are named constants in the util, documented with rationale
- [x] New constants in src/constants/ or config files — kept in the util as module-level named constants (single consumer; widening to `src/constants/constants.ts` adds blast radius for no benefit)
- [x] TypeScript types for all config options — `ResolvedOgImage` interface exported with explicit annotations

**Development Validation**: Can this be validated before commit?
- [x] Testable with `pnpm dev` (tags visible in page source; note optimized URLs differ in dev)
- [x] Build completes with `pnpm build`
- [x] Type-safe: passes `pnpm check` and `pnpm type-check`
- [x] No breaking changes to routes/RSS/sitemap — `<head>` additions only
- [x] Light and dark mode both supported — no visual change at all
- [x] Mobile responsive — no visual change at all

**Result**: PASS (pre-Phase 0). **Re-check after Phase 1 design**: PASS — the design added no files beyond the single util and no new dependencies; the answers above already reflect the Phase 1 design.

## Project Structure

### Documentation (this feature)

```text
specs/005-post-cover-og-image/
├── plan.md                            # This file (/speckit.plan command output)
├── spec.md                            # Feature specification
├── research.md                        # Phase 0 output
├── data-model.md                      # Phase 1 output
├── quickstart.md                      # Phase 1 output
├── checklists/
│   └── requirements.md                # Spec quality checklist
├── contracts/
│   └── SocialPreviewMetadata.md       # Phase 1 output
└── tasks.md                           # Phase 2 output (/speckit.tasks — NOT created by /speckit.plan)
```

### Source Code (repository root)

**Astro Blog Structure** (Fuwari template - PRESERVE existing structure):

```text
src/
├── utils/
│   ├── og-image-utils.ts        # NEW — cover → absolute preview image resolver
│   ├── url-utils.ts             # unchanged (reused: url(), getDir())
│   └── content-utils.ts         # unchanged
├── layouts/
│   ├── Layout.astro             # MODIFIED — new optional props + <head> meta block
│   └── MainGridLayout.astro     # MODIFIED — pass-through of the two new props
├── pages/
│   └── posts/
│       └── [...slug].astro      # MODIFIED — pass entry.data.image + getDir(entry.id)
├── components/                  # unchanged
├── content/config.ts            # unchanged (FR-011)
├── styles/                      # unchanged
└── config.ts                    # unchanged (read-only use of siteConfig.banner.src)

public/                          # unchanged
astro.config.mjs                 # unchanged
```

**Minimal Change Strategy**:

| File | Change | Why config-only isn't sufficient |
|------|--------|----------------------------------|
| `src/utils/og-image-utils.ts` | **NEW** | Colocated content images have no URL until Astro emits them; resolution requires build-time `import.meta.glob` + `getImage`. Isolated here so layouts stay declarative. |
| `src/layouts/Layout.astro` | Add `ogImage`/`ogImageBasePath` to `Props`, resolve once, emit 7 conditional `<head>` tags | `<head>` is defined only here; there is no extension point. `banner` handling — including the existing `banner = siteConfig.banner.src` override — is left exactly as-is (FR-010). |
| `src/layouts/MainGridLayout.astro` | Add the two props to `Props` and forward them | Post pages render through this layout, not `Layout` directly. Pure pass-through, no logic. |
| `src/pages/posts/[...slug].astro` | Pass `ogImage={entry.data.image}` and `ogImageBasePath={getDir(entry.id)}` | Only the page has access to the entry and its directory. `getDir` is already imported here. |

Rollback = revert 4 files; no data migration, no config flag left behind.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. All Constitution Check items pass; the table below is intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |

## Follow-ups (out of scope, noted during planning)

- `src/pages/posts/[...slug].astro` JSON-LD carries `// TODO include cover image here`; the resolver introduced here would make that a one-line addition, but no FR in this spec covers it.
- `src/layouts/Layout.astro` retains `// TODO don't use post cover as banner for now`. This feature deliberately does not resolve that TODO.
