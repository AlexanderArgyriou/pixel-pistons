# Implementation Plan: GitHub Comments Integration

**Branch**: `001-github-comments` | **Date**: 2026-07-10 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-github-comments/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Enable blog readers to view and interact with GitHub issue comments directly on blog posts. The feature fetches comments from linked GitHub issues and displays them below post content, allowing readers to see discussions and click through to GitHub to participate. Implementation uses client-side API calls with a new isolated Svelte component, requiring minimal changes to existing PostPage.astro.

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
  - ✅ No changes to layouts, existing components, or styles
  - ✅ PostPage.astro receives only a single-line component inclusion
  - ✅ All new functionality in isolated GitHubComments.svelte component
- [x] Feature can be added through extension rather than modification
  - ✅ New component extends post functionality without modifying existing behavior
  - ✅ Conditional rendering ensures zero impact on posts without comments

**Minimal Change**: Can this be achieved with fewer file changes?
- [x] Configuration changes explored before code changes
  - ✅ GitHub repo settings in src/config.ts (configuration)
  - ✅ Per-post settings via frontmatter schema (configuration)
  - ⚠️ Component code required for UI (unavoidable)
- [x] New functionality isolated in new files
  - ✅ GitHubComments.svelte is entirely new file
  - ✅ Optional types file for GitHub API interfaces
- [x] Existing file modifications are surgical and targeted
  - ✅ config.ts: Add GitHub config object (3-5 lines)
  - ✅ content/config.ts: Add githubIssue field to schema (1-2 lines)
  - ✅ PostPage.astro: Conditional component render (1-3 lines)
- [x] Clear rollback path identified
  - ✅ Remove component import and render line from PostPage.astro
  - ✅ No database migrations or irreversible changes

**Component Isolation**: Is feature properly isolated?
- [x] New components in dedicated files (src/components/ or src/plugins/)
  - ✅ src/components/GitHubComments.svelte
- [x] Dependencies explicitly declared
  - ✅ Component imports GitHub config from src/config.ts
  - ✅ Receives issue number and styling props from parent
- [x] Independently testable in isolation
  - ✅ Can test by creating standalone page with just GitHubComments component
  - ✅ Mock GitHub API responses for testing various states
- [x] No implicit global coupling
  - ✅ All dependencies passed via props or explicit imports
  - ✅ No global state mutations

**Configuration Over Code**: Are settings configurable?
- [x] Behavior configurable via src/config.ts or astro.config.mjs
  - ✅ GitHub repository settings in src/config.ts
  - ✅ Optional: API token, default behavior flags
- [x] No hardcoded magic values in component logic
  - ✅ Repository name from config, not hardcoded
  - ✅ Display options (comment limit, theme) configurable
- [x] New constants in src/constants/ or config files
  - ✅ GitHub API base URL can be constant
  - ✅ Default display limits as constants
- [x] TypeScript types for all config options
  - ✅ GitHubConfig interface in src/types/config.ts or inline

**Development Validation**: Can this be validated before commit?
- [x] Testable with `pnpm dev`
  - ✅ Component renders in development server
  - ✅ Can test with real GitHub API in browser
- [x] Build completes with `pnpm build`
  - ✅ No server-side rendering issues (client-side only)
  - ✅ No impact on Pagefind indexing
- [x] Type-safe: passes `pnpm check` and `pnpm type-check`
  - ✅ TypeScript interfaces for all props and API responses
  - ✅ Astro check validates component usage
- [x] No breaking changes to routes/RSS/sitemap
  - ✅ Zero impact on existing routes or feeds
  - ✅ Comments are purely presentational addition
- [x] Light and dark mode both supported
  - ✅ Use existing CSS variables for theming
  - ✅ Respect --primary, --bg, --text color tokens
- [x] Mobile responsive
  - ✅ Tailwind responsive classes (sm:, md:, lg:)
  - ✅ Touch-friendly comment interactions

**GATE EVALUATION**: ✅ **PASSED** - All constitution principles satisfied. Feature can proceed to Phase 0 research.

---

## Post-Design Constitution Re-evaluation

*Re-checked after Phase 1 design artifacts completed (research.md, data-model.md, contracts/, quickstart.md)*

**Changes from Initial Check**: None required - design maintains all constitutional compliance

**Preservation-First**: ✅ CONFIRMED
- Data model shows zero modifications to existing entities (only schema extension)
- Contracts document new isolated component with no existing component changes
- Quickstart validates without altering core blog functionality

**Minimal Change**: ✅ CONFIRMED  
- Research selected zero-dependency approach (uses existing markdown-it)
- Data model extends only 2 existing files (config.ts, content/config.ts)
- Contracts specify 1-line integration into PostPage.astro
- Total touched files: 3 existing + 1-2 new = 4-5 files total (minimal)

**Component Isolation**: ✅ CONFIRMED
- GitHubComments.svelte is completely self-contained
- All dependencies explicitly declared in contracts
- Component can be removed by deleting 1 line from PostPage.astro
- No shared state or global mutations

**Configuration Over Code**: ✅ CONFIRMED
- GitHub repository settings in src/config.ts (not hardcoded)
- Per-post behavior via frontmatter (configurable)
- Display options (maxCommentsDisplay) configurable
- TypeScript types ensure type-safe configuration

**Development Validation**: ✅ CONFIRMED
- Quickstart provides comprehensive validation scenarios
- All manual testing scenarios defined
- Build validation included (pnpm build test)
- Type safety verification steps documented
- Light/dark mode testing specified
- Mobile responsive testing included

**FINAL GATE EVALUATION**: ✅ **PASSED** - Design phase maintains constitutional compliance. Proceed to task generation.

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

**Minimal Change Strategy**: 

**Files requiring modification** (3 total):
1. `src/config.ts` - Add GitHub repository configuration (repo owner, repo name, optional token)
2. `src/content/config.ts` - Extend post schema with optional `githubIssue` field
3. `src/components/PostPage.astro` - Single line to include GitHubComments component

**New files** (1-2 total):
1. `src/components/GitHubComments.svelte` - Isolated comment display component
2. `src/types/github.ts` (optional) - TypeScript interfaces for GitHub API responses

**Why configuration-only isn't sufficient**: 
- Feature requires new UI component for rendering comments (can't be configured)
- Need frontmatter schema extension to link posts to GitHub issues
- Component must be integrated into post template (requires 1-line PostPage.astro change)

**Rollback path**: Remove GitHubComments component import and conditional render from PostPage.astro; comments feature cleanly disabled without breaking existing posts.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
