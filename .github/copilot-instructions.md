# Project-specific guidance for GitHub Copilot agents

> **📌 See [`AGENTS.md`](../AGENTS.md) in the project root for the single source of truth.**
>
> This file provides a summary. For complete, authoritative instructions, always refer to `AGENTS.md`.

---

## 🚨 Critical: This is a Nuxt 4 Project

**Nuxt 4 uses a different directory structure than Nuxt 3.**

### Nuxt 4 Directory Structure
```
webTrainer/
├── app/                    # srcDir - ALL app code lives here
│   ├── app.vue            # Root component
│   ├── components/        # Vue components (auto-imported)
│   ├── composables/       # Composables (auto-imported)
│   ├── pages/             # File-based routing
│   └── ...
├── server/                # Server code - NOT inside app/
├── public/                # Static assets - NOT inside app/
└── nuxt.config.ts
```

### DO NOT:
- ❌ Put components in root `/components/` - use `/app/components/`
- ❌ Use `#imports` - import from `'vue'` instead
- ❌ Use `@apply` with arbitrary values in `<style>` blocks (Tailwind 4 limitation)
- ❌ Assume Nuxt 3 directory conventions

---

## Quick Reference

| Topic | Details |
|-------|---------|
| **Framework** | Nuxt 4.2+ (Vue 3.5+) |
| **UI** | Nuxt UI 4.2+ (Tailwind CSS 4) |
| **Package Manager** | pnpm |
| **Component Pattern** | `<script setup lang="ts">` |
| **Linting** | oxlint (TypeScript-aware) |

## Commands
```bash
pnpm install   # Install + nuxt prepare
pnpm dev       # Dev server
pnpm build     # Production build
pnpm lint      # Lint check
```

---

For complete documentation including:
- Full directory structure explanation
- Code patterns and examples
- Tailwind CSS 4 limitations
- Auto-import behavior
- Current app features

**→ See [`AGENTS.md`](../AGENTS.md)**
