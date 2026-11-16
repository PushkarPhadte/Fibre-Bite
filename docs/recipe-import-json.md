# Bulk Recipe JSON Format

The importer converts a JSON array of recipes into individual Markdown files in `src/content/recipes/`. Each recipe uses the same fields and validation rules as the Markdown frontmatter described in the project README and defined in `src/lib/recipes/types.ts`.

## Example

```json
[
  {
    "title": "Roasted Chickpeas",
    "slug": "roasted-chickpeas",
    "description": "Crispy chickpeas with smoked paprika and lemon.",
    "baseServings": 2,
    "ingredients": [
      { "name": "chickpeas, drained", "baseAmount": 400, "unit": "g" },
      { "name": "olive oil", "baseAmount": 1, "unit": "tbsp" },
      { "name": "smoked paprika", "baseAmount": 1, "unit": "tsp", "optional": true }
    ],
    "instructions": [
      { "number": 1, "text": "Pat the chickpeas dry and toss with the oil and paprika." },
      { "number": 2, "text": "Roast until crisp, shaking the tray once halfway through." }
    ],
    "dietaryTags": ["vegan"],
    "allergens": [],
    "prepTimeMinutes": 10,
    "prepTimeSource": "https://example.com/recipe",
    "nutrition": {
      "calories": 260,
      "protein": 14,
      "carbohydrates": 38,
      "fat": 7,
      "fiber": 11,
      "micronutrients": {
        "ironMg": 2.9,
        "potassiumMg": 480
      },
      "micronutrientEstimateSource": "Approximate estimate from ingredient quantities."
    },
    "image": "https://example.com/roasted-chickpeas.jpg",
    "imageAttribution": {
      "title": "Roasted chickpeas",
      "creator": "Example Photographer",
      "creatorUrl": "https://example.com/photographer",
      "sourceUrl": "https://example.com/photo-page",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    }
  }
]
```

## Fields

- `title`: required, non-empty recipe name.
- `slug`: required, unique lowercase letters, numbers, and hyphens; used for the filename and recipe URL.
- `description`: optional text.
- `baseServings`: required positive number that the ingredient quantities describe.
- `ingredients`: required non-empty array. Each item has a non-empty `name`, non-negative numeric `baseAmount`, non-empty `unit`, and optional boolean `optional`. For ingredients measured by taste, use `baseAmount: 0` and `unit: "to taste"`.
- `instructions`: required non-empty array. Each item has a positive `number` starting at 1 with no gaps, and non-empty `text`.
- `dietaryTags`: optional array of `vegetarian`, `vegan`, `gluten-free`, `high-protein`, `low-carb`, `high-fiber`, or `keto`.
- `allergens`: optional array of `milk`, `eggs`, `peanuts`, `tree-nuts`, `soy`, `wheat`, `sesame`, `fish`, or `shellfish`.
- `prepTimeMinutes`: optional positive integer for active preparation time in minutes; exclude cooking and waiting time.
- `prepTimeSource`: required when `prepTimeMinutes` is supplied, and must be a URL to a credible recipe source that reports the preparation time. The two fields must be provided together. Use a placeholder URL in examples only; imported recipe data should cite its actual source.
- `nutrition`: optional object with non-negative numeric values for `calories`, `protein`, `carbohydrates`, `fat`, `fiber`, `sugar`, and `sodium`. It can also include a `micronutrients` object with `vitaminCMg`, `vitaminDMcg`, `calciumMg`, `ironMg`, `potassiumMg`, `magnesiumMg`, and `folateMcg`; `micronutrientEstimateSource` is an optional non-empty string.
- `image`: optional public URL.
- `imageAttribution`: optional credit object for the image with its `title`, `creator`, `creatorUrl`, `sourceUrl`, license name, and `licenseUrl`. Provide this whenever the image license requires attribution; the credit is displayed with the image.

Field names are case-sensitive. Unknown recipe-level fields are rejected; unsupported extra properties inside an ingredient or nutrition object are omitted during validation, so use only the documented fields. Dietary and allergen arrays may be omitted; they default to empty arrays. Nutrition fields are estimates and should only be included when available and appropriately sourced.

## Import

Save the array as a `.json` file, then run:

The import command requires Node.js 22.6 or later for native TypeScript stripping.

```sh
pnpm recipes:import -- ./path/to/recipes.json
```

Validate the full batch without creating files:

```sh
pnpm recipes:import -- ./path/to/recipes.json --dry-run
```

The importer validates every recipe before writing, rejects duplicate slugs within the input and slugs already used by existing recipes, and will not overwrite an existing file. After importing, run `pnpm check` and `pnpm build` as usual.

## Export

Export every Markdown recipe into one JSON array using the same schema as the importer:

```sh
pnpm recipes:export -- ./recipes.json
```

The exporter reads and validates all Markdown files in `src/content/recipes/`, orders them by filename, and writes one JSON file. The output can be passed directly to `pnpm recipes:import` in another clone. An output path may be relative to the current directory or absolute. If omitted, the exporter writes `recipes.json` in the project root.