# Component Contract: GiscusComments.svelte

## Overview

A Svelte 5 component that embeds the Giscus comments widget into blog posts. Handles dynamic script injection, configuration, and theme synchronization.

---

## Component API

### Props

```typescript
interface Props {
  /** 
   * Optional specific GitHub Discussion number.
   * If provided, uses "number" mapping instead of "pathname".
   */
  discussionNumber?: number;
  
  /**
   * Optional CSS classes for the container
   */
  class?: string;
}
```

### Usage

**Basic usage** (pathname mapping):
```svelte
<GiscusComments client:load />
```

**With specific discussion**:
```svelte
<GiscusComments discussionNumber={42} client:load />
```

**With custom styling**:
```svelte
<GiscusComments class="my-custom-class" client:load />
```

---

## Configuration

Component reads from `giscusConfig` in `src/config.ts`:

```typescript
import { giscusConfig } from '@/config';
```

**Required config fields**:
- `repo`: GitHub repository
- `repoId`: Repository ID from Giscus
- `category`: Discussion category
- `categoryId`: Category ID from Giscus

**Optional config fields**:
- `mapping`: Default "pathname"
- `theme`: Default "preferred_color_scheme"
- `lang`: Default "en"
- `reactionsEnabled`: Default true
- `inputPosition`: Default "bottom"
- `loading`: Default "lazy"

---

## Behavior

### Lifecycle

1. **Component Mount**:
   - `onMount` hook triggered
   - Create `<script>` element
   - Set `src` to Giscus CDN
   - Set all `data-*` attributes from config
   - Append to container div

2. **Script Load**:
   - Giscus script loads asynchronously
   - Creates `<iframe>` inside container
   - Fetches discussion from GitHub
   - Renders comments widget

3. **User Interaction**:
   - All handled by Giscus widget
   - Sign in, post, react, reply
   - No component logic needed

### Mapping Strategy

**If `discussionNumber` prop provided**:
```html
data-mapping="number"
data-discussion-number="{discussionNumber}"
```

**Otherwise** (default):
```html
data-mapping="pathname"
```

### Theme Handling

Uses `preferred_color_scheme` by default:
- Respects user's system theme
- Automatically switches with system
- Blog theme toggle should sync (future enhancement)

---

## Rendered HTML

**Container**:
```html
<div class="giscus-container {class}">
  <script src="https://giscus.app/client.js" ...></script>
  <!-- Giscus injects iframe here -->
</div>
```

**Giscus iframe** (injected by script):
```html
<iframe 
  class="giscus-frame" 
  title="Comments" 
  src="https://giscus.app/en/widget?..."
  loading="lazy"
></iframe>
```

---

## Styling

### Container Classes

Default container receives Tailwind classes:
```svelte
<div class="giscus-container w-full">
```

Custom classes appended via `class` prop.

### Theme CSS

Giscus respects CSS custom properties:
```css
:root {
  color-scheme: light dark;
}

.giscus-frame {
  color-scheme: light dark;
}
```

Blog's existing theme variables work automatically.

---

## Error Handling

**No explicit error handling needed**:
- Giscus script handles loading errors
- Invalid config shows Giscus error UI
- Missing discussion shows "Start discussion" prompt

**Script load failure**:
- User sees empty container
- No JavaScript errors thrown
- Silent degradation

---

## Accessibility

Giscus widget is accessible by default:
- Semantic HTML in iframe
- Keyboard navigation
- ARIA labels
- Screen reader friendly

**Container considerations**:
- Proper heading hierarchy before component
- Skip link for users who want to skip comments
- Focus management handled by Giscus

---

## Performance

### Bundle Size
- Component: ~1KB
- Giscus script: ~4KB gzipped
- Total: ~5KB

### Loading Strategy
- Script loads asynchronously (non-blocking)
- `loading="lazy"` defers iframe until scroll
- Minimal impact on FCP/LCP

### Caching
- Giscus script cached by CDN
- Comments cached by GitHub
- No client-side caching needed

---

## Security

### Script Source
- Loads from trusted CDN: `https://giscus.app`
- `crossorigin="anonymous"` for CORS
- `async` to prevent blocking

### Content Security Policy
Required CSP directives:
```
script-src 'self' https://giscus.app;
frame-src https://giscus.app;
style-src 'self' 'unsafe-inline' https://giscus.app;
```

### GitHub Authentication
- Handled by Giscus iframe
- OAuth flow opens in popup
- No credentials exposed to parent

---

## Testing

### Unit Tests
Not applicable - component is a thin wrapper.

### Integration Tests
See [quickstart.md](../quickstart.md) for scenarios:
1. Display widget on enabled post
2. Respect commentsEnabled flag
3. Handle specific discussion number
4. Theme synchronization
5. Responsive layout

### Manual Testing
1. Visit post with `commentsEnabled: true`
2. Verify Giscus widget loads
3. Sign in with GitHub
4. Post a test comment
5. Verify comment appears in GitHub Discussions

---

## Maintenance

### Giscus Updates
- No action needed for minor updates
- Giscus script auto-updates from CDN
- Monitor release notes: https://github.com/giscus/giscus

### Breaking Changes
- Watch Giscus changelog
- Test on staging before deploying
- Config changes may require redeployment

### Troubleshooting

**Widget doesn't load**:
- Check GitHub Discussions enabled
- Verify repoId and categoryId correct
- Check browser console for errors

**Wrong discussion shown**:
- Verify mapping strategy (pathname vs number)
- Check discussionNumber prop
- Ensure URL path is stable

**Theme mismatch**:
- Verify `data-theme` attribute set
- Check CSS custom properties
- May need theme toggle integration

---

## Dependencies

**Runtime**:
- Svelte 5 (`svelte`)
- Giscus script (CDN)

**Dev**:
- TypeScript
- Astro (parent framework)

**No npm packages required** beyond Svelte core.

---

## Example Implementation

See [src/components/GiscusComments.svelte](../../src/components/GiscusComments.svelte) for complete implementation.
