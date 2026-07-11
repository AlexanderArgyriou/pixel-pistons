# Quickstart: Giscus Comments Integration

## Prerequisites

Before implementation, complete these setup steps:

### 1. Enable GitHub Discussions

1. Go to https://github.com/AlexanderArgyriou/pixel-pistons/settings
2. Scroll to "Features" section
3. Check "Discussions"
4. Click "Set up discussions"

### 2. Create Discussion Category

1. Go to Discussions tab
2. Click "Categories" (or create first discussion)
3. Create new category: "Blog Comments" (or your preferred name)
4. Note the category name for config

### 3. Install Giscus App

1. Visit https://github.com/apps/giscus
2. Click "Install"
3. Select "Only select repositories"
4. Choose "pixel-pistons"
5. Click "Install"

### 4. Get Configuration Values

1. Visit https://giscus.app
2. Enter repository: `AlexanderArgyriou/pixel-pistons`
3. Select "Blog Comments" category
4. Choose mapping: "pathname"
5. Copy the generated configuration:
   - `data-repo-id` → repoId
   - `data-category-id` → categoryId

---

## Validation Scenarios

### Scenario 1: Display Giscus Widget (Happy Path)

**Setup**:
```yaml
# src/content/posts/test-giscus.md
---
title: "Test Giscus"
published: 2026-07-10
commentsEnabled: true
---

Test post for Giscus integration.
```

**Steps**:
1. Run `pnpm dev`
2. Navigate to `/posts/test-giscus`
3. Scroll to bottom of post

**Expected**:
- "Discussion" heading appears
- Giscus widget loads
- "Sign in with GitHub" button visible
- Theme matches blog theme (light/dark)
- Widget is responsive (test mobile view)

**Success Criteria**:
- ✅ Widget renders without errors
- ✅ No console errors
- ✅ Theme matches blog
- ✅ Mobile layout looks good

---

### Scenario 2: Comments Disabled

**Setup**:
```yaml
# src/content/posts/no-comments.md
---
title: "No Comments"
published: 2026-07-10
commentsEnabled: false
---

This post has comments disabled.
```

**Steps**:
1. Navigate to `/posts/no-comments`
2. Scroll to bottom of post

**Expected**:
- No "Discussion" heading
- No Giscus widget
- Clean page end (no empty divs)

**Success Criteria**:
- ✅ No comments section visible
- ✅ No Giscus scripts loaded (check Network tab)

---

### Scenario 3: Specific Discussion Number

**Setup**:
1. Create discussion manually in GitHub:
   - Go to https://github.com/AlexanderArgyriou/pixel-pistons/discussions
   - Click "New discussion"
   - Select "Blog Comments" category
   - Title: "Discussion for My Special Post"
   - Body: "This is a manually created discussion"
   - Note the discussion number from URL (e.g., #42)

2. Create post:
```yaml
# src/content/posts/special-post.md
---
title: "My Special Post"
published: 2026-07-10
commentsEnabled: true
discussionNumber: 42
---

This post uses a specific discussion.
```

**Steps**:
1. Navigate to `/posts/special-post`
2. Scroll to Giscus widget
3. Post a test comment
4. Go to GitHub discussion #42

**Expected**:
- Widget loads linked discussion
- Comments appear in GitHub discussion #42
- New comments sync both ways

**Success Criteria**:
- ✅ Correct discussion loaded
- ✅ Comments sync to GitHub
- ✅ Manual discussion title visible in widget

---

### Scenario 4: Default Configuration

**Setup**:
```yaml
# src/content/posts/default-config.md
---
title: "Default Config Test"
published: 2026-07-10
# No commentsEnabled or discussionNumber
---

This post uses global defaults.
```

**Config**:
```typescript
// src/config.ts
export const giscusConfig: GiscusConfig = {
  // ... other fields
  defaultEnabled: false, // ← Change this to test
};
```

**Steps**:
1. With `defaultEnabled: false`:
   - Navigate to post
   - Verify no comments widget

2. Change to `defaultEnabled: true`:
   - Rebuild: `pnpm build`
   - Navigate to post
   - Verify comments widget appears

**Success Criteria**:
- ✅ `defaultEnabled: false` → no widget
- ✅ `defaultEnabled: true` → widget appears
- ✅ No build errors when changing config

---

### Scenario 5: Theme Synchronization

**Steps**:
1. Navigate to any post with comments
2. Check current theme (light or dark)
3. Toggle theme using blog's theme switcher
4. Observe Giscus widget

**Expected**:
- Widget theme matches blog theme initially
- Widget updates when blog theme changes (may require page refresh)

**Success Criteria**:
- ✅ Light theme → Giscus uses light theme
- ✅ Dark theme → Giscus uses dark theme
- ✅ No theme flash or mismatch

**Note**: Initial implementation uses `preferred_color_scheme`, so it respects system theme. Advanced theme sync can be added later.

---

### Scenario 6: Responsive Design

**Devices to Test**:
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)

**Steps**:
1. Open post with comments on each device
2. Scroll to Giscus widget
3. Try to interact (click sign in, read comments)

**Expected**:
- Widget fits container width on all devices
- No horizontal scroll
- Touch targets ≥44x44px
- Text readable without zoom

**Success Criteria**:
- ✅ No layout overflow
- ✅ Readable on smallest device
- ✅ Interactive elements usable
- ✅ Consistent spacing

---

### Scenario 7: Build Process

**Steps**:
1. Run full production build:
   ```bash
   pnpm build
   ```

2. Check output:
   - Build completes successfully
   - No TypeScript errors
   - No missing dependencies
   - dist/ folder contains all pages

3. Preview production build:
   ```bash
   pnpm preview
   ```

4. Navigate to post with comments
5. Verify widget loads in production mode

**Success Criteria**:
- ✅ Build completes in <30 seconds
- ✅ Zero errors
- ✅ Giscus widget works in production
- ✅ Pagefind indexing succeeds

---

### Scenario 8: Type Safety

**Steps**:
1. Run TypeScript check:
   ```bash
   pnpm check
   ```

2. Run explicit type check:
   ```bash
   pnpm type-check
   ```

3. Verify no errors in:
   - `src/types/giscus.ts`
   - `src/components/GiscusComments.svelte`
   - `src/config.ts`
   - `src/content/config.ts`

**Success Criteria**:
- ✅ `pnpm check` passes
- ✅ `pnpm type-check` passes
- ✅ Zero TypeScript errors
- ✅ All types correctly inferred

---

### Scenario 9: Integration Checklist

Verify existing features still work:

**RSS Feed**:
- Navigate to `/rss.xml`
- Verify feed validates
- Check posts include new fields (optional)

**Sitemap**:
- Navigate to `/sitemap-0.xml`
- Verify all posts listed
- Check `<lastmod>` dates

**Archive Page**:
- Navigate to `/archive`
- Verify all posts listed
- Check no layout issues

**Search**:
- Navigate to homepage
- Use search function
- Verify new posts searchable

**Success Criteria**:
- ✅ RSS feed valid
- ✅ Sitemap complete
- ✅ Archive page functional
- ✅ Search works for all posts

---

### Scenario 10: Real User Interaction

**Steps**:
1. Deploy to staging/production
2. Visit post with comments
3. Click "Sign in with GitHub"
4. Authorize Giscus app
5. Post a test comment
6. Add a reaction (👍)
7. Reply to your comment
8. Check GitHub Discussions

**Expected**:
- OAuth flow completes successfully
- Comment appears instantly in widget
- Comment visible in GitHub Discussions
- Reactions sync to GitHub
- Replies create threaded discussion

**Success Criteria**:
- ✅ Sign in works
- ✅ Comment posts successfully
- ✅ Reactions work
- ✅ Replies thread correctly
- ✅ GitHub Discussions updated

---

## Troubleshooting

### Widget Doesn't Load

**Check**:
1. GitHub Discussions enabled?
2. Giscus app installed?
3. repoId and categoryId correct?
4. Browser console for errors

**Common Issues**:
- Missing `data-repo-id` → widget shows error
- Wrong category → "Category not found" error
- CSP blocking script → check Content-Security-Policy headers

### Wrong Discussion Shown

**Check**:
1. Mapping strategy: pathname vs number
2. URL path matches expected
3. discussionNumber prop passed correctly

**Debug**:
- Inspect Giscus iframe src
- Check `data-mapping` attribute
- Verify discussion exists in GitHub

### Theme Mismatch

**Check**:
1. `data-theme` attribute set
2. CSS variables defined
3. System theme preference

**Fix**:
- Use `preferred_color_scheme` for system theme
- Or implement custom theme toggle integration

---

## Success Checklist

- [ ] GitHub Discussions enabled
- [ ] Giscus app installed
- [ ] Configuration obtained (repoId, categoryId)
- [ ] Types defined in src/types/giscus.ts
- [ ] GiscusComments.svelte created
- [ ] giscusConfig added to src/config.ts
- [ ] Schema extended in src/content/config.ts
- [ ] PostPage.astro integrated
- [ ] Test post created
- [ ] Documentation written
- [ ] All validation scenarios pass
- [ ] Production build succeeds
- [ ] Real comment posted successfully

---

## Next Steps

After validation:
1. Create more blog posts with comments enabled
2. Customize Giscus theme (optional)
3. Add theme toggle integration (optional)
4. Monitor GitHub Discussions for moderation
5. Consider adding comment count display (future feature)
