# Research: GitHub Comments Integration

**Date**: 2026-07-10

**Purpose**: Resolve technical unknowns and establish best practices for implementing GitHub issue comments in Astro blog

## Research Questions

1. How to fetch GitHub issue comments via API without authentication?
2. What's the best approach for client-side data fetching in Svelte components?
3. How to render GitHub-flavored Markdown in comments?
4. What caching strategy prevents hitting GitHub API rate limits?
5. How to handle API errors and loading states gracefully?

---

## 1. GitHub API for Issue Comments

### Decision: Use GitHub REST API v3 (Unauthenticated)

**API Endpoint**:
```
GET https://api.github.com/repos/{owner}/{repo}/issues/{issue_number}/comments
```

**Rate Limits**:
- Unauthenticated: 60 requests/hour per IP
- Authenticated (with token): 5,000 requests/hour

**Response Format**:
```json
[
  {
    "id": 1,
    "user": {
      "login": "username",
      "avatar_url": "https://avatars.githubusercontent.com/u/123456"
    },
    "created_at": "2023-01-01T12:00:00Z",
    "updated_at": "2023-01-01T12:00:00Z",
    "body": "Comment text in Markdown",
    "html_url": "https://github.com/owner/repo/issues/1#issuecomment-123"
  }
]
```

**Rationale**: 
- REST API is simpler than GraphQL for this use case
- No authentication required for public repositories (60 req/hr usually sufficient for blog traffic)
- Can optionally add token later for higher limits without code changes

**Alternatives Considered**:
- GraphQL API: More complex setup, overkill for simple comment fetching
- Third-party services (utterances, giscus): Add external dependencies, less control

**Implementation Notes**:
- Store repo owner/name in `src/config.ts`
- Optional token in environment variable for production (higher limits)
- Handle CORS properly (GitHub API allows cross-origin requests)

---

## 2. Client-Side Data Fetching in Svelte

### Decision: Use Svelte onMount with fetch API

**Pattern**:
```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  
  let comments = $state<Comment[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);
  
  onMount(async () => {
    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      comments = await response.json();
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  });
</script>
```

**Rationale**:
- `onMount` ensures fetch only happens client-side (not during SSG build)
- Native fetch API - no additional dependencies
- Svelte 5 `$state` runes for reactivity

**Alternatives Considered**:
- SWR/React Query equivalents for Svelte: Unnecessary for simple use case
- Fetch during Astro build: Requires rebuild to update comments, not dynamic
- Server-side proxy: Adds complexity, not needed for public API

---

## 3. Markdown Rendering for Comments

### Decision: Use markdown-it (already in project)

**Current Usage**: Blog already uses `markdown-it` (see package.json)

**Implementation**:
```typescript
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
  html: false, // Security: disable HTML in comments
  linkify: true, // Auto-link URLs
  breaks: true // GitHub-style line breaks
});

const renderedComment = md.render(comment.body);
```

**Security**: 
- Disable raw HTML to prevent XSS attacks
- GitHub API returns markdown, not HTML
- markdown-it auto-escapes potentially dangerous content

**Rationale**:
- Already a dependency - zero new packages
- Supports GitHub-flavored Markdown basics
- Lightweight and proven

**Alternatives Considered**:
- `marked` library: Would require new dependency
- GitHub's markdown API: Extra API call per comment (rate limit concern)
- `remark` (used for posts): Heavier, designed for build-time processing

---

## 4. Caching Strategy for API Responses

### Decision: sessionStorage + stale-while-revalidate pattern

**Implementation**:
```typescript
const CACHE_KEY = `github-comments-${owner}-${repo}-${issueNumber}`;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Try cache first
const cached = sessionStorage.getItem(CACHE_KEY);
if (cached) {
  const { data, timestamp } = JSON.parse(cached);
  if (Date.now() - timestamp < CACHE_DURATION) {
    comments = data; // Use cached data
    loading = false;
    // Optionally: fetch fresh data in background
  }
}

// Fetch and cache
const response = await fetch(apiUrl);
const data = await response.json();
sessionStorage.setItem(CACHE_KEY, JSON.stringify({
  data,
  timestamp: Date.now()
}));
```

**Rationale**:
- sessionStorage persists across page navigations in same session
- 5-minute cache prevents repeated API calls when browsing multiple posts
- Respects 60 req/hour rate limit (typical blog session < 12 post views)
- Cache clears on browser close (fresh data on new visits)

**Alternatives Considered**:
- localStorage: Persists too long, stale data on return visits
- No caching: Wastes API calls, hits rate limits quickly
- Service Worker: Overkill for simple blog, adds complexity

---

## 5. Error Handling and Loading States

### Decision: Three-state UI pattern (loading, error, success)

**Loading State**:
```svelte
{#if loading}
  <div class="animate-pulse">Loading comments...</div>
{/if}
```

**Error State**:
```svelte
{#if error}
  <div class="error-message">
    <p>Unable to load comments.</p>
    <a href={githubIssueUrl} target="_blank">View on GitHub →</a>
  </div>
{/if}
```

**Success State**:
```svelte
{#if comments.length === 0}
  <p>No comments yet. <a href={githubIssueUrl}>Start the discussion →</a></p>
{:else}
  {#each comments as comment}
    <!-- Render comment -->
  {/each}
{/if}
```

**Error Categories**:
1. **404 Not Found**: Issue doesn't exist → "Discussion not found"
2. **403 Forbidden**: Rate limited → "Comments temporarily unavailable"
3. **Network Error**: Offline/timeout → "Unable to connect"
4. **410 Gone**: Issue deleted → "Discussion no longer available"

**Rationale**:
- Always provide fallback link to GitHub (never dead end)
- Graceful degradation maintains blog usability
- Clear messaging helps users understand state

**Alternatives Considered**:
- Silent failure: Poor UX, users confused
- Retry logic: Wastes API quota on persistent errors
- Error boundaries: Overkill for single component

---

## Summary of Decisions

| Aspect | Decision | Key Benefit |
|--------|----------|-------------|
| **API** | GitHub REST API v3 (unauthenticated) | Simple, no auth required for public repos |
| **Fetching** | Svelte onMount + native fetch | Zero dependencies, client-side only |
| **Markdown** | markdown-it (existing dependency) | Already in project, secure |
| **Caching** | sessionStorage (5 min TTL) | Respects rate limits, fresh data |
| **Errors** | Three-state UI with fallback links | Graceful degradation, always actionable |

**Dependencies Added**: None (all leverage existing packages)

**Next Phase**: Proceed to data model definition and component contracts
