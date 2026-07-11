# Implementation Plan: Giscus Comments Integration

**Feature**: 002-giscus-comments  
**Created**: 2026-07-10  
**Constitution Compliance**: ✅ All principles verified

---

## Constitution Compliance Check

**I. Preservation-First (NON-NEGOTIABLE)**:
- ✅ Fuwari template structure untouched
- ✅ Existing components unmodified
- ✅ Only PostPage.astro modified for integration
- ✅ No changes to core Astro/Svelte configuration

**II. Minimal Change**:
- ✅ Single new component: GiscusComments.svelte
- ✅ Configuration added to existing src/config.ts
- ✅ Schema extension in existing src/content/config.ts
- ✅ Conditional rendering in PostPage.astro

**III. Component Isolation**:
- ✅ GiscusComments.svelte is self-contained
- ✅ Zero dependencies on existing components
- ✅ Uses only Svelte core and DOM APIs
- ✅ No props required from parent beyond configuration

**IV. Configuration Over Code**:
- ✅ All Giscus settings in src/config.ts
- ✅ Per-post control via frontmatter
- ✅ Global defaults configurable
- ✅ No hardcoded values in component

**V. Development Validation**:
- ✅ TypeScript strict mode enabled
- ✅ Biome format/lint required
- ✅ Build verification mandatory
- ✅ Type checking before deployment

---

## Tech Stack Analysis

**Existing Stack** (from codebase inspection):
- **Framework**: Astro 5.x (SSG)
- **UI**: Svelte 5 (runes: $state, $props)
- **Styling**: Tailwind CSS 3.x + custom Stylus
- **Package Manager**: pnpm
- **Format/Lint**: Biome
- **Deployment**: Vercel

**New Dependencies**:
- **Giscus**: CDN-hosted script (https://giscus.app/client.js)
- **No npm dependencies needed** - vanilla script embed

---

## Implementation Strategy

### Phase 1: Setup & Configuration

**Files to Create**:
1. `src/types/giscus.ts` - TypeScript interfaces
2. `src/components/GiscusComments.svelte` - Main component

**Files to Modify**:
1. `src/config.ts` - Add giscusConfig export
2. `src/content/config.ts` - Extend schema with commentsEnabled, discussionNumber
3. `src/pages/posts/[...slug].astro` - Integrate component

### Phase 2: Giscus Setup

**Prerequisites** (user must complete):
1. Enable GitHub Discussions on pixel-pistons repo
2. Create Discussion Category (e.g., "Blog Comments")
3. Install Giscus app: https://github.com/apps/giscus
4. Get configuration from: https://giscus.app
   - repo: "AlexanderArgyriou/pixel-pistons"
   - repoId: (obtained from Giscus setup)
   - category: "Blog Comments" (or user's choice)
   - categoryId: (obtained from Giscus setup)

### Phase 3: Component Implementation

**GiscusComments.svelte**:
- Props: `discussionNumber?` (optional specific discussion)
- Config: Import from `@/config`
- Script injection: Use `onMount` to dynamically load Giscus script
- Attributes: Set data-* attributes for configuration
- Theme: Use CSS custom properties for integration

**Key Features**:
- Lazy load Giscus script only when component mounts
- Respect user's theme preference (light/dark)
- Handle pathname or discussion number mapping
- Responsive container with proper spacing

### Phase 4: Integration

**PostPage.astro**:
```astro
import GiscusComments from "@components/GiscusComments.svelte";
import { giscusConfig } from "src/config";

const commentsEnabled = entry.data.commentsEnabled ?? giscusConfig.defaultEnabled ?? false;
const discussionNumber = entry.data.discussionNumber;
```

Conditional render:
```astro
{commentsEnabled && (
  <div class="mb-6 onload-animation">
    <h2>Discussion</h2>
    <GiscusComments discussionNumber={discussionNumber} client:load />
  </div>
)}
```

---

## File Structure

```
src/
├── components/
│   └── GiscusComments.svelte          (NEW - 80 lines)
├── types/
│   └── giscus.ts                       (NEW - 20 lines)
├── config.ts                           (MODIFY - add 15 lines)
├── content/
│   ├── config.ts                       (MODIFY - add 2 lines to schema)
│   └── posts/
│       ├── giscus-demo.md              (NEW - test post)
│       └── giscus-guide.md             (NEW - documentation)
└── pages/
    └── posts/
        └── [...slug].astro             (MODIFY - add 8 lines)

specs/002-giscus-comments/
├── spec.md                             (CREATED)
├── plan.md                             (THIS FILE)
├── data-model.md                       (NEXT)
├── contracts/GiscusComments.md         (NEXT)
├── quickstart.md                       (NEXT)
└── tasks.md                            (NEXT)
```

---

## Data Model

See [data-model.md](./data-model.md) for complete type definitions.

**Key Types**:
- `GiscusConfig` - Global configuration interface
- `GiscusTheme` - Theme options union type
- `GiscusMapping` - Discussion mapping strategy

---

## API Contracts

See [contracts/GiscusComments.md](./contracts/GiscusComments.md) for component API.

**Component Props**:
```typescript
interface Props {
  discussionNumber?: number;  // Optional specific discussion
  class?: string;            // Optional CSS classes
}
```

---

## Testing Strategy

See [quickstart.md](./quickstart.md) for validation scenarios.

**Scenarios**:
1. Display Giscus widget (happy path)
2. Comments disabled (no widget)
3. Specific discussion number mapping
4. Theme synchronization (light/dark)
5. Responsive design
6. Build process validation

---

## Deployment Checklist

- [ ] GitHub Discussions enabled
- [ ] Giscus app installed
- [ ] repoId and categoryId obtained
- [ ] Configuration added to src/config.ts
- [ ] TypeScript compilation passes
- [ ] Biome format/lint passes
- [ ] Production build succeeds
- [ ] Test post with comments created
- [ ] Documentation published

---

## Rollback Plan

If issues arise:
1. Set `defaultEnabled: false` in giscusConfig
2. Remove GiscusComments import from PostPage.astro
3. Redeploy
4. Debug locally before re-enabling

---

## Success Criteria

- ✅ Giscus widget loads on enabled posts
- ✅ Theme matches blog (light/dark)
- ✅ Mobile responsive
- ✅ Zero build errors
- ✅ Zero runtime errors
- ✅ Constitution principles maintained
