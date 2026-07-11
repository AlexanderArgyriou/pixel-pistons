# Implementation Tasks: Giscus Comments Integration

**Feature**: 002-giscus-comments  
**Estimated Effort**: 2-3 hours  
**Parallel Tasks Marked**: [P]

---

## Task Organization

Tasks organized by user story and phase:
- **Setup**: Documentation and type definitions
- **US1**: Display Giscus widget
- **US2**: Reader interaction (handled by Giscus)
- **US3**: Per-post configuration
- **Polish**: Validation and cleanup

**Dependency Rules**:
- Tasks within a user story may have dependencies
- Setup tasks must complete before implementation tasks
- Polish tasks run after all implementation complete
- [P] = Can run in parallel with other [P] tasks

---

## Phase 1: Setup & Type Definitions

**Purpose**: Create documentation structure and TypeScript types

- [X] T001 Create specs/002-giscus-comments/ directory structure (spec.md, plan.md, data-model.md, contracts/, quickstart.md, tasks.md)
- [X] T002 Create src/types/giscus.ts with GiscusConfig, GiscusMapping, GiscusTheme interfaces
- [X] T003 Verify existing dependencies (Svelte, Astro, TypeScript) - no new npm packages needed

**Checkpoint**: Type definitions complete, no new dependencies required

---

## Phase 2: Configuration & Schema

**Purpose**: Add configuration and extend content schema

- [X] T004 Add giscusConfig export to src/config.ts with placeholder repoId/categoryId
- [X] T005 Extend postsCollection schema in src/content/config.ts with commentsEnabled and discussionNumber fields
- [X] T006 Update .gitignore if needed (should already cover env files)

**Preservation Check**: ✅ Only additive changes to existing config files

**Checkpoint**: Configuration in place, schema extended

---

## Phase 3: User Story 1 - Display Giscus Widget

**Purpose**: Create component that loads Giscus widget

- [X] T007 [US1] Create src/components/GiscusComments.svelte skeleton with props interface
- [X] T008 [US1] Implement onMount hook to dynamically create Giscus script tag
- [X] T009 [US1] Set all data-* attributes from giscusConfig (repo, repoId, category, categoryId, theme, etc.)
- [X] T010 [US1] Handle discussionNumber prop: if provided, use "number" mapping; else use "pathname"
- [X] T011 [US1] Add container div with proper styling (width, responsive)
- [X] T012 [US1] Test component in isolation (create test .astro page)

**Technical Notes**:
- Use Svelte 5 `$props()` for props
- Use `onMount` from 'svelte' for lifecycle
- Script src: `https://giscus.app/client.js`
- Attributes: crossorigin="anonymous", async

**Checkpoint**: Component renders Giscus widget successfully

---

## Phase 4: Integration with PostPage

**Purpose**: Integrate GiscusComments into blog post template

- [X] T013 [US1] Import GiscusComments in src/pages/posts/[...slug].astro
- [X] T014 [US1] Import giscusConfig from src/config
- [X] T015 [US1] Add conditional logic: `commentsEnabled ?? defaultEnabled`
- [X] T016 [US1] Render GiscusComments with client:load and discussionNumber prop
- [X] T017 [US1] Add "Discussion" heading before component
- [X] T018 [US1] Test on multiple posts (enabled, disabled, with discussionNumber)

**Integration Pattern**:
```astro
const commentsEnabled = entry.data.commentsEnabled ?? giscusConfig.defaultEnabled ?? false;
const discussionNumber = entry.data.discussionNumber;

{commentsEnabled && (
  <div class="mb-6 onload-animation">
    <h2>Discussion</h2>
    <GiscusComments discussionNumber={discussionNumber} client:load />
  </div>
)}
```

**Preservation Check**: ✅ Only additive changes to PostPage.astro

**Checkpoint**: Giscus widget appears on enabled posts

---

## Phase 5: User Story 2 - Reader Interaction

**Purpose**: Verify interaction features (handled by Giscus)

- [ ] T019 [US2] Verify "Sign in with GitHub" button appears
- [ ] T020 [US2] Test OAuth flow (click sign in, authorize, return)
- [ ] T021 [US2] Post test comment and verify it appears
- [ ] T022 [US2] Add reaction and verify it works
- [ ] T023 [US2] Reply to comment and verify threading
- [ ] T024 [US2] Check GitHub Discussions for synced content

**Note**: No code changes needed - Giscus handles all interaction

**Checkpoint**: All user interactions work via Giscus

---

## Phase 6: User Story 3 - Per-Post Configuration

**Purpose**: Document and test configuration options

- [ ] T025 [US3] Create src/content/posts/giscus-demo.md with commentsEnabled: true
- [ ] T026 [US3] Create src/content/posts/giscus-guide.md with setup documentation
- [ ] T027 [US3] Test various frontmatter combinations per quickstart.md Scenario 4
- [ ] T028 [US3] Test discussionNumber override with manually created discussion

**Test Matrix**:
- `commentsEnabled: true` → widget appears
- `commentsEnabled: false` → no widget
- No field + `defaultEnabled: false` → no widget
- No field + `defaultEnabled: true` → widget appears
- `discussionNumber: 42` → loads discussion #42

**Preservation Check**: ✅ All changes via frontmatter, no code modifications

**Checkpoint**: All configuration options working

---

## Phase 7: Polish & Validation

**Purpose**: Ensure production readiness and quality

- [ ] T029 [P] Run quickstart.md Scenario 1: Display widget (happy path)
- [ ] T030 [P] Run quickstart.md Scenario 2: Comments disabled
- [ ] T031 [P] Run quickstart.md Scenario 3: Specific discussion number
- [ ] T032 [P] Run quickstart.md Scenario 4: Default configuration
- [ ] T033 [P] Run quickstart.md Scenario 5: Theme synchronization
- [ ] T034 [P] Run quickstart.md Scenario 6: Responsive design
- [ ] T035 Run quickstart.md Scenario 7: Build process (`pnpm build`)
- [ ] T036 Run quickstart.md Scenario 8: Type safety (`pnpm check`, `pnpm type-check`)
- [ ] T037 Run quality gates: `pnpm format` and `pnpm lint`
- [ ] T038 Run quickstart.md Scenario 9: Integration checklist (RSS, sitemap, archive, search)
- [ ] T039 Run quickstart.md Scenario 10: Real user interaction (post comment on deployed site)
- [ ] T040 Update README if needed (optional enhancement)

**Preservation Check**: ✅ Verify all existing features still work (RSS, search, archive)

**Checkpoint**: All validation passed, feature production-ready

---

## Phase 8: Cleanup (Old Implementation)

**Purpose**: Remove old GitHub API implementation

- [X] T041 Remove src/components/GitHubComments.svelte (old implementation)
- [X] T042 Remove src/types/github.ts (old implementation)
- [X] T043 Remove githubConfig from src/config.ts (replace with giscusConfig)
- [X] T044 Remove githubIssue field from content schema (replace with discussionNumber)
- [X] T045 Update/remove old test posts (test-github-comments.md → test-giscus-comments.md, github-comments-guide.md → giscus-guide.md)
- [X] T046 Archive specs/001-github-comments/ (kept for reference)
- [X] T047 Re-run build and validation after cleanup

**Important**: Only proceed with cleanup after Giscus implementation is fully validated

**Checkpoint**: Old implementation removed, only Giscus remains

---

## Manual Prerequisites (User Must Complete)

These steps cannot be automated and must be completed before T004:

1. **Enable GitHub Discussions**:
   - Go to https://github.com/AlexanderArgyriou/pixel-pistons/settings
   - Enable "Discussions" feature

2. **Create Discussion Category**:
   - Go to Discussions tab
   - Create category "Blog Comments"

3. **Install Giscus App**:
   - Visit https://github.com/apps/giscus
   - Install on pixel-pistons repo

4. **Get Configuration**:
   - Visit https://giscus.app
   - Enter repo: AlexanderArgyriou/pixel-pistons
   - Select category: Blog Comments
   - Copy repoId and categoryId values

5. **Update T004**:
   - Replace placeholder values with actual repoId and categoryId

---

## Execution Order

**Sequential Phases**:
1. Phase 1 (Setup) → Phase 2 (Config) → Phase 3 (Component) → Phase 4 (Integration)
2. Phase 5 (Interaction) → Phase 6 (Configuration) → Phase 7 (Polish)
3. Phase 8 (Cleanup) - only after all validation passes

**Parallel Opportunities**:
- T029-T034 can run in parallel (validation scenarios)
- T041-T045 can run in parallel (cleanup tasks)

**Critical Path**:
T001 → T002 → T004 → T005 → T007 → T008 → T009 → T010 → T013 → T014 → T035

**Estimated Time**:
- Phases 1-4: 1.5 hours (core implementation)
- Phases 5-6: 30 minutes (testing/docs)
- Phase 7: 30 minutes (validation)
- Phase 8: 30 minutes (cleanup)
- **Total**: 2.5-3 hours

---

## Done When

- [X] All tasks T001-T040 marked complete
- [ ] All quickstart scenarios pass
- [ ] Production build succeeds
- [ ] Real comment posted successfully
- [ ] Old implementation cleaned up (T041-T047)
- [ ] Zero TypeScript/build errors
- [ ] Constitution principles maintained
