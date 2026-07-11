---
description: "Task list for GitHub Comments Integration feature"
---

# Tasks: GitHub Comments Integration

**Input**: Design documents from `/specs/001-github-comments/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/GitHubComments.md, quickstart.md

**Tests**: Not requested in feature specification - focusing on manual validation per quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Feature Initialization)

**Purpose**: Prepare for feature addition with minimal project impact

- [X] T001 Create feature documentation structure in specs/001-github-comments/
- [X] T002 Verify no new npm dependencies needed (confirm markdown-it already exists)
- [X] T003 Create src/types/github.ts for TypeScript interfaces

**Preservation Check**: ✅ No existing files modified in this phase

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Minimal shared infrastructure needed by all user stories

**⚠️ CRITICAL**: Complete only what's REQUIRED before user stories can begin

- [X] T004 Add GitHubConfig interface and configuration to src/config.ts
- [X] T005 [P] Extend post schema in src/content/config.ts with githubIssue and commentsEnabled fields
- [X] T006 [P] Define TypeScript interfaces in src/types/github.ts (GitHubComment, CommentsState, CachedComments)

**Preservation Check**: ✅ Only configuration and schema extension - no existing components modified

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Display GitHub Issue Comments (Priority: P1) 🎯 MVP

**Goal**: Readers can see existing comments from GitHub issues displayed on blog posts

**Independent Test**: Create a blog post with githubIssue frontmatter, verify comments render correctly

### Implementation for User Story 1

- [X] T007 [P] [US1] Create GitHubComments.svelte component in src/components/ with basic structure and props interface
- [X] T008 [US1] Implement GitHub API fetch logic with onMount in GitHubComments.svelte using research.md pattern
- [X] T009 [US1] Implement sessionStorage caching with 5-minute TTL per research.md
- [X] T010 [US1] Add loading state UI with skeleton/spinner in GitHubComments.svelte
- [X] T011 [US1] Add error state UI with fallback message and GitHub link in GitHubComments.svelte
- [X] T012 [US1] Add empty state UI ("No comments yet" message) in GitHubComments.svelte
- [X] T013 [US1] Implement comment rendering with markdown-it (html: false for security) in GitHubComments.svelte
- [X] T014 [US1] Add comment metadata display (avatar, username, timestamp) in GitHubComments.svelte
- [X] T015 [US1] Apply Tailwind styling using existing theme variables (--primary, --bg, --text) in GitHubComments.svelte
- [X] T016 [US1] Add responsive design with Tailwind breakpoints (sm:, md:, lg:) in GitHubComments.svelte
- [X] T017 [US1] Integrate GitHubComments into PostPage.astro with conditional rendering (1-3 lines)
- [X] T018 [US1] Test in `pnpm dev`: verify comments load, check light/dark mode, check mobile/desktop

**Preservation Check**: ✅ PostPage.astro receives only 1-3 line change (conditional component render)

**Checkpoint**: At this point, User Story 1 should be fully functional - readers can view comments on posts

---

## Phase 4: User Story 2 - Enable Reader Interaction (Priority: P2)

**Goal**: Readers can click buttons to navigate to GitHub and participate in discussions

**Independent Test**: Click "Join Discussion" button and verify GitHub issue opens in new tab

### Implementation for User Story 2

- [X] T019 [P] [US2] Add "Join Discussion on GitHub" CTA button at bottom of comments section in GitHubComments.svelte
- [X] T020 [P] [US2] Add "View on GitHub" link to each individual comment in GitHubComments.svelte
- [X] T021 [US2] Ensure all GitHub links open in new tab (target="_blank" rel="noopener noreferrer")
- [X] T022 [US2] Style interaction buttons consistently with existing blog button styles
- [X] T023 [US2] Add "Start the discussion" link in empty state pointing to GitHub issue
- [X] T024 [US2] Test in `pnpm dev`: verify all links navigate correctly, check accessibility (keyboard navigation)

**Preservation Check**: ✅ All changes within GitHubComments.svelte component only

**Checkpoint**: At this point, User Stories 1 AND 2 both work - readers can view and interact with comments

---

## Phase 5: User Story 3 - Comment Configuration per Post (Priority: P3)

**Goal**: Authors can control comments per post via frontmatter (enable/disable, specify issue)

**Independent Test**: Set commentsEnabled: false in a post, verify no comment section appears

### Implementation for User Story 3

- [X] T025 [US3] Update PostPage.astro conditional logic to respect commentsEnabled frontmatter field
- [X] T026 [US3] Implement fallback to githubConfig.defaultEnabled when commentsEnabled not specified in PostPage.astro
- [X] T027 [US3] Add validation: if githubIssue missing but commentsEnabled true, show error message in GitHubComments.svelte
- [X] T028 [US3] Test various frontmatter combinations per quickstart.md Scenario 4
- [X] T029 [US3] Document frontmatter options in src/content/posts/ (update example post or create comments guide)

**Preservation Check**: ✅ Changes limited to PostPage.astro conditional logic and GitHubComments.svelte validation

**Checkpoint**: All user stories complete - full feature functional with configuration control

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validation, documentation, and production readiness

- [X] T030 [P] Run quickstart.md Scenario 1: Display Comments (happy path validation)
- [X] T031 [P] Run quickstart.md Scenario 2: Empty State (no comments yet)
- [X] T032 [P] Run quickstart.md Scenario 3: Error Handling (invalid issue)
- [X] T033 [P] Run quickstart.md Scenario 4: Comments Disabled
- [X] T034 [P] Run quickstart.md Scenario 5: Caching Behavior
- [X] T035 [P] Run quickstart.md Scenario 6: Responsive Design
- [X] T036 [P] Run quickstart.md Scenario 7: Theme Integration (light/dark mode)
- [X] T037 [P] Run quickstart.md Scenario 8: Markdown Rendering
- [X] T038 Run quickstart.md Scenario 9: Build Process (`pnpm build`)
- [X] T039 Run quickstart.md Scenario 10: Type Safety (`pnpm check`, `pnpm type-check`)
- [X] T040 Run quality gates: `pnpm format` and `pnpm lint`
- [X] T041 Verify integration checklist from quickstart.md (RSS, sitemap, archive, search all working)
- [X] T042 Create example blog post with comments enabled in src/content/posts/ (optional demo)
- [X] T043 Add README or comment guidelines in specs/001-github-comments/ for future maintainers

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories CAN proceed in parallel if desired (independent functionality)
  - Or sequentially in priority order: P1 → P2 → P3 for incremental delivery
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Phase 2 only - No dependencies on other stories
  - **MVP Milestone**: Completing just US1 delivers viable product (read-only comment display)
- **User Story 2 (P2)**: Depends on Phase 2 and benefits from US1 (but technically independent)
  - Adds interaction buttons to existing comment display
  - Could be implemented standalone, but makes more sense after US1
- **User Story 3 (P3)**: Depends on Phase 2 and extends US1 conditional rendering logic
  - Adds configuration control to comment display
  - Independent of US2 (interaction buttons)

### Within Each User Story

**User Story 1 (P1) - Display Comments**:
1. Component structure and props (T007) - FIRST
2. API fetch logic (T008) - after T007
3. Caching (T009) - parallel with fetch logic
4. UI states (T010-T012) - parallel after T007
5. Comment rendering (T013-T014) - after fetch logic works
6. Styling (T015-T016) - parallel after component structure
7. Integration (T017) - after component complete
8. Testing (T018) - LAST

**User Story 2 (P2) - Interaction**:
- All button/link tasks (T019-T021) can run in parallel
- Styling (T022-T023) after buttons added
- Testing (T024) LAST

**User Story 3 (P3) - Configuration**:
- Conditional logic (T025-T027) sequential
- Testing (T028) before documentation (T029)

### Parallel Opportunities

```bash
# Phase 2 - All foundational tasks can run in parallel:
T004: Add config to src/config.ts
T005: Extend schema in src/content/config.ts
T006: Add types in src/types/github.ts

# Phase 3 (US1) - Some tasks can run in parallel:
# After T007 (component structure) completes:
Parallel Group A:
  T008: API fetch logic
  T009: Caching implementation
  T010: Loading state UI
  T011: Error state UI
  T012: Empty state UI

# Phase 4 (US2) - All button tasks can run in parallel:
T019: Add "Join Discussion" button
T020: Add "View on GitHub" links
T021: Ensure new tab behavior
T022: Style buttons

# Phase 6 - Most validation tasks can run in parallel:
T030-T037: All quickstart scenarios (parallel testing)
```

---

## Parallel Example: User Story 1 (After T007 completes)

```bash
# After component structure is ready, launch these in parallel:

Task: "Implement GitHub API fetch logic in GitHubComments.svelte"
Task: "Implement sessionStorage caching in GitHubComments.svelte"
Task: "Add loading state UI in GitHubComments.svelte"
Task: "Add error state UI in GitHubComments.svelte"
Task: "Add empty state UI in GitHubComments.svelte"

# These are independent - different sections of the same component
# Can be developed simultaneously by different developers
# Or worked on in any order by single developer
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

This is the RECOMMENDED approach for incremental delivery:

1. ✅ Complete Phase 1: Setup (documentation, no code changes)
2. ✅ Complete Phase 2: Foundational (config, schema, types - CRITICAL)
3. ✅ Complete Phase 3: User Story 1 - Display Comments
4. **STOP and VALIDATE**: Test US1 independently using quickstart.md scenarios 1-3
5. **DEPLOY/DEMO if ready**: You now have a working comment display feature!

**At this point you have a viable product**: Readers can see GitHub comments on blog posts.

### Incremental Delivery (Add Features Progressively)

1. ✅ Complete Setup + Foundational → Foundation ready
2. ✅ Add User Story 1 → Test independently → Deploy/Demo (**MVP!**)
3. ✅ Add User Story 2 → Test independently → Deploy/Demo (now readers can interact)
4. ✅ Add User Story 3 → Test independently → Deploy/Demo (now authors have config control)
5. ✅ Complete Phase 6 (Polish) → Production ready

**Value**: Each story adds value without breaking previous stories. Can stop at any checkpoint.

### Parallel Team Strategy (If Multiple Developers Available)

With 2-3 developers:

1. **Team together**: Complete Setup + Foundational (Phase 1-2)
2. **Once Phase 2 done**, split work:
   - **Developer A**: User Story 1 (Display) - T007 through T018
   - **Developer B**: User Story 2 (Interaction) - Can start UI mockups, wait for US1 component
   - **Developer C**: User Story 3 (Configuration) - Can prepare conditional logic, wait for US1
3. **Stories complete independently**, then integrate and test together
4. **All together**: Phase 6 (Polish & validation)

---

## Notes

- **[P]** tasks = different files or independent sections, no dependencies
- **[Story]** label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify all existing blog features work after each phase (integration checklist in quickstart.md)
- Stop at any checkpoint to validate story independently before proceeding
- **Constitution compliance**: All tasks follow preservation-first, minimal change, component isolation principles
- **Zero new dependencies**: Feature uses existing markdown-it, native fetch, Tailwind, Svelte

---

## Success Metrics

Upon completion of all phases:

- ✅ **Total tasks**: 43 tasks across 6 phases
- ✅ **Files created**: 2 new files (GitHubComments.svelte, types/github.ts)
- ✅ **Files modified**: 3 existing files (config.ts, content/config.ts, PostPage.astro)
- ✅ **Lines changed in existing files**: ~10-15 total (minimal change principle)
- ✅ **Dependencies added**: 0 (uses existing packages)
- ✅ **Breaking changes**: 0 (fully backward compatible)
- ✅ **Independent test scenarios**: 10 scenarios in quickstart.md
- ✅ **MVP scope**: Phase 1-3 only (21 tasks) delivers viable product
- ✅ **Full feature**: All phases (43 tasks) delivers complete solution

**Format Validation**: ✅ All tasks follow checklist format (checkbox, ID, labels, file paths)

---

## Recommended First Implementation Path

**For single developer, follow this order**:

```
Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3 (US1) → TEST MVP

If MVP works well:
Phase 4 (US2) → Phase 5 (US3) → Phase 6 (Polish) → PRODUCTION READY
```

**Time estimates** (rough):
- Phase 1-2: 1-2 hours (setup and config)
- Phase 3 (US1): 4-6 hours (core component development)
- Phase 4 (US2): 1-2 hours (add interaction buttons)
- Phase 5 (US3): 1-2 hours (configuration logic)
- Phase 6 (Polish): 2-3 hours (validation and testing)

**Total**: ~10-16 hours for complete feature from scratch
