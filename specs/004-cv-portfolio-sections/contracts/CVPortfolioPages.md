# Interface Contracts: CV Portfolio Pages

**Feature**: [spec.md](../spec.md)  
**Date**: 2026-07-13  
**Status**: Phase 1 - Design

## Overview

This document defines the public interface contracts for the Experience and Education pages. These contracts specify the behavior, routes, and integration points that other parts of the system can depend on.

---

## 1. Page Route Contracts

### 1.1 Experience Page Route

**Contract ID**: `PAGE-ROUTE-EXPERIENCE`

**URL**: `/experience`

**HTTP Method**: GET

**Response Type**: HTML (Server-rendered static page)

**Status Codes**:
- `200 OK`: Page renders successfully
- `404 Not Found`: Should not occur (static page always exists)

**Response Headers**:
```
Content-Type: text/html; charset=utf-8
Cache-Control: public, max-age=3600
```

**Page Metadata**:
- **Title**: "Experience" (from i18n: `I18nKey.experience`)
- **Description**: "Experience" (from i18n: `I18nKey.experience`)
- **Canonical URL**: `[site-url]/experience`

**Guarantees**:
- ✅ Page always renders (content file must exist)
- ✅ Layout matches existing site pages (MainGridLayout)
- ✅ Responsive at all breakpoints (320px - 2560px)
- ✅ Light and dark mode support
- ✅ Accessibility: Semantic HTML with proper heading hierarchy

---

### 1.2 Education Page Route

**Contract ID**: `PAGE-ROUTE-EDUCATION`

**URL**: `/education`

**HTTP Method**: GET

**Response Type**: HTML (Server-rendered static page)

**Status Codes**:
- `200 OK`: Page renders successfully
- `404 Not Found`: Should not occur (static page always exists)

**Response Headers**:
```
Content-Type: text/html; charset=utf-8
Cache-Control: public, max-age=3600
```

**Page Metadata**:
- **Title**: "Education" (from i18n: `I18nKey.education`)
- **Description**: "Education" (from i18n: `I18nKey.education`)
- **Canonical URL**: `[site-url]/education`

**Guarantees**:
- ✅ Page always renders (content file must exist)
- ✅ Layout matches existing site pages (MainGridLayout)
- ✅ Responsive at all breakpoints (320px - 2560px)
- ✅ Light and dark mode support
- ✅ Accessibility: Semantic HTML with proper heading hierarchy

---

## 2. Content Collection Contract

### 2.1 Experience Content Entry

**Contract ID**: `CONTENT-SPEC-EXPERIENCE`

**Collection**: `spec`

**Slug**: `experience`

**File Location**: `src/content/spec/experience.md`

**Access Method**:
```typescript
import { getEntry, render } from "astro:content";

const experiencePost = await getEntry("spec", "experience");
if (!experiencePost) {
    throw new Error("Experience page content not found");
}
const { Content } = await render(experiencePost);
```

**Schema**: Empty object `z.object({})` (frontmatter optional)

**Content Format**: Markdown with:
- H1 heading (page title)
- H3 headings (entry titles)
- Formatted text (bullets, arrows, emphasis)
- Horizontal rules (entry separators)

**Guarantees**:
- ✅ File exists in repository
- ✅ Valid markdown syntax
- ✅ Accessible via Astro content collection API
- ✅ Renderable by Astro's render() function

---

### 2.2 Education Content Entry

**Contract ID**: `CONTENT-SPEC-EDUCATION`

**Collection**: `spec`

**Slug**: `education`

**File Location**: `src/content/spec/education.md`

**Access Method**:
```typescript
import { getEntry, render } from "astro:content";

const educationPost = await getEntry("spec", "education");
if (!educationPost) {
    throw new Error("Education page content not found");
}
const { Content } = await render(educationPost);
```

**Schema**: Empty object `z.object({})` (frontmatter optional)

**Content Format**: Markdown with:
- H1 heading (page title)
- H3 headings (entry titles)
- Formatted text (bullets, arrows, emphasis)
- Horizontal rules (entry separators)

**Guarantees**:
- ✅ File exists in repository
- ✅ Valid markdown syntax
- ✅ Accessible via Astro content collection API
- ✅ Renderable by Astro's render() function

---

## 3. Navigation Contract

### 3.1 Navigation Menu Integration

**Contract ID**: `NAV-MENU-CV-SECTIONS`

**Configuration Location**: `src/config.ts` → `navBarConfig.links[]`

**Link Definitions**:
```typescript
{
    name: "Experience",
    url: "/experience",
    external: false
}

{
    name: "Education",
    url: "/education",
    external: false
}
```

**Display Behavior**:
- **Position**: After "About" link, before external links (GitHub)
- **Active State**: Highlighted when on respective page
- **Mobile**: Responsive menu behavior (inherited from Navbar component)

**Guarantees**:
- ✅ Links visible in navigation menu on all pages
- ✅ Clicking navigates to correct route
- ✅ Active page indication works
- ✅ Keyboard navigation supported (tab, enter)
- ✅ Touch-friendly on mobile

---

## 4. Internationalization (i18n) Contract

### 4.1 i18n Key Definitions

**Contract ID**: `I18N-KEYS-CV-SECTIONS`

**Required Keys**:

| Key | English Value | Usage |
|-----|---------------|-------|
| `experience` | "Experience" | Page title, navigation link, metadata |
| `education` | "Education" | Page title, navigation link, metadata |

**Definition Location**: `src/i18n/i18nKey.ts`

```typescript
enum I18nKey {
    // ... existing keys
    experience = "experience",
    education = "education",
    // ... rest
}
```

**Translation Location**: `src/i18n/languages/en.ts` (and other language files)

```typescript
export const en: Translation = {
    // ... existing translations
    [Key.experience]: "Experience",
    [Key.education]: "Education",
    // ... rest
};
```

**Access Method**:
```typescript
import { i18n } from "../i18n/translation";
import I18nKey from "../i18n/i18nKey";

const experienceTitle = i18n(I18nKey.experience); // Returns: "Experience"
const educationTitle = i18n(I18nKey.education);   // Returns: "Education"
```

**Guarantees**:
- ✅ Keys exist in I18nKey enum
- ✅ Translations exist for site's configured language (default: English)
- ✅ i18n() function returns translated string
- ✅ Fallback to English if translation missing

---

## 5. Build Contract

### 5.1 Static Site Generation

**Contract ID**: `BUILD-SSG-CV-PAGES`

**Build Command**: `pnpm build`

**Output**:
- `dist/experience/index.html` (static HTML file)
- `dist/education/index.html` (static HTML file)

**Build Process**:
1. Astro reads page components from `src/pages/`
2. Fetches content from `src/content/spec/`
3. Renders markdown to HTML
4. Applies layouts and components
5. Generates static HTML files in `dist/`

**Guarantees**:
- ✅ Build succeeds without errors
- ✅ Static HTML files generated for both routes
- ✅ All assets (CSS, JS) included
- ✅ Pages accessible without JavaScript (progressive enhancement)

---

### 5.2 Type Checking Contract

**Contract ID**: `BUILD-TYPECHECK-CV-PAGES`

**Commands**:
- `pnpm check` (Astro check + TypeScript)
- `pnpm type-check` (TypeScript only)

**Guarantees**:
- ✅ No TypeScript errors in page components
- ✅ Content collection types valid
- ✅ Import paths resolve correctly
- ✅ i18n keys exist in enum

---

## 6. Visual Styling Contract

### 6.1 Layout and Styling

**Contract ID**: `STYLE-CV-PAGES`

**Layout Component**: `MainGridLayout`

**Card Styling**: Uses existing `card-base` class

**Markdown Styling**: Uses existing `Markdown` component with styles from:
- `src/styles/markdown.css`
- `src/styles/markdown-extend.styl`

**Theme Variables**: Uses CSS custom properties from `src/styles/variables.styl`

**Responsive Breakpoints**: (inherited from Tailwind/existing styles)
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

**Guarantees**:
- ✅ Visual consistency with existing pages (About, Archive)
- ✅ Proper text rendering (font, size, line-height)
- ✅ Bullet and arrow symbols render correctly
- ✅ Proper spacing and padding at all breakpoints
- ✅ Readable in both light and dark modes
- ✅ No horizontal scroll on any screen size

---

## 7. Accessibility Contract

### 7.1 Semantic HTML and ARIA

**Contract ID**: `A11Y-CV-PAGES`

**Heading Hierarchy**:
- H1: Page title ("Experience" or "Education")
- H2: Optional section headings
- H3: Individual entry titles

**Navigation**:
- ✅ Links have descriptive text
- ✅ Active link indicated (visual + ARIA)
- ✅ Keyboard navigable (tab order)

**Screen Reader Support**:
- ✅ Proper heading structure for navigation
- ✅ Lists rendered as semantic `<ul>`/`<ol>` elements
- ✅ Emphasis tags (`<strong>`, `<em>`) for importance

**Guarantees**:
- ✅ No heading level skips
- ✅ Sufficient color contrast (WCAG AA)
- ✅ Keyboard accessible
- ✅ Screen reader friendly

---

## 8. Performance Contract

### 8.1 Page Load Performance

**Contract ID**: `PERF-CV-PAGES`

**Metrics** (target values):
- **First Contentful Paint (FCP)**: < 1.0s
- **Largest Contentful Paint (LCP)**: < 2.0s
- **Time to Interactive (TTI)**: < 2.5s
- **Total Page Weight**: < 500KB (including assets)

**Optimization Strategies**:
- Static HTML generation (no client-side rendering delay)
- Minimal JavaScript (only theme switcher)
- CSS inlined for critical path
- Images optimized if any added in future

**Guarantees**:
- ✅ Comparable performance to existing pages (About, Archive)
- ✅ No performance regressions vs. baseline
- ✅ Fast load on 3G networks

---

## 9. Version Contract

### 9.1 Content Versioning

**Contract ID**: `VERSION-CV-CONTENT`

**Version Control**: Git repository

**Update Process**:
1. Edit markdown files in `src/content/spec/`
2. Commit changes with descriptive message
3. Push to repository
4. Deploy triggers rebuild (Vercel auto-deploy)

**Guarantees**:
- ✅ All changes tracked in Git history
- ✅ Rollback possible via Git revert/checkout
- ✅ No database migrations required for content updates
- ✅ No API version compatibility concerns

---

## Contract Validation Checklist

Use this checklist during implementation to verify all contracts are satisfied:

### Route Contracts
- [ ] `/experience` returns 200 OK
- [ ] `/education` returns 200 OK
- [ ] Both pages have correct metadata (title, description)

### Content Contracts
- [ ] `getEntry("spec", "experience")` returns content
- [ ] `getEntry("spec", "education")` returns content
- [ ] Content renders without errors

### Navigation Contracts
- [ ] Experience link appears in navigation
- [ ] Education link appears in navigation
- [ ] Links navigate to correct pages
- [ ] Active state indicates current page

### i18n Contracts
- [ ] `I18nKey.experience` exists
- [ ] `I18nKey.education` exists
- [ ] Translations exist in en.ts
- [ ] `i18n()` function returns correct strings

### Build Contracts
- [ ] `pnpm build` succeeds
- [ ] `dist/experience/index.html` exists
- [ ] `dist/education/index.html` exists
- [ ] `pnpm check` passes

### Visual Contracts
- [ ] Pages match existing site design
- [ ] Responsive on mobile (320px+)
- [ ] Light and dark modes work
- [ ] No layout breaks

### Accessibility Contracts
- [ ] Proper heading hierarchy
- [ ] Keyboard navigable
- [ ] Sufficient contrast
- [ ] Screen reader friendly

### Performance Contracts
- [ ] FCP < 1.0s
- [ ] LCP < 2.0s
- [ ] No performance regressions

---

## Phase 1 Completion Status

✅ All interface contracts defined  
✅ Route contracts specified  
✅ Content collection contracts documented  
✅ Navigation contracts established  
✅ i18n contracts defined  
✅ Build contracts specified  
✅ Visual styling contracts documented  
✅ Accessibility contracts defined  
✅ Performance contracts established  
✅ Validation checklist created  

**Ready to proceed to Quickstart guide creation**
