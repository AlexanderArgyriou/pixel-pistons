# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]

**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

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
- [ ] NO modifications to existing layouts/components/styles OR justified as critical bug fix
- [ ] Feature can be added through extension rather than modification

**Minimal Change**: Can this be achieved with fewer file changes?
- [ ] Configuration changes explored before code changes
- [ ] New functionality isolated in new files
- [ ] Existing file modifications are surgical and targeted
- [ ] Clear rollback path identified

**Component Isolation**: Is feature properly isolated?
- [ ] New components in dedicated files (src/components/ or src/plugins/)
- [ ] Dependencies explicitly declared
- [ ] Independently testable in isolation
- [ ] No implicit global coupling

**Configuration Over Code**: Are settings configurable?
- [ ] Behavior configurable via src/config.ts or astro.config.mjs
- [ ] No hardcoded magic values in component logic
- [ ] New constants in src/constants/ or config files
- [ ] TypeScript types for all config options

**Development Validation**: Can this be validated before commit?
- [ ] Testable with `pnpm dev`
- [ ] Build completes with `pnpm build`
- [ ] Type-safe: passes `pnpm check` and `pnpm type-check`
- [ ] No breaking changes to routes/RSS/sitemap
- [ ] Light and dark mode both supported
- [ ] Mobile responsive

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

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
