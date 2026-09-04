# Feature Specification: Post Cover Image as Social Share Preview

**Feature Branch**: `005-post-cover-og-image`

**Created**: 2026-09-04

**Status**: Draft

**Input**: User description: "I want to use the cover image of each post as preview image when i copy the link and use it on sites like linkedin to share an article"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Share an article with a cover image (Priority: P1)

A reader or the site author copies the URL of a blog post that has a cover image and pastes it into a social platform (LinkedIn, X/Twitter, Facebook, Slack, WhatsApp). The platform unfurls the link and shows a large preview card containing that post's cover image, the post title, and the post description.

**Why this priority**: This is the core value of the feature — without it, shared links display either a generic site banner or no image at all, reducing click-through and perceived quality.

**Independent Test**: Publish/preview a post that has a cover image, run its public URL through a link preview validator (or paste it into LinkedIn's post composer), and confirm the post cover image is rendered in the preview card.

**Acceptance Scenarios**:

1. **Given** a published post with a cover image defined in its front matter, **When** its URL is shared on a social platform, **Then** the preview card shows that post's cover image at large-card size.
2. **Given** a published post with a cover image, **When** the page source of the post is inspected, **Then** the social preview image reference is an absolute URL (including scheme and domain) pointing to the post cover image.
3. **Given** a published post with a title and description, **When** its URL is shared, **Then** the preview card title matches the post title and the preview description matches the post description.

---

### User Story 2 - Sensible fallback for posts without a cover (Priority: P2)

A reader shares a post that has no cover image defined. The preview card still looks intentional, using the site's default banner image rather than showing a blank or broken image.

**Why this priority**: Prevents regressions and broken-looking cards for the subset of posts that omit a cover, but is not required to deliver the primary value.

**Independent Test**: Share the URL of a post with an empty cover image field and confirm the preview shows the site default banner, correct title, and description.

**Acceptance Scenarios**:

1. **Given** a post with no cover image, **When** its URL is shared, **Then** the preview card shows the site's default banner image.
2. **Given** a post whose cover image reference cannot be resolved, **When** the page is built, **Then** the site falls back to the default banner image rather than emitting an unusable image reference.

---

### User Story 3 - Consistent previews for non-post pages (Priority: P3)

A visitor shares a non-post page (home, archive, about, experience, education). The preview card shows the site's default banner along with the page's own title and description, so every shared link from the site looks consistent.

**Why this priority**: Improves overall site polish and avoids mismatched cards, but the request centres on article sharing.

**Independent Test**: Share the home page and one other static page URL and confirm each preview shows the site default banner with that page's title and description.

**Acceptance Scenarios**:

1. **Given** any non-post page, **When** its URL is shared, **Then** the preview card shows the site default banner with the page's own title and description.

---

### Edge Cases

- Post cover image is a remote (externally hosted) URL rather than a local asset — the preview must use that URL as-is without prefixing the site domain.
- Post cover image is a local asset — the preview must expose a fully qualified absolute URL, since social crawlers cannot resolve relative paths.
- Site is deployed under a sub-path — image and page URLs must include the sub-path.
- Post has a cover image but no description — the preview description falls back to the site/page description rather than being empty.
- Social platform caches an older preview — the feature only guarantees correct markup; refreshing platform caches is a manual, out-of-scope step documented for the author.
- Very large or very small cover images — previews should still render; a recommended cover size is documented for authors.
- Draft posts are not published and therefore have no shareable preview.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every published post page MUST expose social preview metadata that identifies the post's own cover image as the preview image.
- **FR-002**: The preview image reference MUST be an absolute URL including scheme and host for locally hosted cover images.
- **FR-003**: When a post's cover image is already an absolute external URL, the system MUST use it unchanged.
- **FR-004**: When a post has no cover image or the cover cannot be resolved, the system MUST fall back to the site's default banner image.
- **FR-005**: Non-post pages MUST expose the site's default banner image as their preview image.
- **FR-006**: Preview metadata MUST include the page title, page description (falling back to the site description when the page has none), canonical page URL, and site name.
- **FR-007**: Preview metadata MUST be present in the initially served HTML of each page so that crawlers that do not execute scripts can read it.
- **FR-008**: The system MUST declare a large-image preview card so platforms that support it render the cover prominently.
- **FR-009**: The system MUST also expose preview image dimensions and alternative text for the preview image where the post provides a title, to improve rendering and accessibility on platforms that use them.
- **FR-010**: The visual banner shown on the post page itself MUST remain unchanged by this feature; only the shared-link preview metadata changes.
- **FR-011**: Changes MUST NOT alter existing post front matter authored by users; the existing cover image field is reused as-is.

### Key Entities *(include if feature involves data)*

- **Post**: A published article with a title, description, publish date, and an optional cover image reference. The cover image is the source of the share preview image.
- **Site Defaults**: Site title, site description, canonical site URL, and default banner image used whenever a page-level value is missing.
- **Share Preview Card**: The derived representation a social platform renders — image, title, description, canonical URL, and site name.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of published posts that define a cover image display that image when their URL is validated in a link preview inspector.
- **SC-002**: 100% of published posts without a cover image display the site default banner instead of a blank or broken image.
- **SC-003**: A post link pasted into LinkedIn, X/Twitter, and Facebook renders a large-image card with the correct title and description on all three platforms.
- **SC-004**: No preview image reference on any published page is a relative path — all are fully qualified.
- **SC-005**: The on-page appearance of every existing page is unchanged after the feature ships (visual comparison shows no differences).
- **SC-006**: An author can share a newly published post and get a correct preview with no manual steps beyond setting the cover image in front matter.

## Assumptions

- The site has a configured canonical site URL that can be used to build absolute image and page URLs.
- Posts already support an optional cover image field in front matter; no new authoring field is introduced.
- The site's existing default banner image is an acceptable fallback preview image.
- Social platforms are the primary consumers; standard Open Graph and Twitter Card conventions are sufficient and no platform-specific integrations are required.
- Automatically generating preview images for posts that lack a cover (e.g., rendered title cards) is out of scope for this feature.
- Refreshing a social platform's cached preview for previously shared URLs is a manual author action and out of scope.
- Cover images are already optimised/sized appropriately by the author; automatic resizing or cropping for preview cards is out of scope.

## Blog-Specific Constraints

**Preservation Requirements**:
- Core Fuwari template structure MUST remain unchanged
- Existing components, layouts, and styles MUST NOT be refactored
- Changes MUST be additive where possible; the shared page head is the only expected touch point

**Minimal Change Strategy**:
- Configuration changes preferred over code changes
- Metadata generation isolated so post pages pass their cover through the existing shared layout contract
- Modifications to existing files must be surgical and justified

**Technology Constraints**:
- MUST work with Astro 5.x + Svelte integration
- MUST be compatible with Tailwind CSS styling approach
- MUST work with existing build process (pnpm build includes Pagefind)
- MUST support both light and dark modes
- MUST be mobile responsive
- Metadata MUST be emitted at build time (static output), not injected client-side
