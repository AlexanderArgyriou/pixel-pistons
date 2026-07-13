# Research: Professional CV Portfolio Sections

**Feature**: [spec.md](spec.md)  
**Date**: 2026-07-13  
**Status**: Phase 0 Complete

## Overview

This document consolidates research findings for implementing Experience and Education pages in the Pixel Piston blog. Research covers existing architectural patterns, content formatting best practices, and integration points.

---

## 1. Existing About Page Pattern

**Decision**: Follow the exact pattern established by `about.astro` and `about.md`

**Rationale**:
- Proven pattern already working in production
- Uses Astro content collections for type-safe content management
- Minimal code required (< 30 lines per page)
- Automatic markdown rendering with existing styles
- No custom components needed

**Pattern Details**:
```typescript
// Page component structure (src/pages/about.astro)
import { getEntry, render } from "astro:content";
import MainGridLayout from "../layouts/MainGridLayout.astro";
import Markdown from "@components/misc/Markdown.astro";

const aboutPost = await getEntry("spec", "about");
const { Content } = await render(aboutPost);

<MainGridLayout title={title} description={description}>
    <div class="flex w-full rounded-[var(--radius-large)] overflow-hidden relative min-h-32">
        <div class="card-base z-10 px-9 py-6 relative w-full">
            <Markdown class="mt-2">
                <Content />
            </Markdown>
        </div>
    </div>
</MainGridLayout>
```

**Content Storage**:
- Location: `src/content/spec/[page-name].md`
- Collection: `spec` (defined in `src/content/config.ts`)
- Schema: Flexible (empty object `z.object({})`)
- No frontmatter required (though optional metadata can be added)

**Alternatives Considered**:
- ❌ Custom page component with hardcoded content → Less maintainable, harder to edit
- ❌ JSON/YAML data files → Markdown better for rich text formatting
- ❌ External CMS → Adds complexity, violates minimal change principle

---

## 2. Navigation Integration

**Decision**: Add navigation links via `src/config.ts` `navBarConfig.links` array

**Rationale**:
- Configuration-first approach (aligns with constitution principle)
- Single file modification point
- TypeScript type safety with `NavBarLink` type
- Consistent with existing Home/Archive/About links

**Implementation Pattern**:
```typescript
// src/config.ts
export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		LinkPreset.About,
		// ADD NEW LINKS HERE:
		{ name: "Experience", url: "/experience", external: false },
		{ name: "Education", url: "/education", external: false },
		{
			name: "GitHub",
			url: "https://github.com/AlexanderArgyriou",
			external: true,
		},
	],
};
```

**Alternatives Considered**:
- ❌ Modify Navbar.astro component → Violates preservation principle
- ❌ Create LinkPreset constants → Overkill for 2 simple internal links
- ✅ Direct link objects → Simplest, follows existing GitHub link pattern

---

## 3. Internationalization (i18n) Setup

**Decision**: Add `experience` and `education` keys to i18n system

**Rationale**:
- Site uses i18n for all page titles
- Maintains consistency with existing pages
- Supports future multilingual expansion
- Title/description text should not be hardcoded

**Required Changes**:
1. Add to `src/i18n/i18nKey.ts`:
   ```typescript
   enum I18nKey {
       // ... existing keys
       about = "about",
       experience = "experience",  // NEW
       education = "education",    // NEW
       // ... rest
   }
   ```

2. Add to `src/i18n/languages/en.ts` (and other language files if desired):
   ```typescript
   export const en: Translation = {
       // ... existing translations
       [Key.about]: "About",
       [Key.experience]: "Experience",    // NEW
       [Key.education]: "Education",      // NEW
       // ... rest
   };
   ```

**English-Only Assumption**: Per spec assumptions, only English translations required for v1. Other language files can use English fallback or be added later.

---

## 4. Markdown Formatting Best Practices

**Decision**: Use Unicode symbols, semantic HTML via markdown, and visual hierarchy for "beautiful and organized" requirement

**Rationale**:
- User explicitly requested bullets, arrows, and rich formatting
- Markdown supports Unicode symbols natively
- Existing markdown rendering pipeline handles this automatically
- No custom CSS or components needed

**Visual Formatting Patterns**:

### 4.1 Bullets and Lists
```markdown
• Primary bullet (U+2022 BULLET)
  ◦ Secondary bullet (U+25E6 WHITE BULLET)
    ▪ Tertiary bullet (U+25AA BLACK SMALL SQUARE)
    
- Unordered list item
  - Nested list item
  
1. Ordered list item
2. Second item
```

### 4.2 Arrows and Connectors
```markdown
→ Simple right arrow (U+2192)
⇒ Double right arrow (U+21D2)
↦ Maps to arrow (U+21A6)
⟶ Long right arrow (U+27F6)

Example usage:
**Role** → **Impact** → **Outcome**
**Input** ⇒ **Process** ⇒ **Output**
```

### 4.3 Visual Hierarchy
```markdown
# Page Title (H1)

## Section Title (H2) - e.g., "Professional Experience"

### Entry Title (H3) - e.g., Company Name + Role

**Bold** for emphasis (company names, job titles, degrees)
*Italic* for secondary emphasis (locations, dates)
`Code` for technical terms/technologies

---
Horizontal rule (thematic break between sections)
```

### 4.4 Date Formatting
```markdown
*Month YYYY – Month YYYY* (e.g., *January 2020 – Present*)
*Month YYYY – Present*
*YYYY* (for education graduation years)
```

### 4.5 Example CV Entry Structure
```markdown
### Senior Software Engineer • Company Name

*Location* | *Month YYYY – Present*

**Key Responsibilities:**
• Designed and implemented X system handling Y scale
• Led team of N engineers in building Z feature
  ◦ Reduced latency by X%
  ◦ Improved reliability to Y nines
• Architected solution for [technical challenge]

**Technologies:** Java, Spring Boot, Kubernetes, PostgreSQL

**Impact:**
→ Increased system throughput by 300%
→ Reduced deployment time from 2 hours to 15 minutes

---
```

---

## 5. Content Extraction Strategy

**Decision**: Manual extraction and transformation from CV PDF to markdown

**Rationale**:
- CV content is relatively static (infrequent updates)
- One-time effort for feature v1
- Allows manual curation and formatting control
- PDF parsing tools often produce poor quality output requiring manual cleanup anyway
- Manual process ensures "beautiful and organized" quality standard is met

**Process**:
1. Review CV PDF (alex_argyriou_cv (1).pdf)
2. Extract text content for each experience/education entry
3. Transform into markdown following formatting patterns (section 4.4 above)
4. Organize chronologically (most recent first)
5. Apply rich formatting (bullets, arrows, emphasis)
6. Validate rendering in dev mode

**Alternatives Considered**:
- ❌ Automated PDF parsing → Output quality insufficient, requires manual cleanup anyway
- ❌ Structured data (JSON) + template → Less flexible, harder to edit, defeats markdown benefits
- ✅ Manual markdown authoring → Best quality control, most maintainable

**Note**: CV PDF inspection required during Phase 1 to extract actual content.

---

## 6. Responsive Design Considerations

**Decision**: Inherit responsive behavior from MainGridLayout and existing styles

**Rationale**:
- MainGridLayout already handles responsive breakpoints
- Markdown component has responsive typography
- No custom responsive code needed
- Maintains visual consistency with About page

**Verified Responsive Features** (from existing About page):
- ✅ Card layout with proper padding at all breakpoints
- ✅ Text wrapping and line breaks on mobile
- ✅ Readable font sizes across devices
- ✅ Touch-friendly spacing on mobile

**Edge Case Handling**:
- Long company/institution names → Natural text wrapping
- Long bullet lists → Scrollable container (card-base handles overflow)
- Nested bullets → Markdown indentation maintains structure

---

## 7. Light/Dark Mode Theme Support

**Decision**: No custom theme code needed - automatic inheritance

**Rationale**:
- MainGridLayout includes theme switching infrastructure
- Markdown component uses CSS custom properties that adapt to theme
- card-base class handles background colors automatically
- All text uses theme-aware color classes

**Verification**: Existing About page demonstrates this works correctly - new pages automatically inherit same behavior.

---

## 8. SEO and Metadata

**Decision**: Use page titles and descriptions in MainGridLayout

**Rationale**:
- MainGridLayout accepts `title` and `description` props
- Generates proper HTML meta tags automatically
- Consistent with About page pattern

**Implementation**:
```typescript
<MainGridLayout 
    title={i18n(I18nKey.experience)} 
    description={i18n(I18nKey.experience)}
>
```

**Note**: Description can be customized if more detailed SEO text is desired, but page title is sufficient for v1.

---

## 9. Build and Deployment

**Decision**: No build configuration changes required

**Rationale**:
- Static pages generated at build time (Astro SSG)
- Content collections automatically processed
- Routes automatically created from src/pages/
- Vercel deployment config doesn't need updates

**Verification Steps**:
1. `pnpm dev` → Verify pages render locally
2. `pnpm check` → Type checking passes
3. `pnpm build` → Static site generation succeeds
4. Verify `/experience` and `/education` routes exist in dist/

---

## Summary: Key Technical Decisions

| Aspect | Decision | Justification |
|--------|----------|---------------|
| **Page Architecture** | Mirror about.astro pattern | Proven, minimal code, type-safe |
| **Content Storage** | src/content/spec/ markdown files | Easy to edit, rich formatting, version control |
| **Navigation** | Add links to src/config.ts | Configuration-first, single point of change |
| **i18n** | Add experience/education keys | Consistency with existing pages |
| **Formatting** | Unicode symbols + markdown | Beautiful output, no custom components |
| **Content Source** | Manual extraction from CV PDF | Best quality control, one-time effort |
| **Responsive** | Inherit from MainGridLayout | Zero custom code needed |
| **Theming** | Automatic inheritance | No custom theme code needed |
| **SEO** | MainGridLayout metadata props | Consistent with existing pages |
| **Build** | No changes needed | Static generation handles it |

---

## Phase 1 Readiness

✅ All technical unknowns resolved  
✅ Architecture decisions documented  
✅ Best practices for markdown formatting defined  
✅ Integration points identified  
✅ No NEEDS CLARIFICATION markers remain  

**Ready to proceed to Phase 1: Design & Contracts**
