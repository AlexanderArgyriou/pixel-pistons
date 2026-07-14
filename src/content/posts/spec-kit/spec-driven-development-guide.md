---
title: "Spec Driven Development: A Practical Guide with SpecKit"
published: 2026-07-11
description: "Learn how spec-driven development can transform your workflow from chaos to clarity. A deep dive into SpecKit with real examples and lessons learned."
category: "Software Development"
tags: ["Development Methodology", "SpecKit", "Software Engineering", "Best Practices", "Workflow"]
commentsEnabled: true
image: ./spec-kit.jpeg
---

# Spec-Driven Development: A Practical Guide with SpecKit

Starting features with enthusiasm and ending three days later wondering what you were actually building is common. Spec-driven development fixes this.

## The Problem

A feature request arrives: "add comments to blog posts." Your brain jumps to implementation: GitHub API, markdown rendering, localStorage caching.

Two weeks later:
- Caching is overly complex
- Repo name hardcoded in five places
- No rate limit handling
- Mobile layout broken
- Forgot the "disable comments per post" requirement

The issue isn't coding skills—it's jumping into implementation before understanding what you're building.

## Spec-Driven Development

**Write a detailed specification before writing code.** This isn't waterfall documentation. It's lightweight and practical.

The process:
1. **Specify** what you're building (what and why, not how)
2. **Plan** how you'll build it (technical decisions, trade-offs)
3. **Break down** into actionable tasks
4. **Implement** with confidence

Each step forces thinking at the right abstraction level. You clarify user needs before designing schemas. You understand constraints before picking libraries.

## SpecKit

[SpecKit](https://github.com/speckit/speckit) codifies this workflow with opinionated structure.

Four main commands:

```bash
speckit specify   # Create the feature specification
speckit plan      # Generate the implementation plan
speckit tasks     # Break down into actionable tasks
speckit implement # Execute the tasks
```

Each command builds on the previous one. Here's a real example.

## Example: Adding Giscus Comments

I recently added comments to this blog. Instead of diving into code, I used SpecKit.

### Step 1: Specification

Ran `speckit specify` with:

> "Comment section under each post using GitHub comments"

SpecKit generated:

```markdown
# Feature Specification: Giscus Comments Integration

## Feature Overview

Enable blog post comments using **Giscus** - a comments system 
powered by GitHub Discussions. Readers can discuss posts using 
their GitHub accounts without leaving the blog.

## User Stories

### US1: Display Giscus Comments Widget (P1)

**As a** blog reader  
**I want to** see a comments section under blog posts  
**So that** I can read and participate in discussions

**Acceptance Criteria**:
- Giscus widget loads on posts where commentsEnabled: true
- Widget displays existing discussion comments from GitHub
- Widget matches blog's light/dark theme automatically
- Loading state shows graceful placeholder
- Widget is responsive on all screen sizes
```

Notice what's missing: no React vs Vue, no database schemas, no API endpoints. Just user-facing requirements.

The spec included non-goals:

```markdown
## Non-Goals

- Custom comment UI (use Giscus default)
- Email notifications (handled by GitHub)  
- Comment editing within blog (use GitHub Discussions)
- Anonymous comments (GitHub authentication required)
```

Non-goals define scope boundaries. Write them down so future-you doesn't waste time on features you explicitly decided against.

### Step 2: Implementation Plan

`speckit plan` generated the technical plan—actual engineering decisions:

```markdown
# Implementation Plan: Giscus Comments Integration

## Constitution Compliance Check

✅ Preservation-First: Fuwari template structure untouched
✅ Minimal Change: Single new component
✅ Component Isolation: Zero dependencies on existing components
✅ Configuration Over Code: All settings in src/config.ts
✅ Development Validation: TypeScript strict mode enabled

## Tech Stack Analysis

**Existing Stack**:
- Framework: Astro 5.x (SSG)
- UI: Svelte 5
- Styling: Tailwind CSS 3.x
- Package Manager: pnpm

**New Dependencies**:
- Giscus: CDN-hosted script (no npm dependencies needed)

## Implementation Strategy

### Phase 1: Setup & Configuration
- Create src/types/giscus.ts
- Add giscusConfig to src/config.ts
- Extend content schema

### Phase 2: Component Implementation
- Create GiscusComments.svelte
- Dynamic script injection via onMount
- Handle theme synchronization
```

The plan also showed file changes:

```
src/
├── components/
│   └── GiscusComments.svelte          (NEW - 50 lines)
├── types/
│   └── giscus.ts                       (NEW - 20 lines)
├── config.ts                           (MODIFY - add 15 lines)
```

Before writing code, I knew I'd touch three files and add about 85 lines. No surprises.

### Step 3: Task Breakdown

Running `speckit tasks` broke the work into 47 concrete tasks:

```markdown
## Phase 1: Setup & Type Definitions

- [ ] T001 Create specs/002-giscus-comments/ directory structure
- [ ] T002 Create src/types/giscus.ts with interfaces
- [ ] T003 Verify existing dependencies

## Phase 2: Configuration & Schema

- [ ] T004 Add giscusConfig export to src/config.ts
- [ ] T005 Extend postsCollection schema with commentsEnabled field
- [ ] T006 Update .gitignore if needed

## Phase 3: Component Implementation

- [ ] T007 [US1] Create GiscusComments.svelte skeleton
- [ ] T008 [US1] Implement onMount hook for script injection
- [ ] T009 [US1] Set all data-* attributes from config
```

Each task is actionable, testable, and scoped. Tasks are tagged with user stories `[US1]` for tracking.

### Step 4: Implementation

I implemented manually using the task list as a guide. One evening instead of the usual weekend of refactoring.

Final component (50 lines):

```svelte
<script lang="ts">
  import { onMount } from "svelte";
  import { giscusConfig } from "@/config";

  interface Props {
    discussionNumber?: number;
    class?: string;
  }

  let { discussionNumber, class: className = "" }: Props = $props();
  let container: HTMLDivElement;

  onMount(() => {
    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", giscusConfig.repo);
    script.setAttribute("data-repo-id", giscusConfig.repoId);
    script.setAttribute("data-category", giscusConfig.category);
    script.setAttribute("data-category-id", giscusConfig.categoryId);

    if (discussionNumber) {
      script.setAttribute("data-mapping", "number");
      script.setAttribute("data-discussion-number", discussionNumber.toString());
    } else {
      script.setAttribute("data-mapping", giscusConfig.mapping);
    }

    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", 
      giscusConfig.reactionsEnabled ? "1" : "0");
    script.setAttribute("data-theme", giscusConfig.theme);
    script.setAttribute("data-lang", giscusConfig.lang);
    script.crossOrigin = "anonymous";
    script.async = true;

    container.appendChild(script);
  });
</script>

<div bind:this={container} class="giscus-container w-full {className}"></div>
```

Clean, simple, no scope creep. Just the feature, shipped.

## vs. Other Methodologies

**Test-Driven Development (TDD)**: Write tests first, implement to pass. Great for algorithms and correctness, but doesn't help figure out *what* to build. TDD starts at code level; SDD starts at product level. They're complementary.

**Behavior-Driven Development (BDD)**: Uses Gherkin scenarios to bridge product and engineering. Similar to SDD but test-focused. Specs are broader—they include architecture, trade-offs, and non-functional requirements.

**Documentation-First**: Usually either too detailed (becomes outdated immediately) or too vague (doesn't constrain implementation). Specs are the middle ground.

**Ad-Hoc Development**: Works for prototypes, very small features, or problems you've solved repeatedly. For everything else, you end up refactoring because requirements weren't thought through.

## Benefits and Trade-offs

**Benefits:**
- Clarity before code
- Easy PR reviews with context
- Onboarding documentation
- Less refactoring (catch design flaws in planning)
- Better estimates

**Trade-offs:**
- Upfront time investment
- Overhead for tiny changes
- Can feel slow at first
- Requires discipline

The key is knowing when to use it. Greenfield features? Yes. Bug fixes? No. Infrastructure changes? Yes. Typo in README? No.

## Getting Started

```bash
# Install SpecKit
npm install -g speckit-cli

# Initialize in your project
cd your-project
speckit init

# Create your first spec
speckit specify "Add user authentication with OAuth2"
```

SpecKit interviews you about the feature, generates a spec. Edit it, then:

```bash
speckit plan    # Generate implementation plan
speckit tasks   # Break into tasks
```

Implement manually or use `speckit implement` for AI assistance.

## Lessons Learned

After six months:

**Specs evolve**: Your first spec won't be perfect. Update it as you discover edge cases.

**Write for future-you**: Document decisions. You won't remember why in three months.

**Keep specs focused**: If it's 10+ pages, it's either multiple features or too detailed. Good specs are 1-3 pages, readable in 10 minutes.

**Use a constitution**: Document development principles. SpecKit can check plans against it. Mine includes: preserve template structure, minimal changes, configuration over code, component isolation.

**Customize templates**: Codify your team's practices. My templates include constitution compliance, performance considerations, security implications, and rollback plans.

## When NOT to Use This

- Prototypes (you're exploring and learning)
- Trivial changes (typo fixes)
- Emergency fixes (production down? Fix first, spec later)
- Solo side projects (overhead may not be worth it)

The sweet spot: **greenfield features** in **production systems** with **multiple contributors**.

## Wrapping Up

Spec-driven development forces you to think before coding. SpecKit codifies a workflow good teams already follow informally.

If you're getting lost mid-implementation or constantly clarifying requirements, try it. Next feature, spend 30 minutes writing a spec—just user stories and acceptance criteria. See how it feels.

**Resources**: [SpecKit Docs](https://speckit.dev) • [Spec-Driven Development Manifesto](https://specdriven.dev)
