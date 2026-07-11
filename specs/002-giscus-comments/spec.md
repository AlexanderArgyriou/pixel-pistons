# Feature Specification: Giscus Comments Integration

**Feature ID**: 002-giscus-comments  
**Status**: Draft  
**Priority**: P1 (Must Have)  
**Created**: 2026-07-10  
**Updated**: 2026-07-10  

---

## Feature Overview

Enable blog post comments using **Giscus** - a comments system powered by GitHub Discussions. Giscus provides a ready-made, feature-rich widget that supports reactions, threading, moderation, and automatic theme integration.

**User Value**: Readers can discuss posts using their GitHub accounts without leaving the blog. Authors get free, spam-resistant comments with full moderation control via GitHub Discussions.

**Success Criteria**:
1. Giscus widget displays on enabled posts with zero load errors
2. Comments sync instantly with GitHub Discussions
3. Theme (light/dark) matches blog automatically
4. Per-post enablement via frontmatter configuration

---

## User Stories

### US1: Display Giscus Comments Widget (P1 - Must Have)

**As a** blog reader  
**I want to** see a comments section powered by Giscus under blog posts  
**So that** I can read and participate in discussions using my GitHub account

**Acceptance Criteria**:
- Giscus widget loads on posts where `commentsEnabled: true` in frontmatter
- Widget displays existing discussion comments from GitHub
- Widget matches blog's light/dark theme automatically
- Loading state shows graceful placeholder
- Widget is responsive on all screen sizes

**Technical Notes**:
- Use Giscus script embed with dynamic configuration
- Map post to GitHub Discussion via `data-mapping="pathname"` or specific discussion
- Theme syncs via `data-theme` attribute
- Configuration: repo, repoId, category, categoryId from GitHub

### US2: Reader Interaction (P1 - Must Have)

**As a** blog reader  
**I want to** post comments, reply to threads, and add reactions  
**So that** I can engage with the content and other readers

**Acceptance Criteria**:
- Readers can sign in with GitHub via Giscus widget
- Readers can post new comments and replies
- Readers can add reactions (👍, ❤️, etc.)
- Real-time updates when new comments appear
- Mobile-friendly interaction (touch-optimized)

**Technical Notes**:
- Giscus handles all interaction UI natively
- No custom API calls needed - Giscus manages GitHub Discussions API
- Moderation controlled via GitHub Discussions settings

### US3: Per-Post Configuration (P2 - Should Have)

**As a** blog author  
**I want to** enable/disable comments per post via frontmatter  
**So that** I have granular control over which posts allow discussion

**Acceptance Criteria**:
- Posts with `commentsEnabled: false` show no comments widget
- Posts without Giscus fields follow `defaultEnabled` global config
- Optional `discussionNumber` field to link specific GitHub Discussion
- Documentation explains all configuration options

**Technical Notes**:
- Extend content schema with optional `commentsEnabled`, `discussionNumber` fields
- Global config in `src/config.ts` for defaults
- Conditional rendering in `PostPage.astro`

---

## Non-Goals

- Custom comment UI (use Giscus default)
- Email notifications (handled by GitHub)
- Comment editing within blog (use GitHub Discussions)
- Anonymous comments (GitHub authentication required)

---

## Dependencies

- GitHub Discussions enabled on repository
- Giscus app installed and configured
- Valid repoId and categoryId obtained

---

## Success Metrics

- Comments widget loads successfully on 100% of enabled posts
- Zero JavaScript errors related to Giscus
- Theme matches blog theme on initial load
- Mobile usability score maintains 95%+
