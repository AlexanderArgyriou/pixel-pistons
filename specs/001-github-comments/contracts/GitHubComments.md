# Component Contract: GitHubComments

**Component**: `src/components/GitHubComments.svelte`

**Purpose**: Display GitHub issue comments for a blog post with error handling and loading states

**Type**: Svelte 5 component (client-side only, uses `onMount`)

---

## Props Interface

```typescript
interface Props {
  /** GitHub issue number to fetch comments from */
  issueNumber: number;
  
  /** Optional: Maximum number of comments to display initially */
  maxDisplay?: number; // Default: 20
  
  /** Optional: Whether to show "Load More" button for long threads */
  enablePagination?: boolean; // Default: false
  
  /** Optional: Custom CSS class for styling */
  class?: string;
}
```

### Prop Descriptions

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `issueNumber` | number | ✅ Yes | - | GitHub issue ID to fetch comments from |
| `maxDisplay` | number | ❌ No | 20 | How many comments to show initially |
| `enablePagination` | boolean | ❌ No | false | Whether to show "Load More" for long threads |
| `class` | string | ❌ No | "" | Custom CSS classes for container styling |

---

## Usage Examples

### Basic Usage (Minimal)

```astro
---
// In PostPage.astro
import GitHubComments from '@/components/GitHubComments.svelte';

const { entry } = Astro.props;
const githubIssue = entry.data.githubIssue;
---

{githubIssue && (
  <GitHubComments issueNumber={githubIssue} client:load />
)}
```

### Advanced Usage (with options)

```astro
<GitHubComments 
  issueNumber={42}
  maxDisplay={10}
  enablePagination={true}
  class="my-custom-comments"
  client:load
/>
```

### Conditional Rendering

```astro
---
const commentsEnabled = entry.data.commentsEnabled ?? siteConfig.github?.defaultEnabled;
const githubIssue = entry.data.githubIssue;
---

{commentsEnabled && githubIssue && (
  <section class="comments-section">
    <h2>Discussion</h2>
    <GitHubComments issueNumber={githubIssue} client:load />
  </section>
)}
```

---

## Component States

### 1. Loading State

**When**: `onMount` → fetching data from API

**Display**:
```html
<div class="animate-pulse space-y-4">
  <p class="text-gray-500">Loading comments...</p>
  <!-- Skeleton loaders (optional) -->
</div>
```

**Duration**: Typically 200-500ms for cached, 500-2000ms for network fetch

---

### 2. Error State

**When**: API fetch fails (404, 403, network error, etc.)

**Display**:
```html
<div class="error-state rounded-lg border border-red-200 bg-red-50 p-4">
  <p class="text-red-800">Unable to load comments.</p>
  <a 
    href="https://github.com/{owner}/{repo}/issues/{issueNumber}"
    target="_blank"
    class="text-blue-600 hover:underline"
  >
    View discussion on GitHub →
  </a>
</div>
```

**Error Types**:
- **404**: "Discussion not found"
- **403**: "Comments temporarily unavailable (rate limited)"
- **Network**: "Unable to connect to GitHub"

---

### 3. Empty State

**When**: API returns successfully but `comments.length === 0`

**Display**:
```html
<div class="empty-state text-gray-600">
  <p>No comments yet.</p>
  <a 
    href="https://github.com/{owner}/{repo}/issues/{issueNumber}"
    target="_blank"
    class="inline-flex items-center text-blue-600 hover:underline"
  >
    Start the discussion on GitHub →
  </a>
</div>
```

---

### 4. Success State (with comments)

**When**: API returns comments successfully

**Display**:
```html
<div class="comments-list space-y-6">
  {#each comments as comment}
    <article class="comment border-b pb-6">
      <!-- Comment header -->
      <div class="flex items-center gap-3 mb-2">
        <img 
          src={comment.user.avatar_url} 
          alt={comment.user.login}
          class="w-10 h-10 rounded-full"
        />
        <div>
          <a href={comment.user.html_url} class="font-semibold hover:underline">
            {comment.user.login}
          </a>
          <time class="text-sm text-gray-500">
            {formatDate(comment.created_at)}
          </time>
        </div>
      </div>
      
      <!-- Comment body (rendered markdown) -->
      <div class="prose prose-sm max-w-none">
        {@html renderMarkdown(comment.body)}
      </div>
      
      <!-- Link to comment on GitHub -->
      <a 
        href={comment.html_url}
        class="text-sm text-gray-500 hover:text-blue-600"
      >
        View on GitHub
      </a>
    </article>
  {/each}
  
  <!-- Footer with CTA -->
  <div class="pt-4 border-t">
    <a 
      href="https://github.com/{owner}/{repo}/issues/{issueNumber}"
      target="_blank"
      class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Join the discussion on GitHub →
    </a>
  </div>
</div>
```

---

## Events

Component does not emit custom events (read-only display).

All interactions (clicking GitHub links) are standard `<a>` tag navigations.

---

## Dependencies

### External (from GitHub API)

- **Endpoint**: `https://api.github.com/repos/{owner}/{repo}/issues/{issueNumber}/comments`
- **Rate Limit**: 60 requests/hour (unauthenticated), 5000/hour (with token)
- **Response**: Array of `GitHubComment` objects (see data-model.md)

### Internal (from project)

- **Config**: Imports `githubConfig` from `src/config.ts`
  ```typescript
  import { githubConfig } from '@/config';
  const { owner, repo } = githubConfig;
  ```

- **Markdown**: Uses `markdown-it` (existing dependency)
  ```typescript
  import MarkdownIt from 'markdown-it';
  const md = new MarkdownIt({ html: false, linkify: true });
  ```

- **Caching**: Uses browser `sessionStorage`
  ```typescript
  const cacheKey = `github-comments-${owner}-${repo}-${issueNumber}`;
  sessionStorage.setItem(cacheKey, JSON.stringify({ data, timestamp }));
  ```

---

## Styling Contract

### Theme Integration

Component uses existing blog theme variables:

```css
/* Light mode */
--text: /* existing text color */
--bg: /* existing background color */
--primary: /* existing accent color */

/* Dark mode */
@media (prefers-color-scheme: dark) {
  /* Inherits from existing dark mode variables */
}
```

### Responsive Breakpoints

Follows existing Tailwind breakpoints:
- `sm:` - 640px and up
- `md:` - 768px and up
- `lg:` - 1024px and up

### Required CSS Classes

Component expects these Tailwind utilities to be available:
- Layout: `flex`, `space-y-*`, `grid`
- Typography: `prose`, `text-*`, `font-*`
- Borders: `border`, `rounded`
- Colors: `bg-*`, `text-*` (using theme variables)
- Animation: `animate-pulse` (for loading state)

---

## Accessibility

### Semantic HTML

- Comments wrapped in `<article>` tags
- Timestamps use `<time datetime="...">` elements
- Proper heading hierarchy (if section title used)

### Keyboard Navigation

- All links keyboard accessible (standard `<a>` tags)
- No custom keyboard handlers needed (read-only component)

### Screen Readers

- Avatar images have descriptive `alt` text (username)
- Loading state has readable text (not just spinner)
- Error messages are clear text, not icons only

### ARIA

```html
<div role="region" aria-label="Comments from GitHub">
  <!-- Comments content -->
</div>

<!-- Loading state -->
<div role="status" aria-live="polite">
  Loading comments...
</div>

<!-- Error state -->
<div role="alert" aria-live="assertive">
  Unable to load comments.
</div>
```

---

## Performance Characteristics

### Initial Load

- **SSG Build**: No impact (component renders client-side only)
- **First Paint**: Component shell renders immediately, then fetches data
- **Time to Interactive**: ~200ms (cached) to ~2s (network fetch)

### Caching

- **First Visit**: Network request to GitHub API
- **Subsequent Visits** (same session): Instant from sessionStorage (if < 5 min old)
- **Cache Size**: ~5-20 KB per issue (depends on comment count)

### Bundle Size

- **Component Code**: ~5 KB (minified)
- **markdown-it**: Already included in blog bundle (no additional size)
- **Total Impact**: ~5 KB added to blog bundle

---

## Error Handling Contract

### Required Behaviors

1. **Network Failures**: Display error message + GitHub link
2. **Rate Limiting (403)**: Display "temporarily unavailable" + GitHub link
3. **Missing Issue (404)**: Display "discussion not found" + contact option
4. **Invalid JSON**: Treat as network error, display error state
5. **Component Mount Failure**: Fail silently, no comments displayed

### Never Block

- Component errors MUST NOT break post rendering
- Failed fetch MUST NOT prevent page load
- MUST always provide fallback GitHub link

---

## Testing Contract

### Manual Testing Checklist

```bash
# Test scenarios:
1. Post with valid GitHub issue (5+ comments)
2. Post with valid GitHub issue (0 comments - empty state)
3. Post with invalid issue number (404 error)
4. Post without githubIssue field (component not rendered)
5. Rapidly navigate between posts (test caching)
6. Network offline (test error state)
7. Light/dark mode toggle (test theme integration)
8. Mobile viewport (test responsive layout)
```

### Validation Commands

```bash
pnpm dev              # Visual verification
pnpm check            # Astro type checking
pnpm type-check       # TypeScript validation
pnpm build            # Production build test
```

---

## Migration/Rollback

### Adding Component

1. Create `src/components/GitHubComments.svelte`
2. Add config to `src/config.ts`
3. Extend schema in `src/content/config.ts`
4. Add to `PostPage.astro` with conditional render

### Removing Component

1. Remove `<GitHubComments>` line from `PostPage.astro`
2. (Optional) Remove config from `src/config.ts`
3. (Optional) Remove schema field from `src/content/config.ts`
4. (Optional) Delete `src/components/GitHubComments.svelte`

**Impact**: Zero breaking changes - posts continue to work without comments
