<!--
Sync Impact Report:
Version: 1.0.0 (Initial constitution ratified)
Date: 2026-07-10

Changes:
- NEW: I. Preservation-First Development (NON-NEGOTIABLE)
- NEW: II. Minimal Change Principle  
- NEW: III. Component Isolation
- NEW: IV. Configuration Over Code
- NEW: V. Development Validation & Compatibility
- NEW: Technology Stack Constraints section
- NEW: Development Workflow section
- NEW: Governance section

Templates updated:
✅ .specify/templates/spec-template.md
   - Added "Blog-Specific Constraints" section
   - Added preservation, minimal change, and tech constraints
   
✅ .specify/templates/plan-template.md  
   - Updated Technical Context for Astro blog specifics
   - Customized Constitution Check with blog principles
   - Replaced generic project structure with Astro blog structure
   
✅ .specify/templates/tasks-template.md
   - Updated Phase 1 for feature initialization pattern
   - Updated Phase 2 for blog-specific foundations
   - Updated implementation tasks for component-based workflow
   - Added preservation checkpoints

Follow-up TODOs: None - all placeholders filled, all templates updated
-->

# Pixel Piston Blog Constitution

## Core Principles

### I. Preservation-First Development (NON-NEGOTIABLE)

The existing Astro/Fuwari structure is the foundation—MUST NOT rebuild or refactor the base architecture.

**Rules**:
- The core Fuwari template structure MUST remain intact (layouts, components, styles)
- Existing components MUST NOT be rewritten unless fixing critical bugs
- Changes MUST be additive rather than destructive
- File relocations or major reorganizations are PROHIBITED unless absolutely necessary
- Before modifying any existing file, verify if the goal can be achieved through extension instead

**Rationale**: The blog is production-ready and functional. Rebuilding introduces unnecessary risk, testing burden, and loss of the proven Fuwari design patterns. Extensions preserve stability while enabling growth.

### II. Minimal Change Principle

Every feature MUST be implemented with the smallest possible diff to the existing codebase.

**Rules**:
- Configuration changes MUST be preferred over code changes when possible
- New functionality MUST be isolated in new files rather than mixed into existing ones
- Modifications to existing files MUST be surgical: targeted line changes with clear purpose
- Before implementation, identify the minimal set of files that must be touched
- Each change MUST have clear rollback path—prefer feature flags or conditional rendering
- Avoid changing shared utilities or base components unless change benefits multiple features

**Rationale**: Small, focused changes are easier to review, test, debug, and revert. They reduce cognitive load and minimize the risk of introducing regressions into working features.

### III. Component Isolation

New features MUST be built as isolated, self-contained components following Astro/Svelte conventions.

**Rules**:
- Each new feature MUST live in its own component file(s)
- Components MUST declare their dependencies explicitly (imports, props, types)
- Components MUST be independently testable in isolation
- Shared state MUST be explicitly managed—avoid implicit global coupling
- New components SHOULD follow existing naming and structure patterns from `src/components/`
- Plugin-based extensions (remark/rehype plugins) MUST be placed in `src/plugins/`
- Feature-specific styles MUST be scoped or added to feature component files

**Rationale**: Isolation enables independent development, testing, and removal of features without cascading effects. It maintains the modular architecture that makes Astro/Svelte applications maintainable.

### IV. Configuration Over Code

Behavior changes MUST be achieved through configuration files (`src/config.ts`, `astro.config.mjs`) when possible.

**Rules**:
- Feature toggles, theme settings, and site behavior MUST be configurable via `src/config.ts`
- Build pipeline additions (integrations, plugins) MUST be declared in `astro.config.mjs`
- Constants and magic values MUST be extracted to `src/constants/` or config files
- Content schema changes MUST go through `src/content/config.ts`
- Avoid hardcoding values in component logic—expose as props or configuration options
- Document all new configuration options with TypeScript types and comments

**Rationale**: Configuration centralizes control, makes features easier to toggle, and reduces the need to modify multiple files. It aligns with Astro's philosophy of declarative configuration.

### V. Development Validation & Compatibility

All changes MUST be validated in development mode before commit and MUST maintain compatibility with existing build/deploy pipeline.

**Rules**:
- Every feature MUST be tested with `pnpm dev` and visually verified in browser
- Build process MUST complete successfully with `pnpm build` (includes Pagefind indexing)
- Type checking MUST pass: `pnpm check` and `pnpm type-check`
- Code MUST be formatted with `pnpm format` before commit
- Code MUST pass linting with `pnpm lint` before commit
- Changes MUST NOT break existing page routes, RSS feed, or sitemap generation
- Mobile responsive behavior MUST be verified for UI changes
- Dark/light mode MUST both work correctly for UI changes
- No new runtime dependencies SHOULD be added without justification—prefer using existing packages

**Rationale**: The blog deploys to Vercel with automated builds. Broken builds or type errors block deployment. Pre-commit validation catches issues before they reach CI/CD. Maintaining compatibility ensures smooth deployments.

## Technology Stack Constraints

**Core Stack** (MUST NOT change):
- **Framework**: Astro 5.x with Svelte integration
- **Styling**: Tailwind CSS 3.x with custom Stylus for markdown
- **Content**: Markdown with remark/rehype plugins for extensions
- **Build**: Vite-based (via Astro), pnpm as package manager
- **Search**: Pagefind (integrated into build process)
- **Deployment**: Vercel (serverless edge runtime)

**Allowed Additions**:
- Astro integrations that follow official patterns (e.g., `@astrojs/*`)
- Remark/Rehype plugins for markdown processing
- Svelte components and libraries compatible with Svelte 5.x
- Icon sets via Iconify (using existing `@iconify-json/*` pattern)
- TypeScript types and utilities

**Prohibited Changes**:
- Switching from Astro to another framework
- Replacing Tailwind with alternative CSS framework
- Removing or replacing core integrations (@astrojs/sitemap, @astrojs/rss, @swup/astro)
- Changing package manager from pnpm
- Adding heavy client-side frameworks (React, Vue) unless absolutely necessary

## Development Workflow

**Before Starting Implementation**:
1. Read the feature spec carefully—understand requirements and acceptance criteria
2. Identify which existing components/files might be affected
3. Check if feature can be achieved through configuration alone
4. Determine the minimal set of changes needed
5. Plan component isolation strategy for new functionality

**During Implementation**:
1. Create new files for new functionality rather than modifying existing ones when possible
2. Make changes incrementally—test after each logical step
3. Run `pnpm dev` frequently to validate changes in real-time
4. Keep commits small and focused on single changes
5. Document new configuration options and component APIs

**Before Committing**:
1. Run quality checks:
   ```bash
   pnpm check      # Astro diagnostics
   pnpm type-check # TypeScript validation
   pnpm format     # Biome formatting
   pnpm lint       # Biome linting
   ```
2. Test full build: `pnpm build` (ensures Pagefind integration works)
3. Verify in browser: both light and dark modes, mobile and desktop
4. Review diff—ensure changes are minimal and focused
5. Write clear commit message following Conventional Commits format

**Testing Requirements**:
- **Manual Testing**: REQUIRED for all changes (visual verification in browser)
- **Type Safety**: REQUIRED (enforced by TypeScript and Astro check)
- **Unit Tests**: OPTIONAL (not currently in project, but can be added for complex logic)
- **Build Validation**: REQUIRED (build must complete without errors)

## Governance

This constitution supersedes all other development practices and guidelines. All feature development, changes, and additions MUST comply with these principles.

**Amendment Process**:
- Amendments require explicit documentation of rationale
- Version bumping follows semantic versioning (MAJOR.MINOR.PATCH):
  - **MAJOR**: Principle removed or fundamentally redefined (backward incompatible)
  - **MINOR**: New principle added or existing principle significantly expanded
  - **PATCH**: Clarifications, wording improvements, non-semantic changes
- Changes MUST update this file with new version and amendment date
- Dependent templates MUST be reviewed for consistency after amendments

**Compliance Review**:
- Every feature specification MUST reference applicable principles
- Every implementation plan MUST include constitution compliance check
- Task definitions MUST align with minimal change and isolation principles
- Code reviews SHOULD verify adherence to these principles

**Enforcement**:
- Violations SHOULD be caught during planning phase (spec/plan review)
- Implementation that contradicts principles MUST be revised or justified
- Persistent violations indicate constitution needs amendment (update principles vs. enforce stricter)

**Version**: 1.0.0 | **Ratified**: 2026-07-10 | **Last Amended**: 2026-07-10
