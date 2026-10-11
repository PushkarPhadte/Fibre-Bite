# AGENTS.md

This repository is the Fibre-Bite healthy-recipes website. It is a static SvelteKit application for recipe discovery, nutrition display, serving-size scaling, dietary filtering, allergen filtering, and lightweight browser-only personalization. Treat this as the source of truth for how agents should modify the codebase.

## 1. Project purpose

The app is designed to be:

- simple
- typed
- static and inexpensive to host
- recipe-first
- built without a database or custom backend
- optimized for markdown-driven content and local validation

The product is not a full-stack app with user accounts, server-side persistence, or custom auth. Saved recipes, favorites, and similar personalization are browser-local only when implemented.

## 2. Non-negotiable rules

- Always use pnpm, never npm or yarn.
- Use Svelte 5 runes and TS conventions rather than legacy Svelte patterns.
- Keep the app as a static SvelteKit site unless a feature explicitly requires otherwise.
- Do not introduce a database, custom auth system, or backend service.
- Do not add API keys, private environment variables, or secrets to client code.
- Keep server-only or sensitive logic in src/lib/server or SvelteKit server modules, not in component code.
- Never use process.env for app secrets or runtime config.
- Prefer small functions and explicit interfaces over over-engineered abstraction layers.
- Use the existing architecture before creating new patterns.
- Validate any new content or behavior before finishing.

## 3. Tech stack

- SvelteKit
- Svelte 5
- TypeScript
- Tailwind CSS
- Zod for validation
- Markdown-based recipe content
- Static site generation via SvelteKit adapter-static
- Local browser state such as localStorage when needed

## 4. Repository layout

Key areas of the project:

- src/content/recipes/: first-party recipe markdown files
- src/lib/recipes/: domain model and recipe logic
- src/lib/components/: reusable UI components
- src/lib/data/: recipe data and generated collections
- src/lib/server/: server-only code if needed
- src/routes/: page routes and loaders
- tests/: repo validation tests
- build/: generated static output

Important files:

- README.md: project overview and recipe authoring rules
- src/lib/recipes/types.ts: canonical dietary/allergen/nutrition schemas and types
- src/lib/data/recipes.ts: app-level recipe collection logic
- src/routes/recipes/+page.server.ts: example server load pattern
- src/content/recipes/*.md: source content

## 5. Recipe content model

Recipes are authored as Markdown files in src/content/recipes. The content uses YAML frontmatter and is validated with Zod; invalid frontmatter should fail the build.

Required recipe frontmatter fields include:

- title
- slug
- baseServings
- ingredients
- instructions

Optional fields include:

- description
- dietaryTags
- allergens
- nutrition
- image

The canonical allowed values for tags are defined in src/lib/recipes/types.ts. Keep those values aligned with the schema and the app UI.

Recipe format has the following expectations:

- slug must be lowercase and hyphenated
- title must be non-empty
- baseServings must be positive
- ingredients must be a non-empty array with valid fields
- instructions must be a non-empty array with sequential numbers
- ingredient names and units must be non-empty strings
- nutrition values must be non-negative when provided
- image, when present, should be a public URL

Do not invent new metadata fields unless the codebase already expects them.

## 6. Local recipe authoring rules

When adding or editing recipe content:

- Keep slugs unique.
- Use a lowercase, hyphenated slug.
- Put the recipe in src/content/recipes/.
- Keep ingredients and instructions accurate and consistent with the base serving count.
- Use the same dietary and allergen taxonomy as the app schema.
- Do not add medical claims or claim safety guarantees beyond ingredient listing.
- Keep image URLs valid and publicly accessible.

## 7. Svelte 5 rules

All UI code should follow Svelte 5 patterns:

- Use runes such as $state, $derived, and $props.
- Prefer simple derived values over imperative effects.
- Do not use writable/readable store patterns unless a required library forces it.
- Do not use legacy export let component props.
- Keep business logic outside of .svelte files whenever reasonable.

Preferred pattern:

```svelte
<script lang="ts">
  let { recipe }: { recipe: Recipe } = $props();
  let servings = $state(4);
  let multiplier = $derived(servings / recipe.baseServings);
</script>
```

## 8. Serving-size scaling rules

This app treats baseServings as the canonical recipe definition. The serving count shown in the UI is local state, not a mutation of the recipe content.

Rules:

- Keep recipe amounts defined for baseServings.
- Scale ingredients and nutrition from a derived multiplier.
- Do not mutate original recipe objects during display calculations.
- Put calculation helpers in reusable logic files under src/lib/recipes when possible.

## 9. Routing and data fetching

Use SvelteKit's standard route patterns and loaders. Prefer explicit, simple route-level logic.

- Keep route loaders straightforward.
- Prefer direct local recipe data loading instead of building unnecessary API wrappers.
- Use server modules only when needed for page data or server-only processing.
- Avoid coupling UI components to implementation details.

Do not create unnecessary custom backend abstractions just to match a pattern.

## 10. Validation and build expectations

The project has a static build flow and recipes are validated during the build. The key commands are:

```bash
pnpm install
pnpm dev
pnpm check
pnpm build
```

Use them as the baseline validation path after meaningful changes.

The app should remain buildable as a static website and should not rely on runtime database connections.

## 11. Testing and regression checks

If tests are added or exist, run the project’s relevant test command before considering a change complete. The repo currently includes tests under tests/ for domain logic and app utilities.

When making a substantial change, verify with the smallest relevant command set:

1. pnpm check
2. pnpm build
3. project tests if they are relevant

If build or type-check fails, fix the root cause before finishing.

## 12. Architecture preferences

Keep the project aligned with the following principles:

- static-first deployment
- markdown-first content
- domain logic in shared TypeScript modules
- UI code focused on rendering and interaction state
- deterministic, explicit validation using Zod
- minimal dependencies and simple code

Avoid:

- custom auth flows
- password storage or session code
- database setup
- heavy client-side state libraries
- abstraction layers that add no value
- API wrappers around local-only functionality

## 13. Browser-only behavior

This app may use browser localStorage for lightweight preferences or saved data, but it should remain local to the current device. Do not assume a networked backend or persistent user profile exists.

## 14. Working conventions for agents

When making changes:

- inspect the relevant existing module before editing
- keep patches narrow and targeted
- preserve the current code style and naming conventions
- favor the simplest fix that matches the repo’s architecture
- avoid unrelated refactors or churn
- update content and validation logic together when altering recipe contracts

Before finalizing a change:

- read the exact file(s) you are modifying
- validate the change with pnpm check and, when relevant, pnpm build
- confirm the fix matches the existing product intent

## 15. File-specific guidance

### Recipe metadata schema

Files under src/lib/recipes/types.ts define the allowed recipe taxonomy. If you change dietary tags, allergens, or nutritional fields, keep the dataset, validation, and UI in sync.

### Content files

Markdown files under src/content/recipes are part of the app’s source of truth. Keep them valid, structured, and consistent with the schema.

### App routes

Routes in src/routes should remain simple and route-oriented. They should load data, pass it to components, and keep UI concerns separate from domain logic.

## 16. Summary

This project should remain a maintainer-friendly static recipe website with robust validation, clean Svelte 5 patterns, and minimal complexity. When in doubt, prefer the existing simple architecture over creating a heavier system.
