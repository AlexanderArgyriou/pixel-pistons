# Phase 0 Research: Post Cover Image as Social Share Preview

**Feature**: 005-post-cover-og-image | **Date**: 2026-09-04

## Current State (verified in repo)

| Fact | Location | Note |
|------|----------|------|
| No `og:image` / `twitter:image` tag exists anywhere | [src/layouts/Layout.astro](../../src/layouts/Layout.astro) | `twitter:card` is already `summary_large_image`, so cards currently render with no image |
| `banner` prop is accepted but immediately overwritten | [src/layouts/Layout.astro](../../src/layouts/Layout.astro) | `// TODO don't use post cover as banner for now` forces `banner = siteConfig.banner.src` |
| Post page passes the cover through `banner` | [src/pages/posts/[...slug].astro](../../src/pages/posts/%5B...slug%5D.astro) | `<MainGridLayout banner={entry.data.image} ...>` |
| Cover field is `image: string` (default `""`) | [src/content/config.ts](../../src/content/config.ts) | No schema change needed |
| Covers are colocated relative paths | e.g. `image: "./cover.jpeg"` in `src/content/posts/guide/index.md` | Resolved today via `basePath={getDir(entry.id)}` in `ImageWrapper` |
| `site: "https://pixel-pistons.com/"`, `base: "/"`, `trailingSlash: "always"` | [astro.config.mjs](../../astro.config.mjs) | `Astro.site` is available for absolutization |
| Static output (no adapter configured) | [astro.config.mjs](../../astro.config.mjs) | Image optimization runs at build time and emits static files under `/_astro/` |
| JSON-LD on post page has `// TODO include cover image here` | [src/pages/posts/[...slug].astro](../../src/pages/posts/%5B...slug%5D.astro) | Out of scope for this feature's FRs, noted as a follow-up |

## Decision 1 — Add a dedicated `ogImage` prop instead of reusing `banner`

**Decision**: Add an optional `ogImage?: string` prop to `Layout.astro` and `MainGridLayout.astro`; the post page passes `entry.data.image` to it. `banner` handling is left exactly as-is.

**Rationale**: FR-010 requires the on-page banner to remain unchanged. `banner` is deliberately neutralized by an existing TODO; reusing it would couple the share preview to a decision the author made about page visuals and would resurrect the behaviour that TODO disabled.

**Alternatives considered**:
- *Remove the `banner = siteConfig.banner.src` override* — rejected: changes visible page rendering, violates FR-010 and Preservation-First.
- *Compute the cover inside `Layout.astro` by re-reading the collection* — rejected: layout would need routing knowledge and content-collection access, breaking Component Isolation.

## Decision 2 — Resolve colocated covers with `import.meta.glob` + `getImage()`

**Decision**: A new build-time helper resolves the cover to a public URL:
1. **Colocated / src-relative** (`./cover.jpeg`, `assets/images/x.png`): resolve with `import.meta.glob<ImageMetadata>` (the same workaround `ImageWrapper.astro` already uses), then pass the `ImageMetadata` through `getImage()` with an explicit width and format to obtain a deterministic emitted path plus exact width/height.
2. **Public-root** (`/foo.png`): use as-is, prefixed with the site origin. No dimensions.
3. **Absolute external** (`http(s)://…`, `data:`): pass through unchanged (FR-003). No dimensions — remote transforms would require `image.domains`/`remotePatterns` config.

**Rationale**: Colocated content images are not addressable by URL until Astro emits them; only the imported `ImageMetadata`/`getImage()` result knows the hashed `/_astro/` path. `ImageWrapper` proves the glob workaround works in this codebase and Astro version (astro 5.13.10). `getImage()` additionally supplies the width/height required by FR-009.

**Alternatives considered**:
- *Use `ImageMetadata.src` directly without `getImage()`* — simpler, but emits the original file untouched: a 4 MB cover would exceed LinkedIn's ~5 MB limit and dimensions would be whatever the author uploaded.
- *Require authors to move covers into `public/`* — rejected: breaks every existing post and the Fuwari authoring convention.
- *Generate OG images at build with a satori/canvas renderer* — rejected: explicitly out of scope per spec Assumptions and would add runtime dependencies (Constitution V).

## Decision 3 — Normalize to 1200px-wide JPEG for local images

**Decision**: `getImage({ src, width: 1200, format: "jpeg" })` for local covers (height derived from aspect ratio by Astro).

**Rationale**: LinkedIn/Facebook/X all render `summary_large_image` best around 1200px wide and none of them reliably support WebP (Astro's default output format). A fixed width also keeps file size well under platform limits regardless of the source asset.

**Alternatives considered**:
- *`png`* — larger files for photographic covers.
- *Leave format to Astro's default (`webp`)* — rejected: LinkedIn's crawler frequently drops WebP previews.
- *No width constraint* — rejected: no protection against oversized source covers (spec edge case).

## Decision 4 — Fallback chain and absolutization

**Decision**: Resolution order per page: `ogImage` prop → `siteConfig.banner.src` → nothing rendered. Any resolution failure (missing file, glob miss, `getImage` throw) is caught, logged as a warning, and falls back to the site banner (FR-004). Final URLs are produced with `new URL(path, Astro.site)` so they always carry scheme, host and `base` (FR-002, SC-004).

**Rationale**: `siteConfig.banner.src` is itself a src-relative path (`assets/images/back2.png`), so it flows through the exact same resolver — one code path, no special-casing. Failing soft keeps a bad cover path from breaking the whole build (`pnpm build` must stay green, Constitution V).

**Alternatives considered**:
- *Throw on unresolvable cover* — rejected: a typo in one post would fail deployment.
- *String concatenation for absolutization* — rejected: double-slash and `base`-prefix bugs; `new URL` is exact.

## Decision 5 — Tags to emit

**Decision**: In `Layout.astro` `<head>`, when a resolved image exists:
`og:image`, `og:image:secure_url`, `og:image:alt` (page title), `twitter:image`, `twitter:image:alt`, and `og:image:width` / `og:image:height` only when known (local images).

**Rationale**: Satisfies FR-001/008/009. `og:image:secure_url` is what LinkedIn's parser prefers when both are present. Dimensions let crawlers lay out the card before fetching the bytes; emitting guessed values for remote images would be worse than omitting them.

**Alternatives considered**:
- *`og:image:type`* — skipped: derivable by crawlers from the URL/response and adds a value that can drift from the actual transform.

## Decision 6 — Validation approach

**Decision**: Manual validation via `pnpm build` + grepping `dist/**/index.html` for `og:image`, plus platform inspectors (LinkedIn Post Inspector, X Card Validator, Facebook Sharing Debugger) after deploy. No test framework is introduced.

**Rationale**: The repo has no test runner; Constitution V defines the quality gates as `pnpm check`, `pnpm type-check`, `pnpm format`, `pnpm lint`, `pnpm build`.

## Constraints discovered

- **`pnpm type-check` runs `tsc --noEmit --isolatedDeclarations`** → every exported function in the new util MUST have an explicit return type annotation, and its exported types must be explicitly declared.
- **Dev vs build URLs differ**: in `pnpm dev`, resolved local image URLs are dev-server paths (`/@fs/…` or `/_image?…`) and are not externally fetchable. Preview validation must be done against `pnpm build && pnpm preview` or a deployed URL.
- **Social caches are sticky**: previously shared URLs keep their old (imageless) card until the platform's cache is refreshed manually — already captured as out of scope in the spec.

## Open questions

None. All spec `NEEDS CLARIFICATION` markers were resolved before planning.
