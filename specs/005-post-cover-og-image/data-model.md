# Phase 1 Data Model: Post Cover Image as Social Share Preview

**Feature**: 005-post-cover-og-image | **Date**: 2026-09-04

This feature introduces **no persisted data** and **no content-schema change**. The entities below are build-time value objects.

## Entities

### 1. `Post` (existing — unchanged)

Source: `src/content/config.ts` → `posts` collection.

| Field | Type | Used by this feature |
|-------|------|----------------------|
| `title` | `string` | preview title + `og:image:alt` |
| `description` | `string` (default `""`) | preview description, falls back to page title |
| `image` | `string` (default `""`) | **source of the preview image** |
| `lang` | `string` (default `""`) | unchanged |
| `draft` | `boolean` | drafts are excluded from build → no preview |

**No schema modification.** FR-011 forbids changing author-facing front matter.

### 2. `SiteDefaults` (existing — unchanged)

| Source | Value | Role |
|--------|-------|------|
| `astro.config.mjs` → `site` | `https://pixel-pistons.com/` | base for absolutization (FR-002) |
| `astro.config.mjs` → `base` | `/` | path prefix |
| `siteConfig.title` | string | `og:site_name` (already emitted) |
| `siteConfig.description` | string | description fallback |
| `siteConfig.banner.src` | `assets/images/back2.png` | fallback preview image (FR-004, FR-005) |

### 3. `ResolvedOgImage` (new — build-time value object)

Produced by the new resolver util, consumed by `Layout.astro`.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `url` | `string` | yes | Absolute, scheme + host + path. Never relative (SC-004). |
| `width` | `number \| undefined` | no | Known only for locally resolved images (`1200`). |
| `height` | `number \| undefined` | no | Derived from source aspect ratio; `undefined` when `width` is. |
| `alt` | `string` | yes | Page/post title; site title for non-post pages (FR-009). |

**Invariants**:
- `url` always matches `/^https?:\/\//` or `^data:`.
- `width` and `height` are either both defined or both `undefined`.
- The object is either fully formed or the whole value is `undefined` (nothing emitted).

### 4. `CoverSourceKind` (new — classification, not stored)

Derived from the raw `image` string; determines the resolution strategy.

| Kind | Matcher | Resolution | Dimensions |
|------|---------|------------|------------|
| `empty` | `""` / whitespace-only | fall back to `siteConfig.banner.src` | n/a |
| `external` | starts with `http://`, `https://`, `data:` | passthrough unchanged (FR-003) | unknown |
| `public` | starts with `/` | `new URL(url(src), Astro.site)` | unknown |
| `local` | anything else (e.g. `./cover.jpeg`, `assets/images/x.png`) | `import.meta.glob` → `getImage({ width: 1200, format: "jpeg" })` → absolutize | `1200 × derived` |

`local` sources are resolved relative to a `basePath` — the post's directory (`getDir(entry.id)`) for colocated covers, `/` for `src`-rooted paths such as the site banner. This mirrors the existing `ImageWrapper` contract exactly.

## State transitions

Single build-time resolution, no runtime state:

```text
raw `image` string
   │
   ├─ empty ─────────────► siteConfig.banner.src ──┐
   ├─ external ──────────► url as-is ──────────────┤
   ├─ public ────────────► site + base + path ─────┼─► ResolvedOgImage ─► <meta> tags
   └─ local ─────────────► glob → getImage ────────┤
            │ (miss / throw)                       │
            └─ warn ─────► siteConfig.banner.src ──┘
                                  │ (also fails)
                                  └─────────────────► undefined ─► no image tags emitted
```

## Validation rules

- **VR-001**: An emitted `og:image` MUST be absolute (FR-002, SC-004).
- **VR-002**: `og:image:width` / `og:image:height` MUST only be emitted together and only when known (FR-009).
- **VR-003**: An unresolvable local cover MUST warn and fall back, never throw (FR-004).
- **VR-004**: External covers MUST NOT be rewritten, prefixed, or transformed (FR-003).
- **VR-005**: Resolution MUST happen at build time and appear in the served HTML (FR-007).
- **VR-006**: The `banner` prop and its rendering path MUST be untouched (FR-010).

## Relationships

```text
Post.image ──┐
             ├──► resolveOgImage(src, basePath) ──► ResolvedOgImage ──► Layout <head> meta tags
SiteDefaults ┘        (fallback source)
```
