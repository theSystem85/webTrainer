# AGENTS.md - AI Agent Instructions for webTrainer

> **This is the single source of truth for AI agents (GitHub Copilot, Claude, etc.) working on this project.**

## 🚨 Critical: Nuxt 4 Project Structure

This project uses **Nuxt 4**, which has a **different directory structure** than Nuxt 3. Do NOT assume Nuxt 3 conventions.

### Nuxt 4 Directory Structure

```
webTrainer/
├── app/                    # srcDir - ALL app code lives here
│   ├── app.vue            # Root component
│   ├── components/        # Vue components (auto-imported)
│   ├── composables/       # Composables (auto-imported)
│   ├── pages/             # File-based routing
│   ├── layouts/           # (if needed) Layout components
│   ├── middleware/        # (if needed) Route middleware
│   └── plugins/           # (if needed) Nuxt plugins
├── server/                # Server code (Nitro) - NOT inside app/
├── public/                # Static assets - NOT inside app/
├── content/               # @nuxt/content files - NOT inside app/
├── layers/                # (if needed) Nuxt layers - NOT inside app/
├── modules/               # (if needed) Local modules - NOT inside app/
├── nuxt.config.ts         # Nuxt configuration
├── package.json
└── tsconfig.json
```

### Key Differences from Nuxt 3

| Nuxt 3 Location | Nuxt 4 Location |
|-----------------|-----------------|
| `/components/` | `/app/components/` |
| `/composables/` | `/app/composables/` |
| `/pages/` | `/app/pages/` |
| `/layouts/` | `/app/layouts/` |
| `/middleware/` | `/app/middleware/` |
| `/plugins/` | `/app/plugins/` |
| `/assets/` | `/app/assets/` |
| `/server/` | `/server/` (unchanged) |
| `/public/` | `/public/` (unchanged) |

### Why This Matters

1. **Performance**: Nuxt 4 separates app code from config to avoid FS watcher issues with `node_modules/` and `.git/`
2. **IDE Type Safety**: Server code and app code run in different contexts with different globals
3. **Auto-imports**: Components, composables, and utilities are auto-imported from `app/` subdirectories

## Architecture Overview

### Tech Stack
- **Framework**: Nuxt 4.2+ (Vue 3.5+)
- **UI Library**: Nuxt UI 4.2+ (includes Tailwind CSS 4)
- **Package Manager**: pnpm (workspace enabled)
- **Linting**: oxlint with TypeScript-aware rules

### Modules in Use
These modules are configured in `nuxt.config.ts`:
- `@nuxt/content` - Content management
- `@nuxt/ui` - UI components (UButton, UCard, UInput, etc.)
- `@nuxt/image` - Image optimization
- `@nuxt/scripts` - Third-party scripts
- `@nuxt/test-utils` - Testing utilities
- `@nuxt/hints` - Performance hints

### Component Pattern
All components use `<script setup lang="ts">`:

```vue
<template>
  <!-- Template content -->
</template>

<script setup lang="ts">
// Imports from 'vue' - NOT from '#imports' or '@vue/reactivity'
import { ref, computed, watch } from 'vue'

// Props definition
const props = defineProps<{
  techId: string
}>()

// Emits definition
const emit = defineEmits<{
  saved: [id: string]
}>()

// Composables
const { data } = useSkillStore()
</script>

<style scoped>
/* Scoped styles */
</style>
```

### Auto-Import Behavior
- Vue utilities (`ref`, `computed`, `watch`, etc.) - import from `'vue'`
- Nuxt composables (`useRoute`, `useHead`, etc.) - auto-imported
- Custom composables in `app/composables/` - auto-imported
- Components in `app/components/` - auto-imported (use PascalCase names)
- Nuxt UI components (`UButton`, `UCard`, etc.) - auto-imported

### Tailwind CSS 4 Limitations
⚠️ **Tailwind CSS 4 does NOT support `@apply` with arbitrary values in `<style>` blocks.**

```vue
<!-- ❌ WRONG - Will fail -->
<style scoped>
.my-class {
  @apply bg-[#030712];
}
</style>

<!-- ✅ CORRECT - Use raw CSS -->
<style scoped>
.my-class {
  background-color: #030712;
}
</style>

<!-- ✅ ALSO CORRECT - Use Tailwind classes in template -->
<template>
  <div class="bg-gray-950">...</div>
</template>
```

## Developer Workflows

### Installation
```bash
pnpm install          # Preferred - respects workspace config
```

### Development
```bash
pnpm dev              # Start dev server (nuxt dev)
pnpm build            # Production build
pnpm generate         # Static generation
pnpm preview          # Preview production build
pnpm lint             # Run oxlint (type-aware)
```

### After Structure Changes
If you modify the directory structure or add new auto-imported files:
```bash
pnpm install          # Runs nuxt prepare via postinstall
```

## Code Style & Conventions

### From `.oxlintrc.json`:
- 2-space indentation
- No semicolons
- TypeScript-clean (`no-floating-promises`, `no-unused-vars`)
- Prefer `const` over `let`
- Use template literals over string concatenation

### Component Naming
- Use PascalCase for component files: `TechnologyList.vue`
- Use PascalCase in templates: `<TechnologyList />`

### Type Definitions
- Define types in composables or dedicated `.ts` files in `app/types/`
- Export shared types for reuse

## Important Files Reference

| File | Purpose |
|------|---------|
| `app/app.vue` | Root component, renders `<NuxtPage />` |
| `app/pages/index.vue` | Main page - Skill Trainer app |
| `app/composables/useSkillStore.ts` | State management for technologies/assessments |
| `app/composables/useSettings.ts` | User settings state |
| `app/composables/useOpenAI.ts` | OpenAI API integration |
| `app/composables/useSpeech.ts` | Text-to-speech wrapper |
| `nuxt.config.ts` | Module configuration, devtools settings |
| `.oxlintrc.json` | Linting rules |

## Common Pitfalls to Avoid

1. **Don't create components in root `/components/`** - use `/app/components/`
2. **Don't use `#imports`** - use explicit imports from `'vue'`
3. **Don't use `@apply` with custom colors** - use raw CSS or class names
4. **Don't add server code inside `/app/`** - keep it in `/server/`
5. **Don't assume Nuxt 3 structure** - always check this file first
6. **Don't ask to run dev server to test files because the user is runnig it already and tests it manually

## Current App Features

The Skill Trainer app includes:
- Technology management (add, list, delete)
- 8-level confidence self-assessment slider
- Progress overview with distribution charts
- OpenAI-powered quiz generation
- Chrome Web Speech API for TTS
- Dark mode (default)
- Mobile-first responsive design
- localStorage persistence

## Questions?

If unsure about project structure or conventions, check:
1. This file (`AGENTS.md`)
2. `nuxt.config.ts` for module configuration
3. Existing files in `app/` for patterns
