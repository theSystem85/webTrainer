# Project-specific guidance for GitHub Copilot agents

## Architecture snapshot
- The app is a Nuxt 4 single-page experience: `app/app.vue` is the only layout and renders `<NuxtRouteAnnouncer />` plus the single `Trainer` component from `components/Trainer.vue`. That component currently uses `<script setup lang="ts">` and just exposes `version`, so expand functionality by following the `<script setup>` pattern. 
- `nuxt.config.ts` wires in `@nuxt/content`, `@nuxt/ui`, `@nuxt/image`, `@nuxt/scripts`, `@nuxt/test-utils`, `@nuxt/hints`, and enables devtools. Treat these modules as the “supported stack” when adding UI/content hooks: e.g., prefer Nuxt utilities (`<NuxtContent>`, Nuxt image helpers, or `@nuxt/ui` primitives) over importing large third-party UI kits.
- `better-sqlite3` is installed with the rest of dependencies (see `package.json`/`pnpm-workspace.yaml`), but the repo currently has no server directory. Unless instructed otherwise, avoid adding runtime databases and focus on client-side UI first.

## Developer workflows
- Install dependencies with `pnpm install` (the workspace specifies `onlyBuiltDependencies`, so pnpm will build `better-sqlite3`, `sharp`, etc.). `npm install`/`yarn install` work but prefer pnpm to stay consistent.
- The standard scripts are `pnpm dev` (runs `nuxt dev`), `pnpm build`, `pnpm generate`, `pnpm preview`, and `pnpm lint`. `npm run lint` runs `oxlint --type-aware`, so lint fixes often require type knowledge.
- A `postinstall` hook runs `nuxt prepare`, so any generator changes should still run `pnpm install` to refresh the `.nuxt` build metadata before testing.

## Conventions & code style
- `.oxlintrc.json` enforces 2-space indentation, no semicolons, and many `warn`-level rules from `unicorn`, `typescript`, and `oxc`. Keep new code TypeScript-clean (`no-floating-promises`, `no-unused-vars`, etc.) to avoid noisy warnings.
- Prefer `<script setup lang="ts">` (as in `Trainer.vue`). If you need reactive state, use Vue refs/computed from `vue` (no separate `setup()` function is currently used). Scoped styles go directly in the component.
- Since there is no pages directory, continue to put reusable UI in `components/` and reference them from `app/app.vue`. If you need additional layout behavior, extend `app/app.vue` rather than adding extra Nuxt layouts.

## Key files to refer to for patterns
- `app/app.vue`: bootstraps rendering and demonstrates the minimal root component tree.
- `components/Trainer.vue`: shows the current structure of a Nuxt component (`template`, `script setup`, `style scoped`).
- `nuxt.config.ts`: lists enabled modules and shows devtools+compat settings; mirror the existing module set when introducing new features.
- `.oxlintrc.json`: explains lint rules and plugin set used by `pnpm lint`.
- `package.json`: lists scripts and indicates the project is `type: module`.

## When making changes
- Keep all imports relative within `components/`/`app/`—Nuxt auto-resolves them, so there is no `pages/` or router setup yet.
- Avoid adding runtime server logic unless the user explicitly asks; the focus so far has been purely client-side UI scaffolding.
- After edits, run `pnpm lint` locally to confirm the stricter TypeScript-aware oxlint rules remain satisfied.

Let me know if any section needs clarification or if you want more detail on a particular workflow.