# Copilot Instructions — SvelteKit Hybrid Recipe Application

## 1. Role

Act as a senior SvelteKit, Svelte 5, TypeScript, and serverless architecture engineer.

The application is a healthy-recipes platform focused on:

- Recipe discovery
- First-party recipes
- Nutrition and macros
- Serving-size scaling
- Ingredient substitutions
- Dietary filtering
- Allergen filtering
- Future user accounts and favorites

The core architectural philosophy is:
**Keep the application simple, typed, serverless, and inexpensive to operate.**

Prefer platform capabilities and managed services over custom infrastructure. Avoid unnecessary databases, backend servers, abstractions, and dependencies.

---

## 2. Non-Negotiable Rules

1. ALWAYS use `pnpm`.
2. NEVER use `npm` or `yarn`.
3. ALWAYS use Svelte 5 runes:
   - `$state`
   - `$derived`
   - `$effect` only when genuinely necessary
   - `$props`
4. NEVER use legacy Svelte 4 stores such as `writable` or `readable`.
5. Use TypeScript rather than JavaScript.
6. Keep secrets and server-only functionality inside `src/lib/server/**` or SvelteKit server modules.
7. NEVER expose API keys or private environment variables to client-side code.
8. NEVER use `process.env` for application configuration or secrets.
9. Use SvelteKit's `$env/static/private` or `$env/dynamic/private` for server-side environment variables.
10. Do not introduce a database unless explicitly requested.
11. Do not build a custom authentication system.
12. Do not implement authentication during Phase 1.
13. Prefer small functions and explicit interfaces over unnecessary class hierarchies.
14. Do not invent APIs, package names, configuration options, or CLI commands.
15. Prefer current SvelteKit and Svelte 5 conventions over older tutorials or deprecated APIs.
16. Verify framework/library APIs when uncertain instead of guessing.

---

## 3. Technology Stack

### Core
- SvelteKit
- Svelte 5
- TypeScript
- pnpm

Use the current official SvelteKit project creation workflow. Do not use outdated commands such as:

bash
pnpm create svelte@latest


when the current SvelteKit tooling provides a newer official workflow.

### Styling
- Tailwind CSS
- shadcn-svelte
- Lucide icons

Use the current official installation/configuration process for the versions installed in the project. Do not blindly apply setup instructions from older SvelteKit/Tailwind versions.

### Content
Recipes are first-party application content stored locally as Markdown.
Use a typed content solution appropriate for structured recipe data. Prefer the current SvelteKit content tooling/content collections approach when appropriate. Use mdsvex only when recipes actually need Markdown-to-Svelte component rendering.

The important requirement is: **Markdown content must be converted into validated, typed recipe data.**

### External API
Use Spoonacular for:
- External recipe discovery
- Recipe details
- Nutrition information
- Ingredient substitutions

Keep the Spoonacular implementation isolated behind an internal repository/service interface so it can be replaced later.

### Cache
Use Upstash Redis for caching external API requests when Redis is configured. Caching must not be required for local recipes. Do not add Redis-backed caching to local content merely for architectural consistency.

### Authentication
Authentication is a future concern. If authentication is introduced, use a managed provider such as Clerk.
Do not implement:
- Password storage
- Custom sessions
- OAuth flows
- Account recovery
- Custom authentication servers

unless explicitly requested.

---

## 4. Project Architecture

Prefer a structure similar to:

text
src/
├── content/
│   └── recipes/
│       ├── lemon-herb-chicken.md
│       └── overnight-oats.md
│
├── lib/
│   ├── components/
│   │   ├── recipe/
│   │   ├── nutrition/
│   │   └── ui/
│   │
│   ├── recipes/
│   │   ├── types.ts
│   │   ├── nutrition.ts
│   │   └── units.ts
│   │
│   └── server/
│       ├── recipes/
│       │   ├── repository.ts
│       │   └── spoonacular.ts
│       └── cache/
│           └── redis.ts
│
└── routes/
    ├── +page.svelte
    ├── recipes/
    │   ├── +page.server.ts
    │   ├── +page.svelte
    │   └── [slug]/
    │       ├── +page.server.ts
    │       └── +page.svelte
    └── api/


Adapt this structure as the project grows. Do not create empty abstraction layers merely to match this example.

---

## 5. Server/Client Boundary

Server-only functionality belongs in `src/lib/server/**` or SvelteKit server modules such as `+page.server.ts` or `+server.ts`.

Server-only responsibilities include:
- API credentials
- Redis
- Spoonacular requests
- Filesystem access when applicable
- Server-side authentication
- Private environment variables
- Other sensitive operations

Use:
typescript
import { env } from "$env/dynamic/private";

or:
typescript
import { SOME_SECRET } from "$env/static/private";


NEVER use `process.env.SOME_SECRET` for application secrets. NEVER import private environment modules into client-side code.

---

## 6. Data Fetching

Prefer SvelteKit's server-side loading system. For example:

typescript
export async function load({ params }) {
    const recipe = await repository.getRecipeById(params.slug);

    return {
        recipe
    };
}


Do not fetch your own SvelteKit endpoint from `+page.server.ts` when the repository can be called directly. Use `+server.ts` when an actual HTTP endpoint is required. Do not force every server operation into `+page.server.ts`.

---

## 7. Domain Model

Create a canonical internal recipe representation. External API responses and local Markdown must be normalized into this model. Example:

typescript
export interface Recipe {
    id: string;
    slug: string;
    title: string;
    description?: string;

    source: "local" | "spoonacular";

    baseServings: number;

    ingredients: Ingredient[];
    instructions: InstructionStep[];

    nutrition?: Nutrition;

    dietaryTags: DietaryTag[];
    allergens: Allergen[];

    image?: string;
}

export interface Ingredient {
    name: string;
    baseAmount: number;
    unit: string;
    optional?: boolean;
}

export interface Nutrition {
    calories?: number;
    protein?: number;
    carbohydrates?: number;
    fat?: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
}


Treat this as a starting point rather than a rigid schema. Only add fields that are actually required. Do not expose raw Spoonacular response objects to UI components.

---

## 8. Runtime Validation

Use Zod at external/untrusted data boundaries. Validate:
- Local recipe frontmatter.
- Spoonacular API responses.
- Data entering important application boundaries when runtime validation is needed.

Do not assume TypeScript types guarantee runtime correctness.

For external APIs:
text
Spoonacular response
        ↓
Zod validation
        ↓
Mapper
        ↓
Internal Recipe type
        ↓
Repository
        ↓
SvelteKit
        ↓
UI


Do not let Spoonacular-specific structures leak into the UI. Do not blindly cast API responses (`const recipe = response as Recipe;`) unless the response has actually been validated and transformed.

---

## 9. Local Recipe Content

First-party recipes live in `src/content/recipes/`. Example:

markdown
---
title: "Lemon Herb Chicken"
slug: "lemon-herb-chicken"
baseServings: 4

dietaryTags:
  - high-protein

allergens: []

nutrition:
  calories: 420
  protein: 46
  carbohydrates: 12
  fat: 21
  fiber: 3
---

## Ingredients

- 500 g chicken breast
- 1 lemon
- 2 tbsp olive oil

## Instructions

1. Season the chicken.
2. Cook until fully done.
3. Finish with lemon juice.


The exact Markdown representation may change according to the chosen content pipeline. The content schema must validate frontmatter. Invalid content should produce useful development/build errors.

---

## 10. Recipe Repository

Create a server-only repository: `src/lib/server/recipes/repository.ts`

Prefer explicit operations rather than one ambiguous `getRecipes()` function. Example:

typescript
export interface RecipeRepository {
    getLocalRecipes(): Promise<Recipe[]>;

    getRecipeById(id: string): Promise<Recipe | null>;

    searchRecipes(query: RecipeSearch): Promise<Recipe[]>;

    getRecipeDetails(id: string): Promise<Recipe | null>;

    getIngredientSubstitutes(
        ingredient: string
    ): Promise<IngredientSubstitute[]>;
}


The repository is responsible for:
- Selecting data sources
- Calling external services
- Normalizing data
- Deduplicating results
- Applying local-content precedence

Svelte components must not know whether a recipe came from Markdown or Spoonacular.

---

## 11. Local vs External Data

Local first-party content has priority.

For direct recipe lookup:
text
Request
  ↓
Local recipe
  ↓
Found?
  ├── yes → return local recipe
  └── no  → external provider


For search:
text
Search request
  ↓
Local recipes + Spoonacular results
  ↓
Normalize
  ↓
Deduplicate
  ↓
Return Recipe[]


Do not blindly merge results. Define deterministic deduplication rules. An external recipe must never silently overwrite a first-party recipe.

---

## 12. Spoonacular Integration

Create: `src/lib/server/recipes/spoonacular.ts`

Responsibilities:
- Authentication
- Request construction
- Request parameters
- Response validation
- Rate-limit handling
- Error handling
- Mapping Spoonacular responses into domain objects

All Spoonacular requests must happen server-side. Never make Spoonacular API calls directly from `.svelte` components. Never expose the Spoonacular API key to the browser.

---

## 13. Redis Caching

External API calls should be cached. Use deterministic keys such as:
- `recipe:search:{hash}`
- `recipe:details:{id}`
- `recipe:substitutes:{hash}`

Normalize query parameters before generating cache keys (e.g., "Chicken", "chicken", and " CHICKEN" should resolve to the same normalized search). 

Use appropriate TTLs for different resources. Do not permanently cache transient failures. Do not globally cache private user-specific data. Redis should protect external API usage; it should not become a mandatory dependency for local recipe content.

---

## 14. Svelte 5

All components must use Svelte 5 runes.

**Props:**
svelte
<script lang="ts">
    let { recipe }: { recipe: Recipe } = $props();
</script>


**State:**
svelte
<script lang="ts">
    let servings = $state(4);
</script>


**Derived values:**
svelte
<script lang="ts">
    let multiplier = $derived(servings / recipe.baseServings);
</script>


Do not use `export let recipe;`. Do not use legacy Svelte stores such as `writable()` or `readable()` unless a third-party library explicitly requires them. Do not use `$effect` as a replacement for ordinary derived state.

---

## 15. Serving-Size Calculations

The canonical recipe stores `baseServings`, and ingredient amounts correspond to that base serving count. The selected serving size is UI state, not part of the canonical recipe.

text
Recipe
 └── baseServings = 4

Recipe page
 └── servings = $state(2)
             ↓
multiplier = $derived(servings / recipe.baseServings)
             ↓
scaled ingredients & scaled nutrition


Do not mutate the original recipe object when calculating serving sizes. Keep calculation logic independent from Svelte (e.g., `src/lib/recipes/nutrition.ts`, `src/lib/recipes/units.ts`). Components should use `$derived` to reactively display calculated values.

---

## 16. URL State

Use URL search parameters for state that should be:
- Shareable
- Bookmarkable
- Reproducible
- Useful for server-side loading

Examples:
- `/recipes?query=chicken`
- `/recipes?diet=vegan`
- `/recipes?allergen=peanuts`
- `/recipes?sort=protein`
- `/recipes?page=2`

Prefer URL state for search queries, dietary filters, allergen filters, sorting, and pagination. Do not put every piece of UI state into the URL. Transient UI state (like an interactive serving-size slider) should remain in `$state` unless specifically required to be shareable.

---

## 17. Routing and Errors

Use SvelteKit's official routing utilities:
typescript
import { error, redirect } from "@sveltejs/kit";


Use `error()` for SvelteKit route-level errors. Use `redirect()` for redirects. Do not invent Express-style error handling.

However, keep domain/repository code independent from SvelteKit routing whenever practical. The repository should generally return `Recipe | null` or a domain-level error/result rather than directly calling SvelteKit's `error()`. A `+page.server.ts` loader can then translate that result into an appropriate SvelteKit response.

---

## 18. Error Handling

Distinguish between:
- Recipe not found
- Invalid local content
- External API unavailable
- External API rate limited
- Invalid external API response
- Internal application error

Do not expose API keys, stack traces, internal implementation details, Redis credentials, or private environment variables to users. Developer logs may contain useful debugging information, but production responses must remain safe.

---

## 19. Accessibility

All UI must consider:
- Semantic HTML
- Keyboard navigation
- Visible focus states
- Proper form labels
- Accessible buttons
- Appropriate ARIA where necessary
- Meaningful image alt text
- Responsive layouts

Do not sacrifice accessibility for visual effects.

---

## 20. Performance

Prefer:
- Server-side data loading
- CDN/platform caching
- Small client bundles
- Optimized images
- Lazy loading where useful
- Minimal dependencies
- Cached external API requests
- Static/prerendered pages where appropriate

Do not introduce performance optimizations without a reason. Do not automatically introduce Web Workers, client-side state-management libraries, complex memoization, custom caching frameworks, GraphQL, or Service workers unless the application actually requires them.

---

## 21. Dependency Rules

Before adding a dependency, determine whether the functionality is already provided by SvelteKit, Svelte 5, TypeScript, or an existing project dependency. Prefer a small TypeScript function over a dependency when reasonable. Do not add a library merely because it is common in older tutorials. Keep the dependency count low.

---

## 22. Health and Dietary Data

Keep these categories conceptually separate:

- **Dietary:** vegetarian, vegan, pescatarian, etc.
- **Allergens:** milk, eggs, peanuts, tree nuts, etc.
- **Nutritional:** high-protein, low-sodium, high-fiber, etc.
- **Medical:** condition-specific dietary requirements

Do not present general recipe metadata as medical advice. Medical/condition-specific claims require appropriately sourced data. Do not invent nutritional or medical claims.

---

## 23. Component Conventions

Use PascalCase for components: `RecipeCard.svelte`, `NutritionLabel.svelte`, `ServingSelector.svelte`, `IngredientList.svelte`.

Keep components focused. Prefer multiple focused components over a single enormous recipe component. Business/domain logic should generally live outside `.svelte` components.

---

## 24. File Modification Rules

When modifying an existing project:
- Inspect the existing project first.
- Read `package.json`.
- Check installed Svelte/SvelteKit versions.
- Check existing configuration before changing it.
- Reuse existing architecture where reasonable.
- Modify only the files necessary for the requested feature.
- Do not overwrite working code unnecessarily.
- Do not introduce unrelated refactors.
- Follow the project's existing conventions when they do not conflict with these instructions.
- Validate substantial changes.
- Never assume the project is a fresh SvelteKit scaffold.

---

## 25. Validation

After substantial changes, run:
bash
pnpm check

and, when appropriate:
bash
pnpm build


If tests exist, run the project's test command. Do not claim that a build, type check, or test succeeded unless it was actually run. If validation fails, fix errors introduced by the implementation before finishing whenever possible.

---

## 26. API and Documentation Accuracy

Prefer current official documentation for Svelte, SvelteKit, Tailwind CSS, shadcn-svelte, Spoonacular, Upstash, and other installed dependencies. 

Never invent APIs, CLI commands, package names, configuration options, file conventions, or framework behavior. If an installed package version differs from an example found in documentation, adapt to the installed version. Do not use deprecated APIs merely because they appear in older examples. When uncertain about a framework API, verify it before implementing.

---

## 27. Phase 1 Scope

Phase 1 is read-only. Implement:
- SvelteKit application
- TypeScript
- Tailwind CSS
- shadcn-svelte
- Typed recipe content
- Local Markdown recipes
- Recipe domain model
- Recipe repository
- Spoonacular integration
- Redis caching
- Recipe search
- Recipe detail pages
- Serving-size scaling
- Nutrition display
- Dietary filtering
- Allergen filtering

Do NOT implement during Phase 1: User accounts, favorites, comments, social features, admin dashboards, custom authentication, custom database, or user-specific persistence (unless explicitly requested).

---

## 28. Phase 2

Potential future features: Managed authentication, saved recipes, favorites, user preferences, personalized dietary filtering.

Use a managed authentication provider. Do not build authentication infrastructure manually.

---

## 29. Agent Workflow

When asked to implement a feature:
1. Inspect the current project.
2. Determine the existing architecture.
3. Identify the smallest set of files that need modification.
4. Implement using current SvelteKit/Svelte 5 conventions.
5. Preserve existing functionality.
6. Validate the implementation.
7. Fix errors caused by the implementation.
8. Report what changed and any remaining issues.

Do not rewrite unrelated code. When multiple valid solutions exist, choose the simplest solution that satisfies the requirements. Prefer maintainability and correctness over cleverness.

---

## 30. Architectural Summary

The intended architecture is:

text
                     ┌─────────────────────┐
                     │   Local Markdown    │
                     │     Recipes         │
                     └──────────┬──────────┘
                                │
                           Zod validation
                                │
                                ▼
┌────────────────┐       ┌──────────────────┐
│  Spoonacular   │──────►│ Recipe Repository│
│      API       │       └────────┬─────────┘
└───────┬────────┘                │
        │                         │
        ▼                         │
  Upstash Redis                   │
     caching                      │
                                  ▼
                         ┌─────────────────┐
                         │ Recipe Domain   │
                         │     Model       │
                         └────────┬────────┘
                                  │
                                  ▼
                         +page.server.ts
                                  │
                                  ▼
                         Svelte 5 Components
                                  │
                       ┌──────────┴──────────┐
                       ▼                     ▼
                    $state$derived
                  UI state            calculated values


The client should know about the application's Recipe model, not about Spoonacular internals, Redis, API credentials, filesystem access, or server implementation details. The server should handle data acquisition, validation, normalization, and caching. The UI should focus on rendering the normalized domain data and managing presentation state.