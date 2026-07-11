---
title: "Giscus Comments Setup Guide"
published: 2026-07-10
description: "Complete guide to enabling and configuring Giscus comments on blog posts"
category: "Guide"
draft: false
tags: ["Giscus", "Comments", "Setup", "GitHub Discussions"]
commentsEnabled: false
---

# Giscus Comments Setup Guide

This blog uses [Giscus](https://giscus.app) for comments - a comments system powered by GitHub Discussions.

## What is Giscus?

Giscus is a comments widget that uses GitHub Discussions as the backend. It provides:
- 🔐 GitHub authentication (no spam!)
- 💬 Threaded conversations
- ❤️ Reactions and emoji support
- 🎨 Automatic theme matching
- 🔒 Full moderation control via GitHub

## Prerequisites Setup

Before using comments, the repository owner must complete these one-time steps:

### 1. Enable GitHub Discussions

1. Go to repository Settings
2. Scroll to "Features" section
3. Check "Discussions"
4. Click "Set up discussions"

### 2. Create Discussion Category

1. Go to Discussions tab
2. Create new category: "Blog Comments"
3. Note the category name

### 3. Install Giscus App

1. Visit https://github.com/apps/giscus
2. Install on your repository
3. Grant necessary permissions

### 4. Get Configuration

1. Visit https://giscus.app
2. Enter your repository
3. Select "Blog Comments" category
4. Copy the generated `repoId` and `categoryId`
5. Update `src/config.ts` with these values

## Enabling Comments on Posts

### Per-Post Configuration

Add to your post's frontmatter:

```yaml
---
title: "Your Post Title"
published: 2026-07-10
commentsEnabled: true  # Enable comments for this post
---
```

### Disable Comments

```yaml
---
title: "Your Post Title"
published: 2026-07-10
commentsEnabled: false  # Explicitly disable
---
```

### Link to Specific Discussion

If you want to use a specific GitHub Discussion:

```yaml
---
title: "Your Post Title"
published: 2026-07-10
commentsEnabled: true
discussionNumber: 42  # Link to discussion #42
---
```

## Global Configuration

Default settings are in `src/config.ts`:

```typescript
export const giscusConfig: GiscusConfig = {
  repo: "owner/repo",
  repoId: "R_kgDO...",
  category: "Blog Comments",
  categoryId: "DIC_kwDO...",
  mapping: "pathname",          // How posts map to discussions
  reactionsEnabled: true,       // Allow reactions
  inputPosition: "bottom",      // Input box position
  theme: "preferred_color_scheme", // Auto theme matching
  lang: "en",                   // Language
  defaultEnabled: false,        // Comments off by default
  loading: "lazy",              // Lazy load for performance
};
```

### Key Settings

- **defaultEnabled**: If `false`, you must explicitly enable comments per post
- **mapping**: "pathname" creates discussions automatically based on URL
- **theme**: "preferred_color_scheme" matches system theme

## How It Works

1. **Auto-Creation**: When someone visits a post with comments enabled, Giscus automatically creates a GitHub Discussion if one doesn't exist
2. **Real-Time Sync**: Comments sync instantly between the blog and GitHub Discussions
3. **Moderation**: Use GitHub Discussions tools to moderate, edit, or delete comments
4. **Threading**: Replies create threaded conversations
5. **Reactions**: Readers can add reactions (👍, ❤️, 🎉, etc.)

## Moderation

All moderation happens in GitHub Discussions:
- Edit or delete comments
- Lock discussions
- Block users
- Move discussions between categories
- Convert discussions to issues

## Troubleshooting

### Widget Doesn't Load

- ✅ Check GitHub Discussions is enabled
- ✅ Verify Giscus app is installed
- ✅ Confirm `repoId` and `categoryId` are correct
- ✅ Check browser console for errors

### Wrong Discussion Shows

- ✅ Verify mapping strategy (pathname vs number)
- ✅ Check URL path is stable
- ✅ Ensure `discussionNumber` is correct if using specific mapping

### Theme Mismatch

- ✅ Use "preferred_color_scheme" for automatic theme matching
- ✅ Check CSS custom properties are defined
- ✅ Verify system theme preference

## Additional Resources

- [Giscus Official Site](https://giscus.app)
- [Giscus GitHub Repository](https://github.com/giscus/giscus)
- [GitHub Discussions Documentation](https://docs.github.com/en/discussions)

## Configuration

### Global Settings (src/config.ts)

```typescript
export const githubConfig: GitHubConfig = {
	owner: "AlexanderArgyriou",      // Your GitHub username or org
	repo: "pixel-pistons",            // Your repository name
	defaultEnabled: false,            // Default: comments disabled, opt-in per post
	maxCommentsDisplay: 20,           // Maximum comments to show initially
};
```

### Per-Post Settings (Frontmatter)

Add these fields to your blog post frontmatter to enable comments:

```yaml
---
title: "Your Post Title"
published: 2026-07-10
description: "Post description"

# GitHub Comments Configuration
githubIssue: 42                   # GitHub issue number for this post
commentsEnabled: true             # Enable comments (optional if defaultEnabled is true)
---
```

## Setup Steps

### 1. Create a GitHub Issue for Discussion

1. Go to your repository: `https://github.com/{owner}/{repo}/issues`
2. Click "New Issue"
3. Title: Use your blog post title or "Comments: [Post Title]"
4. Description: Add a link to your blog post and invite discussion
5. Note the issue number (e.g., #42)

### 2. Enable Comments on Your Post

Add the GitHub issue number to your post's frontmatter:

```yaml
---
title: "My Blog Post"
published: 2026-07-10
githubIssue: 42
commentsEnabled: true
---
```

### 3. Publish and Test

1. Save your post
2. Run `pnpm dev` to test locally
3. Navigate to your post
4. Scroll down to see the comments section
5. Comments from GitHub issue #42 will display

## Field Reference

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `githubIssue` | number | No | - | GitHub issue number to fetch comments from |
| `commentsEnabled` | boolean | No | `githubConfig.defaultEnabled` | Override global setting to enable/disable comments |

## Examples

### Enable Comments (with defaultEnabled: false)

```yaml
---
title: "Post with Comments"
githubIssue: 42
commentsEnabled: true
---
```

### Disable Comments (with defaultEnabled: true)

```yaml
---
title: "Post without Comments"
commentsEnabled: false
---
```

### Use Global Default

```yaml
---
title: "Post using Default"
githubIssue: 42
# commentsEnabled will use githubConfig.defaultEnabled
---
```

## States

### No Comments Yet (Empty State)

If the GitHub issue has no comments, visitors see:
- "No comments yet" message
- "Start the discussion on GitHub" link

### Error States

- **Issue Not Found (404)**: "Discussion not found" with link to GitHub
- **Rate Limited (403)**: "Comments temporarily unavailable (rate limited)"
- **Network Error**: "Unable to load comments" with link to view on GitHub

### Loading State

While fetching from GitHub API, visitors see animated skeleton loaders.

## Advanced Configuration

### Rate Limits

- **Unauthenticated**: 60 requests/hour per IP
- **Authenticated**: 5,000 requests/hour (add GitHub token)

To increase rate limits, add a GitHub Personal Access Token:

```typescript
export const githubConfig: GitHubConfig = {
	owner: "YourUsername",
	repo: "your-repo",
	token: import.meta.env.GITHUB_TOKEN,  // From environment variable
	defaultEnabled: false,
	maxCommentsDisplay: 20,
};
```

Create `.env` file:
```
GITHUB_TOKEN=ghp_your_token_here
```

### Caching

Comments are cached in browser sessionStorage for 5 minutes to reduce API calls.

## Troubleshooting

### Comments Not Showing

1. ✅ Check `githubIssue` is a valid number in frontmatter
2. ✅ Verify issue exists in your repository
3. ✅ Confirm `commentsEnabled: true` or `defaultEnabled: true`
4. ✅ Check browser console for errors

### 403 Rate Limit Error

- Wait 1 hour for rate limit to reset (unauthenticated)
- Add GitHub token for higher limits (5000/hr)
- Verify caching is working (check sessionStorage in DevTools)

### Markdown Not Rendering

- Comments use GitHub-flavored Markdown
- HTML is disabled for security (XSS protection)
- Images, links, and code blocks are supported
