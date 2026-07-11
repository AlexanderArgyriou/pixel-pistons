# Feature Specification: GitHub Comments Integration

**Feature Branch**: `001-github-comments`

**Created**: 2026-07-10

**Status**: Draft

**Input**: User description: "i want a comment section under each post where the users can use github comments to write their opinion and interact"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Display GitHub Issue Comments (Priority: P1)

Readers visiting a blog post can see existing comments from a linked GitHub issue displayed at the bottom of the post, enabling them to read other readers' opinions and discussions without leaving the blog.

**Why this priority**: This is the core value proposition - making existing discussions visible to blog readers. Without this, there's no comment functionality at all.

**Independent Test**: Can be fully tested by creating a blog post with an associated GitHub issue that has comments, then verifying those comments render correctly on the blog post page.

**Acceptance Scenarios**:

1. **Given** a blog post is linked to a GitHub issue with 5 comments, **When** a reader visits the post page, **Then** all 5 comments are displayed in chronological order with author info and timestamps
2. **Given** a blog post has no linked GitHub issue, **When** a reader visits the post page, **Then** no comment section is displayed (graceful degradation)
3. **Given** a blog post is linked to a GitHub issue with no comments, **When** a reader visits the post page, **Then** a "No comments yet" message is displayed with a link to start the discussion

---

### User Story 2 - Enable Reader Interaction (Priority: P2)

Readers can click a clear call-to-action button to open the GitHub issue and add their own comments or react to existing ones, creating a seamless bridge between the blog and GitHub discussions.

**Why this priority**: Enables the interactive aspect - readers can contribute to discussions. Builds on P1 by adding write capability.

**Independent Test**: Can be tested by clicking the "Add Comment" or "Join Discussion" button and verifying it opens the correct GitHub issue in a new tab.

**Acceptance Scenarios**:

1. **Given** a reader is viewing a post with comments, **When** they click the "Join Discussion on GitHub" button, **Then** the associated GitHub issue opens in a new browser tab
2. **Given** a reader wants to reply to a specific comment, **When** they click a reply indicator next to that comment, **Then** they are taken to GitHub with the issue open and scrolled to that comment
3. **Given** a reader is not logged into GitHub, **When** they click to add a comment, **Then** GitHub's authentication flow handles login before allowing comment posting

---

### User Story 3 - Comment Configuration per Post (Priority: P3)

Blog authors can enable or disable comments on a per-post basis through frontmatter, and configure which GitHub repository and issue to use for each post's comments.

**Why this priority**: Provides control and flexibility. Not essential for MVP but important for production use (some posts may not need comments).

**Independent Test**: Can be tested by setting different frontmatter values (comments enabled/disabled, different issue numbers) and verifying the comment section reflects those settings.

**Acceptance Scenarios**:

1. **Given** a post has `comments: false` in frontmatter, **When** a reader visits the post, **Then** no comment section or GitHub link is displayed
2. **Given** a post has `githubIssue: 123` in frontmatter, **When** comments load, **Then** they fetch from issue #123 in the configured repository
3. **Given** a post has no comment configuration in frontmatter, **When** a reader visits the post, **Then** the system uses default behavior (comments disabled or auto-creates issue based on configuration)

---

### Edge Cases

- What happens when the GitHub API is unavailable or rate-limited?
  - Display a fallback message: "Comments temporarily unavailable - [View on GitHub]"
  - Cache previous successful API responses to show stale data rather than nothing
  
- How does the system handle deleted or closed GitHub issues?
  - Closed issues: Display comments normally but add a "This discussion is closed" banner
  - Deleted/missing issues: Show "Discussion not found - [Contact the author]"
  
- What about comment content with special formatting or large embedded images?
  - Render GitHub-flavored Markdown with the same markdown processor used for posts
  - Set max-width on embedded images to prevent layout breaks
  - Sanitize HTML to prevent XSS attacks
  
- How are very long comment threads handled?
  - Initially display first 10-20 comments
  - Add "Load more comments" button or infinite scroll
  - Provide "View all on GitHub" link for full experience

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST fetch and display comments from a specified GitHub issue for each blog post
- **FR-002**: System MUST render comment text using GitHub-flavored Markdown formatting
- **FR-003**: System MUST display comment metadata (author username, avatar, timestamp)
- **FR-004**: Users MUST be able to navigate to the GitHub issue to add their own comments
- **FR-005**: System MUST handle GitHub API errors gracefully with fallback messaging
- **FR-006**: System MUST respect post-level comment configuration (enable/disable via frontmatter)
- **FR-007**: Comment section MUST be styled consistently with the existing blog theme (light and dark modes)
- **FR-008**: System MUST work on mobile devices with responsive layout
- **FR-009**: Comments MUST load without blocking the main post content rendering
- **FR-010**: System MUST cache GitHub API responses to avoid hitting rate limits

### Key Entities

- **Blog Post**: Represents an article with optional comment configuration (GitHub issue reference, comments enabled flag)
- **GitHub Issue**: External entity representing the discussion thread linked to a post
- **Comment**: Individual response in a GitHub issue with author, content, timestamp, and reactions
- **GitHub API Configuration**: Repository owner, repository name, access token (if needed for higher rate limits)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Readers can view existing comments on any post with comments enabled without any additional clicks or navigation
- **SC-002**: Comment section loads and displays within 2 seconds on standard broadband connections
- **SC-003**: Comments are readable and properly formatted on both mobile and desktop viewports
- **SC-004**: Blog posts without comments configured display no comment section (clean degradation)
- **SC-005**: Zero breaking changes to existing blog functionality or build process
- **SC-006**: Dark mode and light mode both render comments with appropriate contrast and readability

## Assumptions

- Readers have JavaScript enabled (required for fetching GitHub API data)
- Blog author has a GitHub account and can create issues for comment threads
- GitHub API rate limits are sufficient for expected blog traffic (60 requests/hour unauthenticated, 5000/hour with token)
- Blog is primarily text-based discussions; video/audio embeds in comments are out of scope for v1
- Comment moderation is handled via GitHub's issue moderation tools (not duplicated in the blog)
- Initial implementation will fetch comments client-side; server-side rendering is a future optimization
- Reactions/emoji on GitHub comments can be displayed but are read-only (clicking doesn't add reaction)

## Blog-Specific Constraints

**Preservation Requirements**:
- Core Fuwari template structure MUST remain unchanged
- Existing PostPage.astro component receives minimal modifications (just adding the new comment component)
- Existing components, layouts, and styles MUST NOT be refactored
- Changes MUST be additive (new GitHubComments component file) rather than modifications

**Minimal Change Strategy**:
- Configuration changes in src/config.ts for GitHub repository settings (preferred)
- New isolated component: src/components/GitHubComments.svelte or .astro
- Per-post configuration via frontmatter in src/content/config.ts schema
- Single-line integration into PostPage.astro to include the comment component
- No modifications to existing markdown processing or styling

**Technology Constraints**:
- MUST work with Astro 5.x + Svelte integration (can be Svelte component for reactivity)
- MUST be compatible with Tailwind CSS styling approach
- MUST work with existing build process (pnpm build includes Pagefind)
- MUST support both light and dark modes using existing theme variables
- MUST be mobile responsive following existing breakpoint patterns
- MUST use existing markdown processor for rendering comment content (avoid new dependencies)
- MUST handle client-side API calls without adding server endpoints (maintain static site architecture)
