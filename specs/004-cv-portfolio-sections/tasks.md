# Tasks: Professional CV Portfolio Sections

**Feature**: [spec.md](spec.md) | **Branch**: `004-cv-portfolio-sections`

**Input**: Design documents from [/specs/004-cv-portfolio-sections/](.)

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/)

**Tests**: Not requested in specification - test tasks omitted per template guidance

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

---

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **Checkbox**: `- [ ]` for uncompleted tasks
- **[ID]**: Sequential task number (T001, T002, etc.)
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- **Description**: Clear action with exact file path

---

## Phase 1: Setup (Feature Initialization)

**Purpose**: Prepare project for CV portfolio sections with zero impact on existing functionality

- [ ] T001 Verify existing About page pattern by inspecting src/pages/about.astro and src/content/spec/about.md
- [ ] T002 Verify no dependencies need to be added (all required packages already in package.json)
- [ ] T003 Create feature branch: `git checkout -b 004-cv-portfolio-sections`

**Preservation Check**: ✅ No modifications to existing files in this phase

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add i18n infrastructure required by all user stories

**⚠️ CRITICAL**: These tasks MUST complete before any user story can begin

- [ ] T004 Add `experience` key to I18nKey enum in src/i18n/i18nKey.ts (after `about = "about",`)
- [ ] T005 Add `education` key to I18nKey enum in src/i18n/i18nKey.ts (after `experience = "experience",`)
- [ ] T006 [P] Add Experience translation to src/i18n/languages/en.ts: `[Key.experience]: "Experience",`
- [ ] T007 [P] Add Education translation to src/i18n/languages/en.ts: `[Key.education]: "Education",`
- [ ] T008 Run `pnpm check` to verify TypeScript types resolve correctly

**Preservation Check**: ✅ Only surgical additions to i18n files (2 enum keys + 2 translations)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - View Professional Experience (Priority: P1) 🎯 MVP

**Goal**: Visitors can navigate to and view Alex's professional experience in a beautifully formatted page

**Independent Test**: Navigate to `/experience` and verify all work history entries display with proper formatting (company names, job titles, dates, formatted bullet points with Unicode symbols)

### Implementation for User Story 1

- [ ] T009 [P] [US1] Create src/pages/experience.astro following about.astro pattern
- [ ] T010 [US1] In experience.astro: Import getEntry, render, MainGridLayout, Markdown, I18nKey, i18n
- [ ] T011 [US1] In experience.astro: Add getEntry("spec", "experience") with error handling
- [ ] T012 [US1] In experience.astro: Use MainGridLayout with i18n(I18nKey.experience) for title/description
- [ ] T013 [US1] In experience.astro: Add card-base div with Markdown component wrapping Content
- [ ] T014 [P] [US1] Extract professional experience from alex_argyriou_cv (1).pdf manually
- [ ] T015 [P] [US1] Create src/content/spec/experience.md with H1 heading "Professional Experience"
- [ ] T016 [US1] In experience.md: Add experience entries in reverse chronological order using data-model.md structure
- [ ] T017 [US1] In experience.md: Format each entry with H3 headings (Job Title • Company Name)
- [ ] T018 [US1] In experience.md: Use Unicode bullets (•, ◦) for responsibilities and arrows (→, ⇒) for impact
- [ ] T019 [US1] In experience.md: Use **bold** for section headers, *italic* for dates/locations
- [ ] T020 [US1] In experience.md: Separate entries with horizontal rules (---)
- [ ] T021 [US1] Add Experience navigation link to src/config.ts navBarConfig.links (after About, before GitHub)
- [ ] T022 [US1] In config.ts: Use format `{ name: "Experience", url: "/experience", external: false }`
- [ ] T023 [US1] Test in `pnpm dev`: Navigate to http://localhost:4321/experience
- [ ] T024 [US1] Visual verification: Check layout matches About page (card with padding, proper spacing)
- [ ] T025 [US1] Visual verification: Verify Unicode symbols (•, ◦, →, ⇒) render correctly
- [ ] T026 [US1] Visual verification: Toggle light/dark mode - verify text remains readable
- [ ] T027 [US1] Visual verification: Test mobile view (320px width) - verify no horizontal scroll
- [ ] T028 [US1] Visual verification: Verify navigation menu shows "Experience" link and highlights when active

**Preservation Check**: ✅ 2 new files created, 2 existing files modified (surgical additions only)

**Checkpoint**: User Story 1 complete - Experience page fully functional and independently testable

---

## Phase 4: User Story 2 - View Educational Background (Priority: P2)

**Goal**: Visitors can navigate to and view Alex's educational background in a beautifully formatted page

**Independent Test**: Navigate to `/education` and verify all educational entries display with proper formatting (institution names, degrees, dates, achievements with formatted bullets)

### Implementation for User Story 2

- [ ] T029 [P] [US2] Create src/pages/education.astro following about.astro pattern (mirror experience.astro)
- [ ] T030 [US2] In education.astro: Import getEntry, render, MainGridLayout, Markdown, I18nKey, i18n
- [ ] T031 [US2] In education.astro: Add getEntry("spec", "education") with error handling
- [ ] T032 [US2] In education.astro: Use MainGridLayout with i18n(I18nKey.education) for title/description
- [ ] T033 [US2] In education.astro: Add card-base div with Markdown component wrapping Content
- [ ] T034 [P] [US2] Extract educational background from alex_argyriou_cv (1).pdf manually
- [ ] T035 [P] [US2] Create src/content/spec/education.md with H1 heading "Education"
- [ ] T036 [US2] In education.md: Add education entries in reverse chronological order using data-model.md structure
- [ ] T037 [US2] In education.md: Format each entry with H3 headings (Degree/Program • Institution Name)
- [ ] T038 [US2] In education.md: Use Unicode bullets (•, ◦) for achievements and coursework lists
- [ ] T039 [US2] In education.md: Use **bold** for section headers (Honors, Achievements), *italic* for dates/locations
- [ ] T040 [US2] In education.md: Separate entries with horizontal rules (---)
- [ ] T041 [US2] Add Education navigation link to src/config.ts navBarConfig.links (after Experience, before GitHub)
- [ ] T042 [US2] In config.ts: Use format `{ name: "Education", url: "/education", external: false }`
- [ ] T043 [US2] Test in `pnpm dev`: Navigate to http://localhost:4321/education
- [ ] T044 [US2] Visual verification: Check layout matches About and Experience pages
- [ ] T045 [US2] Visual verification: Verify Unicode symbols render correctly
- [ ] T046 [US2] Visual verification: Toggle light/dark mode - verify text remains readable
- [ ] T047 [US2] Visual verification: Test mobile view (320px width) - verify no horizontal scroll
- [ ] T048 [US2] Visual verification: Verify navigation menu shows "Education" link and highlights when active

**Preservation Check**: ✅ 2 new files created, 1 existing file modified (config.ts - 1 link added)

**Checkpoint**: User Story 2 complete - Education page fully functional and independently testable

---

## Phase 5: User Story 3 - Navigate Between CV Sections (Priority: P3)

**Goal**: Visitors can easily navigate between Experience, Education, and other site sections with clear visual indication of current page

**Independent Test**: Verify navigation links present in menu, clicking between sections works smoothly, active page visually indicated, keyboard navigation functional

### Implementation for User Story 3

- [ ] T049 [P] [US3] Test navigation from Home page: Click Experience link, verify page loads
- [ ] T050 [P] [US3] Test navigation from Experience page: Click Education link, verify page loads
- [ ] T051 [P] [US3] Test navigation from Education page: Click About link, verify page loads
- [ ] T052 [US3] Verify active page indication: On Experience page, verify "Experience" link is highlighted
- [ ] T053 [US3] Verify active page indication: On Education page, verify "Education" link is highlighted
- [ ] T054 [US3] Test keyboard navigation: Tab through navigation links, verify focus indicator visible
- [ ] T055 [US3] Test keyboard navigation: Press Enter on focused Experience link, verify navigation works
- [ ] T056 [US3] Test keyboard navigation: Press Enter on focused Education link, verify navigation works
- [ ] T057 [US3] Test on mobile: Verify navigation menu accessible and links work on narrow screens
- [ ] T058 [US3] Test browser back/forward buttons: Verify navigation history works correctly

**Preservation Check**: ✅ No new files or modifications - pure validation tasks

**Checkpoint**: User Story 3 complete - Navigation fully functional across all CV sections

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, documentation, and production readiness

- [ ] T059 [P] Run `pnpm check` - verify zero TypeScript errors
- [ ] T060 [P] Run `pnpm type-check` - verify all types resolve correctly
- [ ] T061 [P] Run `pnpm build` - verify production build succeeds
- [ ] T062 Verify static files generated: Check dist/experience/index.html exists
- [ ] T063 Verify static files generated: Check dist/education/index.html exists
- [ ] T064 Run `pnpm preview` and test production build locally
- [ ] T065 Execute Validation Scenario 1 from quickstart.md (Development Server)
- [ ] T066 Execute Validation Scenario 2 from quickstart.md (Responsive Design)
- [ ] T067 Execute Validation Scenario 4 from quickstart.md (Content Rendering)
- [ ] T068 Execute Validation Scenario 7 from quickstart.md (Accessibility - Lighthouse audit)
- [ ] T069 [P] Test cross-browser: Verify pages work in Chrome, Firefox, Safari
- [ ] T070 [P] Performance check: Verify page load times comparable to About page
- [ ] T071 Final visual review: Verify "beautiful and organized" requirement met (proper hierarchy, whitespace, formatting)
- [ ] T072 Git commit all changes with message: "feat: add professional experience and education portfolio sections"

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) ← BLOCKS all user stories
    ↓
    ├─→ Phase 3 (User Story 1 - P1) ← MVP
    ├─→ Phase 4 (User Story 2 - P2)
    └─→ Phase 5 (User Story 3 - P3)
    ↓
Phase 6 (Polish)
```

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 2 - No dependencies on other stories ✅ INDEPENDENTLY TESTABLE
- **User Story 2 (P2)**: Can start after Phase 2 - No dependencies on other stories ✅ INDEPENDENTLY TESTABLE
- **User Story 3 (P3)**: Depends on US1 and US2 being complete (needs both pages to test navigation between them)

### Within Each User Story

**User Story 1 (Experience page)**:
1. Create .astro page component (T009-T013) - can start immediately after Phase 2
2. Extract CV content and create .md file (T014-T020) - can run in parallel with page creation
3. Add navigation link (T021-T022) - can only run after .astro and .md files exist
4. Test and validate (T023-T028) - must run after all implementation complete

**User Story 2 (Education page)**:
1. Create .astro page component (T029-T033) - can start immediately after Phase 2 (parallel with US1)
2. Extract CV content and create .md file (T034-T040) - can run in parallel with page creation
3. Add navigation link (T041-T042) - can only run after .astro and .md files exist
4. Test and validate (T043-T048) - must run after all implementation complete

**User Story 3 (Navigation)**:
- All tasks (T049-T058) require US1 and US2 to be complete first

### Parallel Opportunities

**Phase 2 (Foundational)**: Tasks T006 and T007 can run in parallel (different language file entries)

**User Story 1**: 
- T009-T013 (create experience.astro) can run in parallel with T014-T020 (create experience.md content)

**User Story 2**:
- T029-T033 (create education.astro) can run in parallel with T034-T040 (create education.md content)

**Between User Stories**:
- Entire User Story 1 (Phase 3) can run in parallel with entire User Story 2 (Phase 4) if team has multiple developers
- Both US1 and US2 depend only on Phase 2, not on each other

**Phase 6 (Polish)**:
- T059, T060, T061 can run in parallel (different validation commands)
- T062, T063 can run in parallel (checking different output files)
- T069, T070 can run in parallel (different test categories)

---

## Parallel Example: Two Developers

**After Phase 2 completes:**

```bash
# Developer A works on User Story 1 (Experience)
Task T009-T013: Create experience.astro
Task T014-T020: Create experience.md (in parallel)
Task T021-T022: Add navigation link
Task T023-T028: Test and validate

# Developer B works on User Story 2 (Education) - starts simultaneously
Task T029-T033: Create education.astro
Task T034-T040: Create education.md (in parallel)
Task T041-T042: Add navigation link
Task T043-T048: Test and validate

# Both developers converge for Phase 5
Task T049-T058: Navigation testing (requires both pages complete)
```

---

## Implementation Strategy

### MVP First (Minimum Viable Product)

**Goal**: Get Professional Experience page live as quickly as possible

1. ✅ Complete Phase 1: Setup (3 tasks)
2. ✅ Complete Phase 2: Foundational (5 tasks) - CRITICAL BLOCKER
3. ✅ Complete Phase 3: User Story 1 (20 tasks) - **STOP HERE FOR MVP**
4. 🎯 Deploy and demo Experience page
5. Continue with Phase 4 (User Story 2) and Phase 5 (User Story 3) in subsequent iterations

**MVP Deliverable**: `/experience` page with professionally formatted work history, fully responsive, light/dark mode support

### Incremental Delivery Strategy

1. **Sprint 1**: Setup + Foundational + User Story 1 → Deploy Experience page
2. **Sprint 2**: User Story 2 → Deploy Education page
3. **Sprint 3**: User Story 3 + Polish → Complete feature with full navigation

Each sprint delivers independently testable, production-ready value.

### Single Developer Strategy

Complete phases sequentially in priority order:
1. Phase 1 (Setup) → 2. Phase 2 (Foundational) → 3. Phase 3 (US1 - P1) → 4. Phase 4 (US2 - P2) → 5. Phase 5 (US3 - P3) → 6. Phase 6 (Polish)

Leverage [P] tasks within each phase for focused work sessions (e.g., create both .astro and .md files in parallel by context-switching)

---

## File Impact Summary

**New Files Created**: 4
- src/pages/experience.astro
- src/pages/education.astro
- src/content/spec/experience.md
- src/content/spec/education.md

**Existing Files Modified**: 3 (surgical additions only)
- src/config.ts (2 navigation links added to navBarConfig.links array)
- src/i18n/i18nKey.ts (2 enum keys: experience, education)
- src/i18n/languages/en.ts (2 translations)

**Total Task Count**: 72 tasks
- Setup: 3 tasks
- Foundational: 5 tasks
- User Story 1 (P1): 20 tasks
- User Story 2 (P2): 20 tasks
- User Story 3 (P3): 10 tasks
- Polish: 14 tasks

**Estimated Effort**:
- MVP (Setup + Foundational + US1): ~4-6 hours (includes CV content extraction and formatting)
- Full Feature (All phases): ~8-12 hours

---

## Validation Criteria

Before marking feature complete, verify:

- ✅ All 72 tasks completed
- ✅ `/experience` and `/education` routes accessible and render correctly
- ✅ Navigation links appear in menu and work on all pages
- ✅ Active page indication functions properly
- ✅ Unicode symbols (•, ◦, →, ⇒) render correctly in all browsers
- ✅ Light and dark modes both work without visual bugs
- ✅ Responsive design works from 320px to 2560px width
- ✅ `pnpm check` passes with zero errors
- ✅ `pnpm build` succeeds and generates static files
- ✅ Content extracted from CV is accurate and complete
- ✅ Visual quality meets "beautiful and organized" requirement
- ✅ All Preservation Constitution principles satisfied (zero modifications to existing components)

---

## Notes

- **[P] marker**: Tasks marked [P] work on different files and can run in parallel
- **[Story] label**: Maps task to specific user story for traceability (US1, US2, US3)
- **No tests included**: Spec didn't request automated tests; manual validation via quickstart.md
- **CV content extraction**: Tasks T014-T020 and T034-T040 require manual extraction from alex_argyriou_cv (1).pdf
- **Constitution compliance**: All tasks follow Preservation-First and Minimal Change principles
- **Rollback plan**: Remove 4 new files, revert 3 modified files to previous state
- **Each user story independently testable**: Can deploy US1 alone as MVP, add US2 and US3 later

---

## References

- **Spec**: [spec.md](spec.md) - User stories and requirements
- **Plan**: [plan.md](plan.md) - Technical approach and architecture
- **Research**: [research.md](research.md) - Technical decisions and patterns
- **Data Model**: [data-model.md](data-model.md) - Content structure and formatting
- **Contracts**: [contracts/CVPortfolioPages.md](contracts/CVPortfolioPages.md) - Interface specifications
- **Quickstart**: [quickstart.md](quickstart.md) - Validation scenarios and testing guide
- **Constitution**: [.specify/memory/constitution.md](../../.specify/memory/constitution.md) - Project principles
