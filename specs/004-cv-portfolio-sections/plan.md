# Implementation Plan: Professional CV Portfolio Sections

**Branch**: `004-cv-portfolio-sections` | **Date**: 2026-07-13 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/004-cv-portfolio-sections/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add two new professional portfolio sections to the blog: **Experience** and **Education**. Each section will be a dedicated page displaying CV content extracted from the provided PDF file (alex_argyriou_cv (1).pdf) in a beautifully formatted markdown structure with bullets, arrows, emphasis, and visual hierarchy. Pages follow the existing About page pattern using the Astro content collection system, maintain full responsive design, and integrate seamlessly into the site navigation.

**Technical Approach**: Leverage existing content collection infrastructure (src/content/spec/), create two new Astro page components mirroring about.astro, add navigation links to src/config.ts, and author rich markdown content with Unicode symbols and formatting for visual appeal.

## Technical Context

**Framework**: Astro 5.x with Svelte integration (Fuwari template base)

**Styling**: Tailwind CSS 3.x + custom Stylus for markdown rendering

**Content**: Markdown with remark/rehype plugins (`src/plugins/`)

**Build**: Vite-based (via Astro), pnpm package manager

**Search**: Pagefind (integrated in build: `pnpm build`)

**Deployment**: Vercel (serverless edge runtime)

**Testing**: Manual validation in dev mode (`pnpm dev`), type checking (`pnpm check`), linting/formatting (Biome)

**Quality Gates**: `pnpm check`, `pnpm type-check`, `pnpm format`, `pnpm lint`, `pnpm build`

**Performance Goals**: Fast page loads (<2s), smooth transitions, mobile-responsive

**Constraints**: No breaking changes to existing Fuwari structure, minimal file modifications, configuration-first approach

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Preservation-First**: Does this feature modify core Fuwari structure?
- [x] NO modifications to existing layouts/components/styles OR justified as critical bug fix
  - ✅ Zero changes to existing components, layouts, or styles
  - ✅ Reuses existing MainGridLayout and Markdown components without modification
- [x] Feature can be added through extension rather than modification
  - ✅ Adds new page files (experience.astro, education.astro)
  - ✅ Adds new content files (experience.md, education.md)
  - ⚠️ Modifies src/config.ts to add navigation links (minimal, configuration-based)

**Minimal Change**: Can this be achieved with fewer file changes?
- [x] Configuration changes explored before code changes
  - ✅ Navigation links added via src/config.ts (configuration approach)
  - ✅ Content stored in existing content collection system
- [x] New functionality isolated in new files
  - ✅ Two new page components: src/pages/experience.astro, src/pages/education.astro
  - ✅ Two new content files: src/content/spec/experience.md, src/content/spec/education.md
- [x] Existing file modifications are surgical and targeted
  - ⚠️ Only src/config.ts modified (add 2 navigation links to navBarConfig.links array)
- [x] Clear rollback path identified
  - ✅ Remove 4 new files, revert src/config.ts to remove 2 navigation links

**Component Isolation**: Is feature properly isolated?
- [x] New components in dedicated files (src/components/ or src/plugins/)
  - ✅ No new reusable components needed - pages use existing components
  - ✅ Each page is self-contained (experience.astro, education.astro)
- [x] Dependencies explicitly declared
  - ✅ Pages import from existing components (MainGridLayout, Markdown)
  - ✅ Content schema uses existing collection type
- [x] Independently testable in isolation
  - ✅ Each page navigable and testable independently
- [x] No implicit global coupling
  - ✅ No global state modifications

**Configuration Over Code**: Are settings configurable?
- [x] Behavior configurable via src/config.ts or astro.config.mjs
  - ✅ Navigation links configured in src/config.ts
  - ✅ Content editable via markdown files
- [x] No hardcoded magic values in component logic
  - ✅ Page components follow same pattern as about.astro
- [x] New constants in src/constants/ or config files
  - ✅ Content collection names follow existing pattern
- [x] TypeScript types for all config options
  - ✅ Uses existing NavBarLink type from config

**Development Validation**: Can this be validated before commit?
- [x] Testable with `pnpm dev`
  - ✅ Navigate to /experience and /education to verify
- [x] Build completes with `pnpm build`
  - ✅ Static pages generated at build time
- [x] Type-safe: passes `pnpm check` and `pnpm type-check`
  - ✅ Uses existing types, no new type definitions needed
- [x] No breaking changes to routes/RSS/sitemap
  - ✅ Adds new routes, doesn't modify existing ones
- [x] Light and dark mode both supported
  - ✅ Uses existing layout components with theme support
- [x] Mobile responsive
  - ✅ Inherits responsive behavior from MainGridLayout

✅ **CONSTITUTION CHECK PASSED** - All principles satisfied with minimal file additions

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

**Astro Blog Structure** (Fuwari template - PRESERVE existing structure):

```text
src/
├── components/           # Existing components (preserve structure)
│   ├── [NEW_FEATURE]/   # New feature components go here
│   ├── control/
│   ├── misc/
│   └── widget/
├── content/             # Markdown content + schema
│   ├── config.ts       # Content collections schema
│   └── posts/          # Blog posts
├── layouts/            # Page layouts (minimal changes)
├── pages/              # Astro pages/routes (minimal changes)
├── plugins/            # Remark/rehype plugins for markdown
│   └── [new-plugin]/   # New plugins go here
├── styles/             # Global styles (avoid modifying)
├── utils/              # Utility functions
└── config.ts           # Site configuration (prefer changes here)

public/                 # Static assets
├── favicon/
└── [feature-assets]/   # New feature static files

[Root config files - modify only as needed]
astro.config.mjs        # Build config, integrations
tailwind.config.cjs     # Tailwind configuration
biome.json              # Linting/formatting
```

**Feature Addition Pattern**:
- New components → `src/components/[feature-name]/`
- New plugins → `src/plugins/[plugin-name]/`
- Configuration → `src/config.ts` (preferred) or `astro.config.mjs`
- Static assets → `public/[feature-name]/`
- Content schema changes → `src/content/config.ts`

**Minimal Change Strategy**: [Document which existing files MUST be modified and justify why configuration-only approach isn't sufficient]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

✅ **NO VIOLATIONS** - All constitution principles satisfied

**Summary**:
- Zero modifications to existing Fuwari components, layouts, or styles
- Configuration-based navigation changes only (src/config.ts)
- New functionality isolated in 4 new files (2 pages + 2 content files)
- Minimal i18n additions (2 keys + translations)
- No custom components or plugins needed
- Uses existing infrastructure throughout

**File Impact**:
- **New Files**: 4 (experience.astro, education.astro, experience.md, education.md)
- **Modified Files**: 3 (src/config.ts for nav, src/i18n/i18nKey.ts, src/i18n/languages/en.ts)
- **Total Changes**: 7 files (all minimal, surgical additions)

**Rollback Complexity**: Low (remove 4 files, revert 3 files)

---

## Post-Phase 1 Constitution Re-Evaluation

**Re-evaluated**: 2026-07-13 after Phase 1 design completion

### Preservation-First (Re-check)
- ✅ CONFIRMED: Zero changes to existing layouts/components/styles
- ✅ CONFIRMED: MainGridLayout and Markdown components reused as-is
- ✅ CONFIRMED: No refactoring of existing code

### Minimal Change (Re-check)
- ✅ CONFIRMED: Configuration approach (src/config.ts for navigation)
- ✅ CONFIRMED: 4 new files for feature isolation
- ✅ CONFIRMED: Only 3 existing files modified (all surgical additions)
- ✅ CONFIRMED: Clear rollback path identified and documented

### Component Isolation (Re-check)
- ✅ CONFIRMED: Each page self-contained
- ✅ CONFIRMED: No new reusable components needed
- ✅ CONFIRMED: Dependencies explicitly imported
- ✅ CONFIRMED: No global state modifications

### Configuration Over Code (Re-check)
- ✅ CONFIRMED: Navigation configured in src/config.ts
- ✅ CONFIRMED: Content editable via markdown files
- ✅ CONFIRMED: i18n keys in enum (type-safe configuration)
- ✅ CONFIRMED: No hardcoded values in page components

### Development Validation (Re-check)
- ✅ CONFIRMED: Testable with `pnpm dev`
- ✅ CONFIRMED: Buildable with `pnpm build`
- ✅ CONFIRMED: Type-safe (uses existing types)
- ✅ CONFIRMED: No breaking changes to existing routes
- ✅ CONFIRMED: Light/dark mode automatic
- ✅ CONFIRMED: Mobile responsive automatic

### Design Artifacts Validate Constitution
- ✅ Data model confirms no database/ORM needed (markdown files)
- ✅ Contracts confirm no custom APIs or breaking changes
- ✅ Quickstart confirms validation possible with existing tooling

**✅ POST-DESIGN CONSTITUTION CHECK: PASSED**

All principles remain satisfied after detailed design. Implementation can proceed with confidence.
