# Data Model: Giscus Comments

## Type Definitions

### GiscusConfig

Global configuration for Giscus integration.

```typescript
export interface GiscusConfig {
  /** GitHub repository in format "owner/repo" */
  repo: string;
  
  /** Repository ID from Giscus setup */
  repoId: string;
  
  /** Discussion category name */
  category: string;
  
  /** Category ID from Giscus setup */
  categoryId: string;
  
  /** How to map posts to discussions */
  mapping: GiscusMapping;
  
  /** Enable reactions on comments */
  reactionsEnabled: boolean;
  
  /** Emit discussion metadata */
  emitMetadata: boolean;
  
  /** Where to place input box */
  inputPosition: "top" | "bottom";
  
  /** Theme (will be overridden by blog theme) */
  theme: GiscusTheme;
  
  /** Language code */
  lang: string;
  
  /** Enable comments by default on all posts */
  defaultEnabled: boolean;
  
  /** Allow lazy loading */
  loading: "lazy" | "eager";
}
```

### GiscusMapping

Discussion mapping strategies.

```typescript
export type GiscusMapping = 
  | "pathname"    // Map by URL pathname (recommended)
  | "url"         // Map by full URL
  | "title"       // Map by page title
  | "og:title"    // Map by og:title meta tag
  | "specific"    // Manually specify discussion
  | "number";     // Map by discussion number
```

### GiscusTheme

Theme options for Giscus widget.

```typescript
export type GiscusTheme =
  | "light"
  | "light_high_contrast"
  | "light_protanopia"
  | "light_tritanopia"
  | "dark"
  | "dark_high_contrast"
  | "dark_protanopia"
  | "dark_tritanopia"
  | "dark_dimmed"
  | "transparent_dark"
  | "preferred_color_scheme"  // Respect system preference
  | `https://${string}`;      // Custom theme URL
```

### Post Frontmatter Extension

Schema extension for blog posts.

```typescript
// Extension to existing postsCollection schema
{
  // ... existing fields (title, published, etc.)
  
  /** Enable/disable comments on this post */
  commentsEnabled?: boolean;
  
  /** Specific GitHub Discussion number (optional) */
  discussionNumber?: number;
}
```

---

## Configuration Example

### src/config.ts

```typescript
import type { GiscusConfig } from '@/types/giscus';

export const giscusConfig: GiscusConfig = {
  repo: "AlexanderArgyriou/pixel-pistons",
  repoId: "R_kgDOL...",  // Replace with actual from Giscus
  category: "Blog Comments",
  categoryId: "DIC_kwDOL...",  // Replace with actual from Giscus
  mapping: "pathname",
  reactionsEnabled: true,
  emitMetadata: false,
  inputPosition: "bottom",
  theme: "preferred_color_scheme",
  lang: "en",
  defaultEnabled: false,
  loading: "lazy",
};
```

### Post Frontmatter Examples

**Enable comments with auto-mapping**:
```yaml
---
title: "My Post"
published: 2026-07-10
commentsEnabled: true
---
```

**Enable comments with specific discussion**:
```yaml
---
title: "My Post"
published: 2026-07-10
commentsEnabled: true
discussionNumber: 42
---
```

**Explicitly disable comments**:
```yaml
---
title: "My Post"
published: 2026-07-10
commentsEnabled: false
---
```

**Use global default** (no fields):
```yaml
---
title: "My Post"
published: 2026-07-10
# commentsEnabled defaults to giscusConfig.defaultEnabled
---
```

---

## Data Flow

```
┌─────────────────┐
│  Post Markdown  │
│   (frontmatter) │
└────────┬────────┘
         │ commentsEnabled?, discussionNumber?
         ▼
┌─────────────────┐
│  PostPage.astro │ ◄──── giscusConfig
│  (conditional)  │       (global defaults)
└────────┬────────┘
         │ if enabled
         ▼
┌─────────────────┐
│ GiscusComments  │ ◄──── giscusConfig
│     .svelte     │       (repo, repoId, etc.)
└────────┬────────┘
         │ creates <script> tag
         ▼
┌─────────────────┐
│  Giscus Widget  │ ◄──── GitHub Discussions API
│   (iframe)      │       (fetch comments)
└─────────────────┘
```

---

## Schema Extension Code

### src/content/config.ts

```typescript
import { defineCollection, z } from 'astro:content';

const postsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    // ... existing fields
    title: z.string(),
    published: z.date(),
    // ... etc.
    
    // NEW: Giscus fields
    commentsEnabled: z.boolean().optional(),
    discussionNumber: z.number().int().positive().optional(),
  }),
});

export const collections = {
  posts: postsCollection,
  spec: specCollection,
};
```

---

## Giscus Script Attributes

When GiscusComments.svelte creates the script tag, it sets these data-* attributes:

```html
<script
  src="https://giscus.app/client.js"
  data-repo="AlexanderArgyriou/pixel-pistons"
  data-repo-id="R_kgDOL..."
  data-category="Blog Comments"
  data-category-id="DIC_kwDOL..."
  data-mapping="pathname"
  data-strict="0"
  data-reactions-enabled="1"
  data-emit-metadata="0"
  data-input-position="bottom"
  data-theme="preferred_color_scheme"
  data-lang="en"
  data-loading="lazy"
  crossorigin="anonymous"
  async
></script>
```

If `discussionNumber` prop is provided:
```html
data-mapping="number"
data-discussion-number="42"
```

---

## Type Safety

All types exported from `src/types/giscus.ts`:

```typescript
export type { GiscusConfig, GiscusMapping, GiscusTheme };
```

Imported where needed:
```typescript
// src/config.ts
import type { GiscusConfig } from '@/types/giscus';

// src/components/GiscusComments.svelte
import { giscusConfig } from '@/config';
import type { GiscusTheme } from '@/types/giscus';
```
