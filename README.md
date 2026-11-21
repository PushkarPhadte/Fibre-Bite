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
prepTimeMinutes: 10
prepTimeEstimated: true
nutrition:
  calories: 260
  protein: 14
  carbohydrates: 38
  fat: 7
  fiber: 11
  sugar: 5
  sodium: 310
  micronutrients:
    vitaminCMg: 3.2
    vitaminDMcg: 0
    calciumMg: 65
    ironMg: 2.9
    potassiumMg: 480
    magnesiumMg: 78
    folateMcg: 170
  micronutrientEstimateSource: "Illustrative estimates calculated from ingredient quantities using USDA FoodData Central values."
image: "https://example.com/roasted-chickpeas.jpg"
imageAttribution:
  title: "Roasted chickpeas"
  creator: "Example Photographer"
  creatorUrl: "https://example.com/photographer"
  sourceUrl: "https://example.com/photo-page"
  license: "CC BY 4.0"
  licenseUrl: "https://creativecommons.org/licenses/by/4.0/"
---
```

Required fields are `title`, `slug`, `baseServings`, `ingredients`, and `instructions`. Each ingredient needs a `name`, non-negative `baseAmount`, and `unit`; use amount `0` with unit `to taste` for unmeasured ingredients. Each instruction needs a positive, sequential `number` and non-empty `text`. `description`, `dietaryTags`, `allergens`, `nutrition`, `image`, `imageAttribution`, prep-time metadata, and an ingredient's `optional` flag are optional. `prepTimeMinutes` means active preparation time, excluding cooking and waiting. When sourced, include `prepTimeSource` with a credible recipe URL that reports the time. When estimated from the recipe instructions, set `prepTimeEstimated: true` instead; estimated times must not include a source URL. Allowed dietary tags, allergens, nutrition fields, and micronutrients are documented in the [bulk recipe JSON format](docs/recipe-import-json.md) and defined in `src/lib/recipes/types.ts`.

For recipes with no allergens from the supported list, use `allergens: []` or omit the field. Do not write `allergens: [none]`; `none` is not a valid allergen tag. The example's nutrition numbers and image credits are illustrative and must be replaced with accurate data and real source/attribution details before publishing.

Keep each slug unique. Invalid fields and duplicate slugs fail the build with a file or slug error. Allergen tags describe the listed ingredients only; they are not a guarantee against cross-contamination or medical advice. Use an image URL that can be served publicly, and provide an accurate recipe title for its alt text.

To add several recipes from structured data, use the [bulk recipe JSON format](docs/recipe-import-json.md) and run `pnpm recipes:import -- path/to/recipes.json`. Add `--dry-run` to validate the entire batch without writing files.

Run `pnpm recipes:metadata` to generate the recipe inventory at `metadata/recipe-metadata.json`. `pnpm recipes:export` also refreshes this inventory while writing the import-ready recipe array. The inventory includes missing-image and duplicate-image counts, attribute coverage, and each recipe's missing optional attributes. Add `--export-duplicates`, `--explore-missing-images`, or `--export-missing-attributes` to write the corresponding detail reports in `metadata/`.

## Develop And Deploy

Install dependencies with `pnpm install`. Run `pnpm dev` for local development, `pnpm check` for Svelte and TypeScript diagnostics, and `pnpm build` to validate content and generate the static website in `build/`. Deploy the contents of `build/` to any static hosting provider. Adding or editing a recipe requires a new build and deployment; there is no database to update.