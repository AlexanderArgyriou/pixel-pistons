# Quickstart: Validating Post Cover Share Previews

**Feature**: 005-post-cover-og-image | **Date**: 2026-09-04

How to verify the feature works end-to-end. See [contracts/SocialPreviewMetadata.md](contracts/SocialPreviewMetadata.md) for the exact tag contract and [data-model.md](data-model.md) for resolution rules.

## Prerequisites

- Node + pnpm, dependencies installed: `pnpm install`
- At least one post with a colocated cover (e.g. `src/content/posts/spec-kit/spec-driven-development-guide.md` → `image: ./spec-kit.jpeg`)
- At least one post with `image: ''` (e.g. `src/content/posts/markdown-extended.md`)

> Dev-server URLs for optimized images are not externally fetchable. **Do all preview validation against a production build.**

## Step 1 — Quality gates

```bash
pnpm check
pnpm type-check
pnpm lint
pnpm build
```

**Expected**: all pass. `pnpm build` completes including Pagefind indexing, with no new warnings other than intentional cover-resolution warnings (there should be none for existing posts).

## Step 2 — Verify tags in the built output

```bash
grep -o '<meta property="og:image[^>]*>' dist/posts/spec-driven-development-guide/index.html
grep -o '<meta name="twitter:image[^>]*>' dist/posts/spec-driven-development-guide/index.html
```

**Expected**: `og:image`, `og:image:secure_url`, `og:image:width` (`1200`), `og:image:height`, `og:image:alt`, `twitter:image`, `twitter:image:alt`, all with an absolute `https://pixel-pistons.com/_astro/…` URL (FR-001, FR-002, FR-008, FR-009).

## Step 3 — Verify the fallback

```bash
grep -o '<meta property="og:image"[^>]*>' dist/posts/markdown-extended/index.html
grep -o '<meta property="og:image"[^>]*>' dist/index.html
```

**Expected**: both point at the site banner asset, not a blank value (FR-004, FR-005). The post's own title still appears in `og:title`/`og:image:alt`.

## Step 4 — Assert no relative image URLs anywhere

```bash
grep -rho '<meta property="og:image" content="[^"]*"' dist | grep -v 'content="http' || echo "OK: all absolute"
```

**Expected**: `OK: all absolute` (SC-004).

## Step 5 — Confirm the referenced images actually exist

```bash
grep -rho 'og:image" content="https://pixel-pistons.com\(/[^"]*\)"' dist \
  | sed 's|.*pixel-pistons.com||; s|"$||' | sort -u \
  | while read -r p; do [ -f "dist$p" ] && echo "OK  $p" || echo "MISSING $p"; done
```

**Expected**: no `MISSING` lines.

## Step 6 — Confirm the page banner is unchanged

```bash
pnpm preview
```

Open a post, home, archive, about, experience and education pages. **Expected**: banner imagery, layout, light/dark mode and mobile rendering are identical to before the change (FR-010, SC-005). Compare against `git stash` output if unsure.

## Step 7 — Platform validation (after deploy)

Run a deployed post URL through:

- LinkedIn Post Inspector — <https://www.linkedin.com/post-inspector/>
- X Card Validator — <https://cards-dev.twitter.com/validator>
- Facebook Sharing Debugger — <https://developers.facebook.com/tools/debug/>

**Expected**: each shows a large-image card with the post cover, post title and post description (SC-003).

> Previously shared URLs may show a cached imageless card. Use each tool's "scrape again"/refresh action — this is a manual step and out of scope for the feature.

## Step 8 — Edge cases

| Case | Action | Expected |
|------|--------|----------|
| External cover | temporarily set `image: 'https://picsum.photos/1200/630'` on a post, rebuild | `og:image` is that exact URL, unmodified, no width/height (FR-003) |
| Broken cover path | set `image: './does-not-exist.jpg'`, rebuild | build succeeds, warning logged, `og:image` falls back to site banner (FR-004) |
| Public-root cover | set `image: '/logos/example.png'` (file must exist in `public/`), rebuild | `og:image` is `https://pixel-pistons.com/logos/example.png` |

Revert all temporary front-matter edits after checking.

## Success checklist

- [ ] SC-001 — every post with a cover shows that cover in previews
- [ ] SC-002 — every post without a cover shows the site banner
- [ ] SC-003 — LinkedIn, X and Facebook all render a large-image card
- [ ] SC-004 — no relative `og:image` values in `dist`
- [ ] SC-005 — no visual change to any page
- [ ] SC-006 — a new post needs only its front-matter `image` set
