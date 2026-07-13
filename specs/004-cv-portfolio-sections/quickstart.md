# Quickstart Validation Guide: CV Portfolio Sections

**Feature**: [spec.md](spec.md)  
**Date**: 2026-07-13  
**Status**: Phase 1 - Design

## Overview

This guide provides runnable validation scenarios to verify that the Experience and Education pages work correctly end-to-end. Follow these steps to validate the feature after implementation.

---

## Prerequisites

Before running validation scenarios:

- ✅ Node.js 18+ installed
- ✅ pnpm package manager installed
- ✅ Repository cloned and dependencies installed (`pnpm install`)
- ✅ All implementation files created (see [data-model.md](data-model.md) and [contracts](contracts/))

---

## Quick Validation Commands

```bash
# Navigate to project root
cd /path/to/pixel-pistons

# Install dependencies (if not done already)
pnpm install

# Run type checking
pnpm check

# Start development server
pnpm dev

# Build production site
pnpm build

# Preview production build
pnpm preview
```

---

## Validation Scenario 1: Development Server

**Goal**: Verify pages render correctly in development mode

**Prerequisites**: Implementation complete

**Steps**:

1. **Start development server**:
   ```bash
   pnpm dev
   ```

2. **Expected Output**:
   ```
   astro  v5.x.x ready in XXX ms

   ┃ Local    http://localhost:4321/
   ┃ Network  use --host to expose
   ```

3. **Navigate to Experience page**:
   - Open browser to: `http://localhost:4321/experience`
   - **Expected**: Page loads without errors
   - **Expected**: Navigation menu shows "Experience" link (highlighted)
   - **Expected**: Content displays with proper formatting (bullets, arrows, headings)

4. **Navigate to Education page**:
   - Click "Education" link in navigation OR navigate to: `http://localhost:4321/education`
   - **Expected**: Page loads without errors
   - **Expected**: Navigation menu shows "Education" link (highlighted)
   - **Expected**: Content displays with proper formatting

5. **Visual Checks**:
   - ✅ Page title shows "Experience" or "Education"
   - ✅ Layout matches About page design (card with padding)
   - ✅ Headings render with proper hierarchy (H1 > H3)
   - ✅ Bullet symbols (•, ◦) display correctly
   - ✅ Arrow symbols (→, ⇒) display correctly
   - ✅ Bold and italic text renders correctly
   - ✅ Horizontal rules separate entries

6. **Theme Toggle**:
   - Click theme switcher (light/dark mode toggle)
   - **Expected**: Page styling updates smoothly
   - **Expected**: Text remains readable in both modes
   - **Expected**: Background colors adapt appropriately

7. **Stop server**: `Ctrl+C`

**Success Criteria**: All checks pass, no console errors

---

## Validation Scenario 2: Responsive Design

**Goal**: Verify pages work on different screen sizes

**Prerequisites**: Development server running (`pnpm dev`)

**Steps**:

1. **Open browser DevTools**: `F12` or right-click → Inspect

2. **Toggle device toolbar**: `Ctrl+Shift+M` (or Cmd+Shift+M on Mac)

3. **Test Mobile View** (iPhone SE - 375x667):
   - Navigate to `/experience`
   - **Expected**: Content wraps properly, no horizontal scroll
   - **Expected**: Navigation menu accessible (mobile menu)
   - **Expected**: Text readable (appropriate font size)
   - **Expected**: Proper spacing and padding

4. **Test Tablet View** (iPad - 768x1024):
   - Navigate to `/education`
   - **Expected**: Layout adjusts appropriately
   - **Expected**: Wider content area than mobile
   - **Expected**: Navigation visible

5. **Test Desktop View** (1920x1080):
   - Navigate to `/experience`
   - **Expected**: Optimal layout with appropriate max-width
   - **Expected**: Sidebar visible (if applicable)
   - **Expected**: Comfortable reading width

6. **Test Narrow Mobile** (320px width):
   - Set custom dimensions: 320x568
   - Navigate to `/education`
   - **Expected**: No layout breaks
   - **Expected**: Long company/institution names wrap
   - **Expected**: No horizontal overflow

**Success Criteria**: Pages render correctly at all tested breakpoints

---

## Validation Scenario 3: Navigation Integration

**Goal**: Verify navigation links work correctly

**Prerequisites**: Development server running

**Steps**:

1. **Navigate to Home page**: `http://localhost:4321/`

2. **Check navigation menu**:
   - **Expected**: "Experience" link visible
   - **Expected**: "Education" link visible
   - **Expected**: Links positioned after "About", before "GitHub"

3. **Click "Experience" link**:
   - **Expected**: Navigate to `/experience`
   - **Expected**: "Experience" link highlighted/active in menu
   - **Expected**: Page renders correctly

4. **Click "Education" link**:
   - **Expected**: Navigate to `/education`
   - **Expected**: "Education" link highlighted/active in menu
   - **Expected**: Page renders correctly

5. **Keyboard Navigation**:
   - Press `Tab` repeatedly to navigate through links
   - **Expected**: Focus indicator visible on links
   - **Expected**: Can reach Experience and Education links
   - Press `Enter` on focused link
   - **Expected**: Navigation works

6. **Back/Forward Browser Buttons**:
   - Click browser back button
   - **Expected**: Navigate to previous page
   - Click browser forward button
   - **Expected**: Navigate forward

**Success Criteria**: All navigation methods work, active state updates correctly

---

## Validation Scenario 4: Content Rendering

**Goal**: Verify markdown content renders with proper formatting

**Prerequisites**: Development server running, content files populated with CV data

**Steps**:

1. **Navigate to Experience page**: `/experience`

2. **Check Heading Hierarchy**:
   - Inspect page structure (DevTools → Elements)
   - **Expected**: One `<h1>` element (page title)
   - **Expected**: Multiple `<h3>` elements (job titles)
   - **Expected**: No skipped heading levels

3. **Check Bullet Lists**:
   - **Expected**: Bullet symbols (•, ◦) display correctly (not escaped Unicode)
   - **Expected**: Proper indentation for nested bullets
   - **Expected**: Lists render as `<ul>` or `<li>` elements

4. **Check Emphasis**:
   - **Expected**: Bold text uses `<strong>` or `<b>` tags
   - **Expected**: Italic text uses `<em>` or `<i>` tags
   - **Expected**: Visual distinction clear

5. **Check Horizontal Rules**:
   - **Expected**: Visible separators between entries
   - **Expected**: Rendered as `<hr>` elements with appropriate styling

6. **Check Arrows and Symbols**:
   - **Expected**: Arrow symbols (→, ⇒) display correctly
   - **Expected**: Not escaped as HTML entities
   - **Expected**: Visually distinct from regular text

7. **Repeat for Education page**: `/education`

**Success Criteria**: All markdown formatting renders correctly, symbols display properly

---

## Validation Scenario 5: Type Checking

**Goal**: Verify TypeScript type safety

**Prerequisites**: Implementation complete

**Steps**:

1. **Run type checker**:
   ```bash
   pnpm check
   ```

2. **Expected Output**:
   ```
   XX:XX:XX [check] Checking files...
   Result (X files):
   - 0 errors
   - 0 warnings
   - 0 hints
   ```

3. **Alternative (TypeScript only)**:
   ```bash
   pnpm type-check
   ```

4. **Expected**: No TypeScript errors in:
   - `src/pages/experience.astro`
   - `src/pages/education.astro`
   - `src/config.ts` (navigation config)
   - `src/i18n/i18nKey.ts` (enum keys)
   - `src/i18n/languages/en.ts` (translations)

**Success Criteria**: Zero TypeScript errors, all types resolve correctly

---

## Validation Scenario 6: Production Build

**Goal**: Verify feature works in production build

**Prerequisites**: Implementation complete

**Steps**:

1. **Clean previous builds** (optional):
   ```bash
   rm -rf dist/
   ```

2. **Run production build**:
   ```bash
   pnpm build
   ```

3. **Expected Output**:
   ```
   building client (vite)
   ✓ built in XXXms
   
   building server (vite)
   ✓ built in XXXms
   
   [build] XX page(s) built in X.XXs
   ```

4. **Verify static files generated**:
   ```bash
   ls -la dist/experience/
   ls -la dist/education/
   ```

5. **Expected**:
   ```
   dist/experience/index.html (should exist)
   dist/education/index.html (should exist)
   ```

6. **Preview production build**:
   ```bash
   pnpm preview
   ```

7. **Expected Output**:
   ```
   preview  v5.x.x

   ┃ Local    http://localhost:4322/
   ```

8. **Test in browser**:
   - Navigate to: `http://localhost:4322/experience`
   - **Expected**: Page loads (same as dev mode)
   - Navigate to: `http://localhost:4322/education`
   - **Expected**: Page loads (same as dev mode)

9. **Check page source** (right-click → View Page Source):
   - **Expected**: Fully rendered HTML (not skeleton)
   - **Expected**: Content visible in source (SEO-friendly)
   - **Expected**: Meta tags present

**Success Criteria**: Build succeeds, static files generated, preview works

---

## Validation Scenario 7: Accessibility

**Goal**: Verify accessibility compliance

**Prerequisites**: Development server running

**Steps**:

1. **Navigate to Experience page**: `/experience`

2. **Open DevTools Accessibility Inspector**:
   - Chrome: DevTools → Lighthouse tab
   - Firefox: DevTools → Accessibility tab

3. **Run Lighthouse Accessibility Audit** (Chrome):
   - Click "Generate report" (select "Accessibility" only)
   - **Expected Score**: ≥ 90 (ideally 100)

4. **Keyboard Navigation Test**:
   - Close mouse (don't use mouse)
   - Press `Tab` to navigate through interactive elements
   - **Expected**: All links reachable
   - **Expected**: Visible focus indicator
   - Press `Enter` on links
   - **Expected**: Navigation works

5. **Screen Reader Test** (if available):
   - Enable screen reader (NVDA on Windows, VoiceOver on Mac)
   - Navigate through page
   - **Expected**: Headings announced correctly
   - **Expected**: Lists announced as lists
   - **Expected**: Links announced with descriptive text

6. **Contrast Check**:
   - Use browser contrast checker tool (DevTools → Accessibility)
   - **Expected**: All text meets WCAG AA standards (4.5:1 for normal text)

7. **Repeat for Education page**: `/education`

**Success Criteria**: Lighthouse score ≥ 90, keyboard navigable, sufficient contrast

---

## Validation Scenario 8: Cross-Browser Testing

**Goal**: Verify compatibility across browsers

**Prerequisites**: Development or preview server running

**Browsers to Test**:
- Chrome/Edge (Chromium)
- Firefox
- Safari (if on Mac)

**Steps** (repeat for each browser):

1. **Open browser and navigate to**:
   - `/experience`
   - `/education`

2. **Check rendering**:
   - **Expected**: Layout identical to Chrome
   - **Expected**: Symbols (bullets, arrows) display correctly
   - **Expected**: Fonts render properly

3. **Test theme switcher**:
   - **Expected**: Works in all browsers

4. **Test navigation**:
   - **Expected**: Links work in all browsers

**Success Criteria**: Consistent behavior across all tested browsers

---

## Validation Scenario 9: Performance

**Goal**: Verify acceptable page load performance

**Prerequisites**: Production build running (`pnpm build && pnpm preview`)

**Steps**:

1. **Navigate to**: `http://localhost:4322/experience`

2. **Open DevTools → Network tab**:
   - Disable cache
   - Refresh page
   - **Expected Metrics**:
     - Total page size: < 500KB
     - Number of requests: < 20
     - Load time: < 2 seconds (local)

3. **Open DevTools → Performance tab**:
   - Record page load
   - **Expected Metrics**:
     - First Contentful Paint (FCP): < 1.0s
     - Largest Contentful Paint (LCP): < 2.0s
     - Time to Interactive (TTI): < 2.5s

4. **Lighthouse Performance Audit**:
   - Run Lighthouse (Performance category)
   - **Expected Score**: ≥ 90

5. **Repeat for Education page**: `/education`

**Success Criteria**: Performance comparable to existing pages (About, Archive)

---

## Validation Scenario 10: Content Update

**Goal**: Verify content can be easily updated

**Prerequisites**: Implementation complete

**Steps**:

1. **Edit Experience content**:
   ```bash
   # Open in editor
   code src/content/spec/experience.md
   ```

2. **Make a change**:
   - Add a new bullet point to an existing entry
   - Save file

3. **Development server** (if running):
   - **Expected**: Page hot-reloads automatically
   - **Expected**: Change visible immediately

4. **Production build**:
   ```bash
   pnpm build
   ```
   - **Expected**: Build succeeds
   - **Expected**: Change reflected in `dist/experience/index.html`

5. **Preview**:
   ```bash
   pnpm preview
   ```
   - Navigate to `/experience`
   - **Expected**: Updated content visible

6. **Revert change** (or commit if desired)

**Success Criteria**: Content updates work smoothly, no build errors

---

## Troubleshooting

### Issue: Page returns 404

**Diagnosis**:
- Check file exists: `src/pages/experience.astro` or `src/pages/education.astro`
- Check content exists: `src/content/spec/experience.md` or `src/content/spec/education.md`
- Restart dev server

### Issue: Content not rendering

**Diagnosis**:
- Check `getEntry("spec", "experience")` doesn't return null
- Verify markdown file is in correct location
- Check for syntax errors in markdown
- Check console for error messages

### Issue: Navigation link missing

**Diagnosis**:
- Check `src/config.ts` has navigation link entries
- Verify `name` and `url` properties set correctly
- Clear browser cache and refresh

### Issue: TypeScript errors

**Diagnosis**:
- Check `I18nKey.experience` and `I18nKey.education` exist in enum
- Verify translations exist in `en.ts`
- Run `pnpm check` to see specific errors
- Check import paths are correct

### Issue: Symbols (bullets/arrows) show as question marks

**Diagnosis**:
- Check file encoding is UTF-8
- Verify font supports Unicode symbols
- Check browser/OS font rendering

### Issue: Layout broken on mobile

**Diagnosis**:
- Check for horizontal overflow (use DevTools)
- Verify no fixed widths preventing responsive behavior
- Check existing About page for comparison

---

## Validation Completion Checklist

Use this checklist to track validation progress:

- [ ] ✅ Scenario 1: Development server (pages render)
- [ ] ✅ Scenario 2: Responsive design (all breakpoints)
- [ ] ✅ Scenario 3: Navigation integration (links work)
- [ ] ✅ Scenario 4: Content rendering (formatting correct)
- [ ] ✅ Scenario 5: Type checking (no errors)
- [ ] ✅ Scenario 6: Production build (static files generated)
- [ ] ✅ Scenario 7: Accessibility (keyboard, contrast, screen reader)
- [ ] ✅ Scenario 8: Cross-browser (Chrome, Firefox, Safari)
- [ ] ✅ Scenario 9: Performance (FCP, LCP, TTI)
- [ ] ✅ Scenario 10: Content update (edit and rebuild)

**All scenarios passing?** ✅ Feature ready for deployment!

---

## References

- **Data Model**: [data-model.md](data-model.md) - Entity structures and formatting patterns
- **Contracts**: [contracts/CVPortfolioPages.md](contracts/CVPortfolioPages.md) - Interface specifications
- **Research**: [research.md](research.md) - Technical decisions and best practices
- **Spec**: [spec.md](spec.md) - Feature requirements and user scenarios

---

## Phase 1 Completion Status

✅ Validation scenarios defined  
✅ Prerequisites documented  
✅ Step-by-step instructions provided  
✅ Expected outcomes specified  
✅ Troubleshooting guide included  
✅ Validation checklist created  

**Phase 1 (Design & Contracts) Complete** ✓

**Ready to proceed to Agent Context Update**
