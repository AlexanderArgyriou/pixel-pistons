# Feature Specification: Owner Name SEO & Full Post Indexing

**Feature Branch**: `006-seo-owner-search-index`

**Created**: 2026-09-09

**Status**: Draft

**Input**: User description: "i want this site to be associated on seo with the owner search name "alex argyriou" or "alexander argyriou" or "alexandros argyriou" apart from that i want all of the posts indexed on search engines like google and available for searching"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Discoverable by owner's name (Priority: P1)

A recruiter, colleague, or potential client searches Google for "Alex Argyriou", "Alexander Argyriou", or "Alexandros Argyriou" and expects to find this site among the top results, with a search result snippet that clearly identifies the site as belonging to that person.

**Why this priority**: This is the primary stated goal — personal brand association is the main driver of the request and has the highest business value (professional visibility, networking, job opportunities).

**Independent Test**: Can be tested by inspecting page metadata/structured data for all three name variants, validating with Google's Rich Results Test / URL Inspection tool, and confirming (post-indexing) that a search for each name variant surfaces the site.

**Acceptance Scenarios**:

1. **Given** the site's homepage source, **When** metadata and structured data are inspected, **Then** all three name variants ("Alex Argyriou", "Alexander Argyriou", "Alexandros Argyriou") appear as recognized alternate names associated with the site owner.
2. **Given** a search engine crawls the site, **When** it parses the Person/WebSite structured data, **Then** it can associate the entity with all three name variants via `alternateName` or equivalent fields.
3. **Given** a user searches "Alex Argyriou" (or the other variants) on Google after indexing, **When** results are returned, **Then** this site appears with a title/description referencing the owner's name.

---

### User Story 2 - All blog posts indexed and searchable (Priority: P1)

A visitor searches a topic covered in one of the blog posts (or searches directly for a post title) and expects to find that specific post page indexed and returned by search engines like Google.

**Why this priority**: Equally critical to the request — content that isn't indexed provides zero SEO value regardless of how well the owner's name is associated with the site.

**Independent Test**: Can be tested by confirming every published post URL is present in the sitemap, is not blocked by robots rules, returns a 200 status with indexable meta tags, and by using Google Search Console's URL Inspection / coverage report to confirm indexing.

**Acceptance Scenarios**:

1. **Given** the list of all published posts, **When** the generated sitemap is inspected, **Then** every published post URL is present in the sitemap.
2. **Given** any published post page, **When** its HTML head is inspected, **Then** it does not contain a `noindex` directive and robots.txt does not disallow crawling of the post path.
3. **Given** a new post is published, **When** the site is next rebuilt/deployed, **Then** the new post automatically appears in the sitemap without manual steps.
4. **Given** a submitted sitemap in Google Search Console, **When** Google crawls the site, **Then** the coverage report shows published posts as "Indexed", not "Excluded" or "Discovered - currently not indexed" due to site-side blockers.

---

### User Story 3 - Consistent owner identity across posts (Priority: P2)

A search engine or reader viewing any individual post sees consistent author identification (name and, where available, profile links) so that all posts are attributed to the same recognizable owner identity, reinforcing the name-association goal at the content level, not just the homepage.

**Why this priority**: Strengthens and scales User Story 1 across every content page, but the site is still functional and partially achieves the goal without it.

**Independent Test**: Can be tested by inspecting structured data / byline on a sample of post pages and confirming consistent author name and linked profile data.

**Acceptance Scenarios**:

1. **Given** any individual post page, **When** its structured data is inspected, **Then** it includes an `author` entity referencing the site owner's canonical name and profile links.
2. **Given** multiple posts, **When** their author metadata is compared, **Then** the referenced owner identity (name spelling, profile URLs) is consistent across all of them.

### Edge Cases

- What happens when a post is marked as draft or unpublished? It MUST be excluded from the sitemap and marked non-indexable so it does not compete with or dilute indexing of published content.
- How does the system handle a post that is later deleted or unpublished after having been indexed? It MUST return an appropriate non-200 status or noindex signal so search engines can deprecate the stale entry.
- How are name variants disambiguated from other people with similar names? Structured data MUST tie the name variants to the owner's verified profile links (e.g., LinkedIn, GitHub) to reduce ambiguity.
- What happens if search engines have already indexed old/incorrect metadata? Existing tags must be corrected so future re-crawls overwrite prior snippets (full re-indexing timing is outside the site's control).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The site MUST expose structured data (e.g., Person/WebSite schema) that associates the owner's canonical name with the alternate name variants "Alex Argyriou", "Alexander Argyriou", and "Alexandros Argyriou".
- **FR-002**: The homepage and key entity pages (e.g., About/Experience/Education) MUST reference the owner's name in visible page titles, meta descriptions, and structured data, using the canonical name plus alternate names.
- **FR-003**: The system MUST generate and maintain an up-to-date sitemap that includes every published blog post URL.
- **FR-004**: Every published post page MUST be crawlable and indexable: it MUST NOT emit a `noindex` meta tag or header, and MUST NOT be disallowed by robots.txt.
- **FR-005**: Draft or unpublished posts MUST be excluded from the sitemap and MUST NOT be indexable.
- **FR-006**: Every individual post page MUST include author/byline metadata (visible and in structured data) identifying the site owner consistently across all posts.
- **FR-007**: The site MUST provide canonical URLs for all post pages to prevent duplicate-content indexing issues.
- **FR-008**: The sitemap MUST update automatically on each site build/deploy without requiring manual edits when posts are added, removed, or changed.
- **FR-009**: The system MUST link the owner's structured data to external verifying profiles (e.g., LinkedIn, GitHub) via `sameAs` (or equivalent) to strengthen name-entity association and disambiguation.
- **FR-010**: Page titles and meta descriptions across the site MUST NOT contradict each other regarding the owner's name spelling/format, to avoid diluting the entity association.

### Key Entities

- **Site Owner (Person entity)**: Represents the individual the site is about; attributes include canonical name, alternate names (the three variants), and links to verifying external profiles.
- **Blog Post**: Represents a published article; attributes include URL, publish/draft status, title, author reference, and canonical URL, all of which affect its search-engine indexability.
- **Sitemap**: Represents the machine-readable listing of indexable URLs used by search engines to discover site content.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of published blog posts are present in the site's sitemap at any time after a deploy.
- **SC-002**: 100% of published blog posts return no `noindex` signal and are not blocked by robots.txt.
- **SC-003**: Within 30 days of submitting the sitemap to Google Search Console, at least 90% of published posts show as "Indexed" in the coverage report.
- **SC-004**: Searching each of "Alex Argyriou", "Alexander Argyriou", and "Alexandros Argyriou" on Google returns this site within the first page of results within 90 days of deployment and indexing (subject to search engine crawl timing, which is outside the site's direct control).
- **SC-005**: Structured data validation tools (e.g., Google Rich Results Test / Schema.org validator) report zero errors for the Person/author schema across sampled pages.

## Assumptions

- The site already has a working sitemap generation mechanism (via the `@astrojs/sitemap` integration) and a public production URL (`https://pixel-pistons.com/`); this feature extends/corrects configuration rather than introducing sitemap generation from scratch.
- "All posts" refers to all currently published posts under the blog's posts collection; draft/unpublished content is intentionally excluded from indexing.
- The canonical name for the owner is "Alexandros Argyriou" (per existing structured data), with "Alex Argyriou" and "Alexander Argyriou" treated as alternate names/short forms of the same person.
- Actual search ranking position and indexing speed depend on external search engine crawl schedules and algorithms and cannot be fully guaranteed by on-site changes alone; success criteria reflect commonly achievable outcomes when on-site SEO best practices are correctly implemented.
- No paid search advertising or off-site link-building campaign is in scope; this feature is limited to on-site/technical SEO changes.

## Blog-Specific Constraints

**Preservation Requirements**:
- Core Fuwari template structure MUST remain unchanged
- Existing components, layouts, and styles MUST NOT be refactored
- Changes MUST be additive (new files) rather than modifications (existing files)

**Minimal Change Strategy**:
- Configuration changes (src/config.ts, astro.config.mjs) preferred over code changes
- New functionality isolated in new component/plugin files
- Modifications to existing files must be surgical and justified

**Technology Constraints**:
- MUST work with Astro 5.x + Svelte integration
- MUST be compatible with Tailwind CSS styling approach
- MUST work with existing build process (pnpm build includes Pagefind)
- MUST support both light and dark modes
- MUST be mobile responsive
