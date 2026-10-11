# Fibre-Bite

Fibre-Bite is a static healthy-recipes website built with SvelteKit, Svelte 5, TypeScript, Tailwind CSS, and Zod. Recipe content is stored in Markdown and validated during the build. There is no backend database, API service, or runtime server. Saved recipes are kept in browser `localStorage` on the current device only.

## Add A Recipe

Create a Markdown file in `src/content/recipes/`. Use a lowercase, hyphenated slug; it becomes the recipe URL. Ingredients and instructions belong in the YAML frontmatter so they can be validated and used for serving-size scaling.

```md
---
title: "Roasted Chickpeas"
slug: "roasted-chickpeas"
description: "Crispy chickpeas with smoked paprika and lemon."
baseServings: 2
ingredients:
	- name: chickpeas, drained
		baseAmount: 400
		unit: g
	- name: olive oil
		baseAmount: 1
		unit: tbsp
	- name: smoked paprika
		baseAmount: 1
		unit: tsp
		optional: true
instructions:
	- number: 1
		text: Pat the chickpeas dry and toss with the oil and paprika.
	- number: 2
		text: Roast until crisp, shaking the tray once halfway through.
dietaryTags:
	- vegan
allergens: []
nutrition:
	calories: 260
	protein: 14
	carbohydrates: 38
	fat: 7
	fiber: 11
image: "https://example.com/roasted-chickpeas.jpg"
---
```

Required fields are `title`, `slug`, `baseServings`, `ingredients`, and `instructions`. Each ingredient needs a `name`, non-negative `baseAmount`, and `unit`; use amount `0` with unit `to taste` for unmeasured ingredients. Each instruction needs a positive, sequential `number` and non-empty `text`. `description`, `dietaryTags`, `allergens`, `nutrition`, `image`, and an ingredient's `optional` flag are optional. Allowed tags are defined in `src/lib/recipes/types.ts`.

Keep each slug unique. Invalid fields and duplicate slugs fail the build with a file or slug error. Allergen tags describe the listed ingredients only; they are not a guarantee against cross-contamination or medical advice. Use an image URL that can be served publicly, and provide an accurate recipe title for its alt text.

To add several recipes from structured data, use the [bulk recipe JSON format](docs/recipe-import-json.md) and run `pnpm recipes:import -- path/to/recipes.json`. Add `--dry-run` to validate the entire batch without writing files.

## Develop And Deploy

Install dependencies with `pnpm install`. Run `pnpm dev` for local development, `pnpm check` for Svelte and TypeScript diagnostics, and `pnpm build` to validate content and generate the static website in `build/`. Deploy the contents of `build/` to any static hosting provider. Adding or editing a recipe requires a new build and deployment; there is no database to update.