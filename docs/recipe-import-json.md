# Bulk Recipe JSON Format

The importer converts a JSON array of recipes into individual Markdown files in `src/content/recipes/`. Each recipe uses the same fields and validation rules as the Markdown frontmatter described in the project README and defined in `src/lib/recipes/types.ts`.

## Example

```json
[
  {
    "title": "Roasted Chickpeas",
    "slug": "roasted-chickpeas",
    "description": "Crispy chickpeas with smoked paprika and lemon.",
    "translations": {
      "hi": {
        "title": "कुरकुरे छोले",
        "description": "स्मोक्ड पेपरिका और नींबू के साथ कुरकुरे छोले।",
        "benefits": ["प्रोटीन और फाइबर का स्रोत"],
        "instructions": [
          { "number": 1, "text": "छोलों को सुखाकर तेल और मसाले में मिलाएँ।" },
          { "number": 2, "text": "कुरकुरे होने तक भूनें।" }
        ],
        "content": "सलाद के साथ परोसें।"
      },
      "mr": { "title": "कुरकुरी हरभरा पाककृती" }
    },
    "baseServings": 2,
    "ingredients": [
      { "name": "chickpeas, drained", "canonicalId": "chickpea", "baseAmount": 400, "unit": "g" },
      { "name": "olive oil", "baseAmount": 1, "unit": "tbsp" },
      { "name": "smoked paprika", "baseAmount": 1, "unit": "tsp", "optional": true },
      { "name": "salt", "baseAmount": 0, "unit": "to taste", "optional": true }
    ],
    "instructions": [
      { "number": 1, "text": "Pat the chickpeas dry and toss with the oil and paprika." },
      { "number": 2, "text": "Roast until crisp, shaking the tray once halfway through." }
    ],
    "dietaryTags": ["vegan"],
    "allergens": [],
    "prepTimeMinutes": 10,
    "prepTimeEstimated": true,
    "nutrition": {
      "calories": 260,
      "protein": 14,
      "carbohydrates": 38,
      "fat": 7,
      "fiber": 11,
      "sugar": 5,
      "sodium": 310,
      "micronutrients": {
        "vitaminCMg": 3.2,
        "vitaminDMcg": 0,
        "calciumMg": 65,
        "ironMg": 2.9,
        "potassiumMg": 480,
        "magnesiumMg": 78,
        "folateMcg": 170
      },
      "micronutrientEstimateSource": "Illustrative estimates calculated from ingredient quantities using USDA FoodData Central values."
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

This example shows the complete set of supported fields. Its nutrition numbers and image credit are illustrative; replace them with accurate recipe data and the actual image source and license before importing. If no supported allergen is present, use an empty array (`"allergens": []`) or omit the field. Never use `"none"`, an empty string, or a homemade allergen label: each entry must be one of the exact supported values below.

## Fields

- `title`: required, non-empty recipe name.
- `slug`: required, unique lowercase letters, numbers, and hyphens; used for the filename and recipe URL.
- `description`: optional text.
- `translations`: optional object keyed by `en`, `hi`, or `mr`. Each language may provide `title`, `description`, `instructions`, `benefits`, and additional `content`; missing fields fall back to English. Instructions use the same sequential numbering rules as the shared `instructions` field.
- `baseServings`: required positive number that the ingredient quantities describe.
- `ingredients`: required non-empty array. Each item has a non-empty `name`, optional `canonicalId` from the ingredient dictionary, non-negative numeric `baseAmount`, non-empty `unit`, and optional boolean `optional`. For ingredients measured by taste, use `baseAmount: 0` and `unit: "to taste"`.
- `instructions`: required non-empty array. Each item has a positive `number` starting at 1 with no gaps, and non-empty `text`.
- `dietaryTags`: optional array of `vegetarian`, `vegan`, `gluten-free`, `high-protein`, `low-carb`, `high-fiber`, or `keto`. These are recipe tags, not medical claims.
- `allergens`: optional array of `milk`, `eggs`, `peanuts`, `tree-nuts`, `soy`, `wheat`, `sesame`, `fish`, or `shellfish`. Include only allergens present in the listed ingredients. Use `[]` for none; the string `"none"` is invalid.
- `prepTimeMinutes`: optional positive integer for active preparation time in minutes; exclude cooking and waiting time.
- `prepTimeSource`: URL to a credible recipe source that reports the preparation time. Required for sourced times and must be used together with `prepTimeMinutes`.
- `prepTimeEstimated`: set to `true` when `prepTimeMinutes` is estimated from the recipe instructions and no source is available. Estimated times cannot also include `prepTimeSource`.
- `nutrition`: optional object. All values are non-negative numbers. Supported macronutrient fields are `calories`, `protein`, `carbohydrates`, `fat`, `fiber`, `sugar`, and `sodium`.
- `nutrition.micronutrients`: optional object with `vitaminCMg` (mg), `vitaminDMcg` (mcg), `calciumMg` (mg), `ironMg` (mg), `potassiumMg` (mg), `magnesiumMg` (mg), and `folateMcg` (mcg). Each field is optional; include only values you have a reasonable basis to report. Do not invent values or treat missing values as zero.
- `nutrition.micronutrientEstimateSource`: optional non-empty text describing the source and estimation method for micronutrients.
- `image`: optional public URL. (PREFER USING IMAGE)
- `imageAttribution`: optional credit object with required `title`, `creator`, `creatorUrl`, `sourceUrl`, `license`, and `licenseUrl` fields. Provide accurate credits and follow the image's license requirements; the credit is displayed with the image.

Field names and taxonomy values are case-sensitive. Unknown recipe-level fields are rejected; unsupported extra properties inside an ingredient or nutrition object are omitted during validation, so use only the documented fields. Dietary and allergen arrays may be omitted; they default to empty arrays. Nutrition fields are estimates and should only be included when available and appropriately sourced. For ingredients without a measurable quantity, use `baseAmount: 0` and `unit: "to taste"`; each amount must be the quantity for `baseServings`.

## Import

Save the array as a `.json` file, then run:

The import command requires Node.js 22.6 or later for native TypeScript stripping.

```sh
pnpm recipes:import -- ./metadata/recipes.json
```

Validate the full batch without creating files:

```sh
pnpm recipes:import -- ./metadata/recipes.json --dry-run
```

Apply only changed recipes from a full export; identical recipes are skipped, changed matching slugs are updated, and new slugs are created:

```sh
pnpm recipes:import -- ./metadata/recipes.json --changed-only --dry-run
pnpm recipes:import -- ./metadata/recipes.json --changed-only
```

The importer validates every recipe before writing and rejects duplicate slugs within the input. Without `--changed-only`, it rejects slugs already used by existing recipes and never overwrites an existing file. With `--changed-only`, it compares normalized recipe data, skips identical entries, updates only changed existing entries while preserving their Markdown body, and creates recipes with new slugs. After importing, run `pnpm check` and `pnpm build` as usual.

## Export

Export every Markdown recipe into one JSON array using the same schema as the importer:

```sh
pnpm recipes:export -- ./metadata/recipes.json
```

The exporter reads and validates all Markdown files in `src/content/recipes/`, orders them by filename, and writes one JSON file. The output can be passed directly to `pnpm recipes:import` in another clone. An output path may be relative to the current directory or absolute. If omitted, the exporter writes `recipes.json` in the project root.

Every export also refreshes the metadata inventory at `metadata/recipe-metadata.json`. The recipe export remains a plain JSON array and can still be imported directly. Optional detail reports can be requested during export:

```sh
pnpm recipes:export -- ./metadata/recipes.json --export-duplicates --explore-missing-images --export-missing-attributes
```

The flags write `metadata/duplicate-images.json`, `metadata/recipes-without-images.json`, and `metadata/recipes-with-missing-attributes.json`, respectively. The missing-image report is an object with `count` and `recipes`; the duplicate-image report has `count` (repeated URL groups), `duplicateEntryCount` (extra recipe entries sharing those URLs), and `duplicates`. They can also be used with `pnpm recipes:metadata`.

## Translated Markdown

The importer writes each language once in the recipe body using `:::lang` blocks. Keep images, nutrition, ingredients, quantities, units, canonical IDs, and other shared metadata in frontmatter, outside language blocks. Existing English-only files remain valid and require no migration.

```md
:::lang en
# Roasted Chickpeas

## Description
Crispy chickpeas with smoked paprika and lemon.

## Instructions
1. Pat the chickpeas dry and toss with the oil and paprika.
2. Roast until crisp.
:::

:::lang hi
# कुरकुरे छोले

## Description
स्मोक्ड पेपरिका और नींबू के साथ कुरकुरे छोले।

## Benefits
- प्रोटीन और फाइबर का स्रोत

## Instructions
1. छोलों को सुखाकर तेल और मसाले में मिलाएँ।
2. कुरकुरे होने तक भूनें।
:::
```

Untranslated language content falls back to English field by field. Use `pnpm ingredients:audit` to find ingredient names that would benefit from a curated canonical ID or multilingual alias.

## Metadata

Generate a compact inventory of the current recipe collection:

```sh
pnpm recipes:metadata
```

By default, the command writes `metadata/recipe-metadata.json`. Pass an output path to write the main inventory elsewhere:

```sh
pnpm recipes:metadata -- ./metadata/metadata.json
```

The command validates every recipe and records its slug, title, and image URL, along with counts for optional attributes, dietary tags, and allergens. It reports the number of recipes without images, the number of repeated image URL groups, and the number of extra entries using those repeated URLs. Each recipe with missing optional data includes a `missingAttributes` list; conditional fields such as image attribution and prep-time source are only considered missing when applicable. The main inventory includes the missing-image, duplicate-image, and missing-attribute detail lists. It contains no ingredient or instruction text, so it can be used as a lightweight inventory when preparing recipe imports.

Use the optional flags to write individual detail reports into the root `metadata/` directory:

```sh
pnpm recipes:metadata -- --export-duplicates
pnpm recipes:metadata -- --explore-missing-images
pnpm recipes:metadata -- --export-missing-attributes
```