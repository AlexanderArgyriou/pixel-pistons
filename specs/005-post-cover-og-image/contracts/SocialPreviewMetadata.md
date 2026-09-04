# Contract: Social Share Preview Metadata

**Feature**: 005-post-cover-og-image | **Date**: 2026-09-04

Two contracts are exposed by this feature: the **HTML metadata contract** consumed by social crawlers, and the **internal prop/util contract** consumed by pages and layouts.

---

## 1. HTML Metadata Contract (external consumers: LinkedIn, X, Facebook, Slack, WhatsApp)

Emitted in `<head>` of every statically built page, alongside the existing `og:*` / `twitter:*` tags.

### Tags added

| Tag | Attribute form | Emitted when | Value |
|-----|----------------|--------------|-------|
| `og:image` | `property` | a preview image resolves | absolute URL |
| `og:image:secure_url` | `property` | resolved URL is `https:` | same as `og:image` |
| `og:image:alt` | `property` | a preview image resolves | page/post title |
| `og:image:width` | `property` | dimensions known (local images) | `1200` |
| `og:image:height` | `property` | dimensions known (local images) | derived from aspect ratio |
| `twitter:image` | `name` | a preview image resolves | same as `og:image` |
| `twitter:image:alt` | `name` | a preview image resolves | same as `og:image:alt` |

### Tags already present (unchanged)

`og:site_name`, `og:url`, `og:title`, `og:description`, `og:type`, `twitter:card` (`summary_large_image`), `twitter:url`, `twitter:title`, `twitter:description`, `description`, `author`.

### Guarantees

- **C-001**: Present in the initially served HTML — no client-side injection (FR-007).
- **C-002**: `og:image` is always absolute (`https://…`, or an unmodified external/`data:` URL) (FR-002).
- **C-003**: Post pages resolve to the post's own cover; all other pages resolve to the site banner (FR-001, FR-005).
- **C-004**: When no image can be resolved, none of the tags in the table above are emitted — no empty or placeholder values.
- **C-005**: Width/height are emitted as a pair or not at all (FR-009).

### Example — post with a colocated cover

```html
<meta property="og:type" content="article">
<meta property="og:title" content="Spec-Driven Development Guide - Pixel Pistons">
<meta property="og:image" content="https://pixel-pistons.com/_astro/spec-kit.<hash>_1200.jpeg">
<meta property="og:image:secure_url" content="https://pixel-pistons.com/_astro/spec-kit.<hash>_1200.jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Spec-Driven Development Guide">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://pixel-pistons.com/_astro/spec-kit.<hash>_1200.jpeg">
<meta name="twitter:image:alt" content="Spec-Driven Development Guide">
```

### Example — post with `image: ''` (falls back to site banner)

```html
<meta property="og:image" content="https://pixel-pistons.com/_astro/back2.<hash>_1200.jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="…">
<meta property="og:image:alt" content="Markdown Extended Features">
```

### Example — external cover (`image: 'https://cdn.example.com/x.jpg'`)

```html
<meta property="og:image" content="https://cdn.example.com/x.jpg">
<meta property="og:image:secure_url" content="https://cdn.example.com/x.jpg">
<!-- no width/height -->
```

---

## 2. Internal Contract

### 2.1 `src/utils/og-image-utils.ts` (new file)

```ts
export interface ResolvedOgImage {
  url: string;
  width?: number;
  height?: number;
}

export async function resolveOgImage(
  src: string | undefined,
  basePath: string,
  site: URL | undefined,
): Promise<ResolvedOgImage | undefined>;
```

**Behaviour**:

| Input `src` | Output |
|-------------|--------|
| `undefined` / `""` / whitespace | resolves `siteConfig.banner.src` instead |
| `https://…`, `http://…`, `data:…` | `{ url: src }` (no transform, no dimensions) |
| `/foo.png` | `{ url: <site><base>foo.png }` |
| `./cover.jpeg` (with `basePath` = post dir) | `{ url: <site>/_astro/…, width: 1200, height: <derived> }` |
| unresolvable local path | warns, retries with `siteConfig.banner.src`; `undefined` if that also fails |
| any input, `site === undefined` | `undefined` (cannot absolutize) |

**Constraints**:
- Explicit return type annotations required (`tsc --isolatedDeclarations`).
- Must never throw; all failures degrade to fallback or `undefined`.
- Build-time only; no client bundle impact.

### 2.2 `Layout.astro` props (extended)

```ts
interface Props {
  title?: string;
  banner?: string;          // unchanged — page banner only
  description?: string;
  lang?: string;
  setOGTypeArticle?: boolean;
  ogImage?: string;         // NEW: raw cover path for share preview
  ogImageBasePath?: string; // NEW: base dir for resolving a relative ogImage (default "/")
}
```

**Guarantee**: `banner` semantics are byte-for-byte unchanged, including the existing override to `siteConfig.banner.src` (FR-010).

### 2.3 `MainGridLayout.astro` props (extended)

Same two new optional props, passed straight through to `Layout.astro`. No other behaviour change.

### 2.4 Page usage

```astro
<!-- src/pages/posts/[...slug].astro -->
<MainGridLayout
  banner={entry.data.image}
  ogImage={entry.data.image}
  ogImageBasePath={getDir(entry.id)}
  ... />
```

All other pages pass nothing new and automatically receive the site-banner preview (FR-005).

---

## Non-goals

- Auto-generated title-card images for posts without a cover.
- Refreshing social platforms' cached previews.
- JSON-LD `image` property (existing TODO in the post page; separate concern).
- Per-platform image variants or aspect-ratio cropping.
