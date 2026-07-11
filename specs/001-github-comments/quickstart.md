# Quickstart: GitHub Comments Validation Guide

**Feature**: GitHub Comments Integration

**Purpose**: End-to-end validation scenarios to verify the feature works correctly

**Prerequisites**:
- Feature implemented per [plan.md](plan.md)
- GitHub repository configured in `src/config.ts`
- At least one test blog post with `githubIssue` frontmatter

---

## Setup

### 1. Configure GitHub Repository

**File**: `src/config.ts`

Add GitHub configuration:
```typescript
export const githubConfig = {
  owner: 'your-username',
  repo: 'your-repo',
  defaultEnabled: false,
  maxCommentsDisplay: 20
};
```

### 2. Create Test GitHub Issue

1. Go to `https://github.com/{owner}/{repo}/issues/new`
2. Create an issue titled "Test: Comments on Blog Post"
3. Add 2-3 test comments with different content:
   - Plain text comment
   - Comment with **markdown** formatting
   - Comment with a link
4. Note the issue number (e.g., `#42`)

### 3. Create Test Blog Post

**File**: `src/content/posts/test-comments.md`

```markdown
---
title: "Test Post with Comments"
published: 2026-07-10
description: "Testing GitHub comments integration"
githubIssue: 42
commentsEnabled: true
---

This is a test post to validate GitHub comments.

Scroll down to see the comments section!
```

---

## Validation Scenarios

### Scenario 1: Display Comments (Happy Path)

**Goal**: Verify comments load and display correctly

**Steps**:
1. Start dev server: `pnpm dev`
2. Navigate to `http://localhost:4321/posts/test-comments/`
3. Scroll to bottom of post

**Expected Results**:
- ✅ Comments section appears below post content
- ✅ All test comments from GitHub issue are displayed
- ✅ Each comment shows:
  - Author avatar image
  - Author username (linked to GitHub profile)
  - Comment timestamp
  - Rendered markdown content
  - "View on GitHub" link
- ✅ "Join the discussion on GitHub" button appears at bottom
- ✅ Comments load within 2 seconds

**Validation**:
```bash
# Check browser console - should see no errors
# Check network tab - should see successful API call to:
# https://api.github.com/repos/{owner}/{repo}/issues/42/comments
```

---

### Scenario 2: Empty State (No Comments Yet)

**Goal**: Verify graceful handling when issue has zero comments

**Steps**:
1. Create new GitHub issue with no comments (e.g., #43)
2. Create blog post with `githubIssue: 43`
3. Visit the post page

**Expected Results**:
- ✅ Comments section appears
- ✅ Message displays: "No comments yet."
- ✅ Link to start discussion on GitHub is visible and clickable
- ✅ Clicking link opens GitHub issue in new tab

---

### Scenario 3: Error Handling (Invalid Issue)

**Goal**: Verify error state when issue doesn't exist

**Steps**:
1. Create blog post with `githubIssue: 99999` (non-existent)
2. Visit the post page

**Expected Results**:
- ✅ Comments section shows error state
- ✅ Error message: "Unable to load comments." or "Discussion not found"
- ✅ Fallback link to GitHub is displayed
- ✅ No JavaScript console errors (error handled gracefully)
- ✅ Rest of post content displays normally

---

### Scenario 4: Comments Disabled

**Goal**: Verify comments don't appear when disabled

**Steps**:
1. Create blog post WITHOUT `githubIssue` field in frontmatter
2. Visit the post page

**Expected Results**:
- ✅ No comments section appears
- ✅ Post content ends normally (no empty space or error)

**Alternative Test**:
1. Create blog post with `commentsEnabled: false` and `githubIssue: 42`
2. Visit the post page
3. ✅ No comments section appears (even though issue exists)

---

### Scenario 5: Caching Behavior

**Goal**: Verify sessionStorage caching works

**Steps**:
1. Visit post with comments (e.g., test-comments)
2. Open browser DevTools → Network tab → Clear
3. Navigate to another post
4. Navigate BACK to test-comments post
5. Check Network tab

**Expected Results**:
- ✅ First visit: API call to GitHub appears in Network tab
- ✅ Return visit (same session): NO new API call (loaded from cache)
- ✅ Comments display instantly on return visit
- ✅ Check Application → Session Storage → see cached data

**Cache Expiration Test**:
1. Wait 6 minutes (cache TTL is 5 min)
2. Revisit the same post
3. ✅ New API call appears (cache expired)

---

### Scenario 6: Responsive Design

**Goal**: Verify mobile and desktop layouts

**Steps**:
1. Visit post with comments
2. Resize browser to mobile width (320px, 375px, 768px)
3. Toggle device toolbar in DevTools

**Expected Results**:
- ✅ Comments stack vertically on mobile (no horizontal scroll)
- ✅ Avatars scale appropriately (smaller on mobile)
- ✅ Text wraps correctly (no overflow)
- ✅ GitHub links remain clickable and visible
- ✅ Touch targets are adequate size (minimum 44x44px)

---

### Scenario 7: Theme Integration (Light/Dark Mode)

**Goal**: Verify styling works in both themes

**Steps**:
1. Visit post with comments in light mode
2. Toggle to dark mode (using blog's theme switcher)
3. Observe comment section styling

**Expected Results**:
- ✅ Light mode: Comments have light background, dark text
- ✅ Dark mode: Comments have dark background, light text
- ✅ No jarring color mismatches with rest of blog
- ✅ Links remain readable in both modes
- ✅ Avatars don't have weird borders/backgrounds

---

### Scenario 8: Markdown Rendering

**Goal**: Verify comment markdown renders correctly

**Steps**:
1. Add a GitHub comment with varied markdown:
   ```markdown
   **Bold text** and *italic text*
   
   - List item 1
   - List item 2
   
   [Link to example](https://example.com)
   
   `inline code` and
   
   ```
   code block
   ```
   ```

2. Visit the post page

**Expected Results**:
- ✅ Bold text renders as bold
- ✅ Italic text renders as italic
- ✅ List items display with bullets
- ✅ Links are clickable and styled
- ✅ Code blocks have distinct styling
- ✅ No raw HTML appears (markdown-it sanitizes)

---

### Scenario 9: Build Process

**Goal**: Verify feature doesn't break production build

**Steps**:
```bash
pnpm build
```

**Expected Results**:
- ✅ Build completes without errors
- ✅ No type errors related to GitHubComments component
- ✅ Pagefind indexing completes (not affected by comments)
- ✅ `dist/` folder generated successfully

**Preview**:
```bash
pnpm preview
```
- ✅ Comments work in production preview
- ✅ API calls work (not blocked by CORS or build settings)

---

### Scenario 10: Type Safety

**Goal**: Verify TypeScript catches errors

**Steps**:
```bash
pnpm check
pnpm type-check
```

**Expected Results**:
- ✅ Both commands complete with no errors
- ✅ Component props are type-checked
- ✅ GitHub API response types are correct

**Test Invalid Usage** (should fail type check):
```astro
<!-- This should produce type error -->
<GitHubComments issueNumber="not-a-number" />
```

---

## Performance Validation

### Load Time Test

**Goal**: Comments load within acceptable time

**Steps**:
1. Open DevTools → Network tab → Disable cache
2. Visit post with comments
3. Observe timing in Network tab

**Expected Results**:
- ✅ GitHub API call completes in < 1 second (typical)
- ✅ Comments render within 2 seconds total
- ✅ Page remains interactive during load (no blocking)

### Rate Limit Check

**Goal**: Verify caching prevents rate limit issues

**Steps**:
1. Rapidly navigate between 10 different posts with comments
2. Check Network tab for API calls

**Expected Results**:
- ✅ Only 10 API calls total (one per unique issue)
- ✅ Revisiting same post uses cache (no new call)
- ✅ No 403 rate limit errors

---

## Integration Validation

### Does Not Break Existing Features

**Checklist**:
- [ ] Post content still renders correctly
- [ ] RSS feed still generates (`/rss.xml`)
- [ ] Sitemap still generates (`/sitemap-0.xml`)
- [ ] Archive page works (`/archive`)
- [ ] Search works (Pagefind)
- [ ] Other posts without comments display normally
- [ ] Dark/light mode toggle works
- [ ] Navigation between posts works
- [ ] Page transitions work (Swup)

**Commands**:
```bash
pnpm dev
# Visit each page manually and verify
```

---

## Troubleshooting Guide

### Issue: Comments don't load

**Checks**:
1. ✅ Is `githubIssue` field present in frontmatter?
2. ✅ Is `commentsEnabled` true or omitted (defaulting to true)?
3. ✅ Is GitHub repository correctly configured in `src/config.ts`?
4. ✅ Does the issue exist in the repository? (Check GitHub directly)
5. ✅ Are there CORS errors in console? (GitHub API allows CORS)
6. ✅ Is network connectivity working? (Check other API calls)

### Issue: 403 Forbidden error

**Cause**: GitHub API rate limit exceeded (60 req/hour unauthenticated)

**Solution**:
1. Add GitHub personal access token to config (increases limit to 5000/hour)
2. Wait 1 hour for rate limit to reset
3. Verify caching is working (shouldn't hit limit with caching)

### Issue: Markdown not rendering

**Checks**:
1. ✅ Is `markdown-it` imported correctly?
2. ✅ Is `html: false` set (for security)?
3. ✅ Are styles applied? (Check Tailwind `prose` classes)

### Issue: Type errors

**Common Fixes**:
```bash
# Regenerate TypeScript types
pnpm check

# Ensure dependencies are installed
pnpm install
```

---

## Success Criteria Validation

After completing all scenarios, verify these outcomes:

- ✅ **SC-001**: Readers can view comments without extra clicks
- ✅ **SC-002**: Comments load within 2 seconds
- ✅ **SC-003**: Comments readable on mobile and desktop
- ✅ **SC-004**: Posts without comments configured show no section
- ✅ **SC-005**: Zero breaking changes to existing functionality
- ✅ **SC-006**: Dark and light modes both render correctly

---

## Next Steps

Once validation passes:
1. ✅ Remove test post and GitHub issue (if desired)
2. ✅ Create real GitHub issues for posts where you want comments
3. ✅ Update post frontmatter with `githubIssue` numbers
4. ✅ Deploy to production and verify in live environment

**Production Checklist**:
- [ ] GitHub token configured (for higher rate limits)
- [ ] Correct repository owner/name in config
- [ ] Test posts have valid issue numbers
- [ ] Vercel deployment successful
- [ ] Comments load in production
