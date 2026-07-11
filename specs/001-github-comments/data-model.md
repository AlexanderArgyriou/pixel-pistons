# Data Model: GitHub Comments Integration

**Date**: 2026-07-10

**Purpose**: Define data structures and relationships for GitHub comments feature

## Entities

### 1. GitHubConfig

**Purpose**: Configuration for GitHub repository and API settings

**Location**: `src/config.ts` (or `src/types/config.ts` for type definition)

**Schema**:
```typescript
interface GitHubConfig {
  /** Repository owner username or organization */
  owner: string;
  
  /** Repository name */
  repo: string;
  
  /** Optional GitHub API token for higher rate limits (5000/hr vs 60/hr) */
  token?: string;
  
  /** Whether to enable comments globally (can be overridden per post) */
  defaultEnabled?: boolean;
  
  /** Maximum number of comments to display initially */
  maxCommentsDisplay?: number; // Default: 20
}
```

**Example**:
```typescript
export const githubConfig: GitHubConfig = {
  owner: 'AlexanderArgyriou',
  repo: 'pixel-pistons',
  defaultEnabled: false, // Opt-in per post
  maxCommentsDisplay: 20
};
```

**Validation Rules**:
- `owner` and `repo` are required (non-empty strings)
- `token` is optional but recommended for production
- `maxCommentsDisplay` defaults to 20 if not specified

---

### 2. Post (Extended Schema)

**Purpose**: Blog post with optional GitHub issue link for comments

**Location**: `src/content/config.ts` (extension to existing post schema)

**Schema Extension**:
```typescript
import { z } from 'zod';

// Extend existing post schema
const postSchema = z.object({
  // ... existing fields (title, published, description, etc.)
  
  // NEW: GitHub comments integration
  githubIssue: z.number().optional(),        // Issue number (e.g., 123)
  commentsEnabled: z.boolean().optional(),   // Override global setting
});
```

**Example Frontmatter**:
```yaml
---
title: "Introducing Pixel Pistons"
published: 2026-07-10
description: "Welcome to my blog"
githubIssue: 42
commentsEnabled: true
---
```

**Validation Rules**:
- `githubIssue` must be positive integer if provided
- `commentsEnabled` defaults to `githubConfig.defaultEnabled` if not specified
- If `githubIssue` is provided but `commentsEnabled` is false, no comments display

**Relationships**:
- One Post → Zero or One GitHub Issue (optional link)

---

### 3. GitHubComment

**Purpose**: Represents a single comment from GitHub API

**Location**: `src/types/github.ts` (new file)

**Schema**:
```typescript
interface GitHubComment {
  /** Unique comment ID from GitHub */
  id: number;
  
  /** Comment author information */
  user: {
    login: string;           // GitHub username
    avatar_url: string;      // Avatar image URL
    html_url: string;        // Profile URL
  };
  
  /** Comment text in Markdown format */
  body: string;
  
  /** When comment was created (ISO 8601) */
  created_at: string;
  
  /** When comment was last updated (ISO 8601) */
  updated_at: string;
  
  /** Direct link to this comment on GitHub */
  html_url: string;
  
  /** Reactions to the comment (optional, for future enhancement) */
  reactions?: {
    '+1': number;
    '-1': number;
    laugh: number;
    hooray: number;
    confused: number;
    heart: number;
    rocket: number;
    eyes: number;
  };
}
```

**Source**: Direct mapping from GitHub API response

**Transformations**: None required - use GitHub API response as-is

---

### 4. CommentsState

**Purpose**: Component state for managing comment loading and errors

**Location**: `src/components/GitHubComments.svelte` (internal to component)

**Schema**:
```typescript
interface CommentsState {
  /** Array of fetched comments */
  comments: GitHubComment[];
  
  /** Loading indicator */
  loading: boolean;
  
  /** Error message if fetch failed */
  error: string | null;
  
  /** Whether more comments are available (for pagination) */
  hasMore: boolean;
}
```

**State Transitions**:
1. **Initial**: `{ comments: [], loading: true, error: null, hasMore: false }`
2. **Success**: `{ comments: [...], loading: false, error: null, hasMore: total > maxDisplay }`
3. **Error**: `{ comments: [], loading: false, error: "...", hasMore: false }`

---

### 5. CachedComments

**Purpose**: Cached comment data in sessionStorage

**Location**: sessionStorage (browser storage)

**Schema**:
```typescript
interface CachedComments {
  /** Cached comment data */
  data: GitHubComment[];
  
  /** Unix timestamp when cache was created */
  timestamp: number;
  
  /** Cache key format: github-comments-{owner}-{repo}-{issue} */
  key?: string; // Not stored, used for indexing
}
```

**Storage Format** (JSON stringified):
```json
{
  "data": [...],
  "timestamp": 1720622400000
}
```

**TTL**: 5 minutes (300,000 milliseconds)

**Eviction**: Cleared on browser session end

---

## Data Flow

```
┌─────────────────┐
│   Blog Post     │
│  (frontmatter)  │
│  githubIssue: N │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ GitHubComments.svelte│
│   Component          │
└────────┬─────────────┘
         │
         ├──► Check sessionStorage
         │    (CachedComments)
         │
         ├──► Fetch GitHub API
         │    GET /repos/{owner}/{repo}/issues/{N}/comments
         │
         ▼
┌─────────────────────┐
│  GitHubComment[]     │
│  (API Response)      │
└────────┬─────────────┘
         │
         ├──► Cache in sessionStorage
         │
         ├──► Render with markdown-it
         │
         ▼
┌─────────────────────┐
│  Displayed Comments  │
│  (HTML output)       │
└─────────────────────┘
```

## Validation Rules

1. **GitHub Issue Number**:
   - Must be positive integer
   - Must exist in configured repository (verified at runtime)
   - Returns 404 if issue doesn't exist → display error state

2. **API Response**:
   - Must be valid JSON array
   - Each comment must have required fields (id, user, body, created_at)
   - Empty array is valid (no comments yet)

3. **Cache**:
   - Must be valid JSON
   - Timestamp must be within TTL (5 minutes)
   - Corrupted cache is ignored, fetches fresh data

4. **Markdown Content**:
   - HTML is escaped (markdown-it with html: false)
   - Long content is word-wrapped (CSS overflow-wrap)
   - Images are max-width constrained

## Relationships

```
GitHubConfig (1) ─────────────┐
                              │
                              ▼
Post (N) ─── githubIssue ──► GitHub Issue (external, 1)
                              │
                              ├──► GitHubComment (N)
                              │
                              └──► CachedComments (0..1)
```

- One `GitHubConfig` applies globally
- Many `Post` entities, each may reference one GitHub Issue
- One GitHub Issue has many `GitHubComment` entities
- One Issue may have one `CachedComments` entry (or none if not cached)

## Notes

- All dates from GitHub API are ISO 8601 strings (e.g., "2026-07-10T12:00:00Z")
- Avatar URLs are CDN-hosted by GitHub (no local storage needed)
- Markdown rendering happens client-side (no server processing)
- No write operations - all data is read-only from GitHub
