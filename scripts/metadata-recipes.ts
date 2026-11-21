import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { localRecipeFrontmatterSchema } from '../src/lib/recipes/types.ts';
import { parseLanguageBlocks } from '../src/lib/recipes/localized-content.ts';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.dirname(scriptDirectory);
const recipesDirectory = path.join(projectDirectory, 'src/content/recipes');
const metadataDirectory = path.join(projectDirectory, 'metadata');
const defaultOutputPath = path.join(metadataDirectory, 'recipe-metadata.json');
const optionalRecipeAttributes = [
	'description',
	'translations',
	'nutrition',
	'image',
	'imageAttribution',
	'prepTimeMinutes',
	'prepTimeEstimated',
	'prepTimeSource'
] as const;

type Recipe = ReturnType<typeof localRecipeFrontmatterSchema.parse>;
type RecipeSummary = { slug: string; title: string; image: string | null };
type MetadataOptions = {
	outputPath?: string;
	exportDuplicates: boolean;
	exploreMissingImages: boolean;
	exportMissingAttributes: boolean;
};

function printUsage(): void {
	console.error(
		'Usage: pnpm recipes:metadata [-- <output.json>] [--export-duplicates] [--explore-missing-images] [--export-missing-attributes]'
	);
}

function increment(counts: Record<string, number>, value: string): void {
	counts[value] = (counts[value] ?? 0) + 1;
}

function sortedCounts(counts: Record<string, number>): Record<string, number> {
	return Object.fromEntries(Object.entries(counts).sort(([left], [right]) => left.localeCompare(right)));
}

function parseOptions(args: string[]): MetadataOptions | null {
	if (args[0] === '--') args.shift();
	const options: MetadataOptions = {
		exportDuplicates: false,
		exploreMissingImages: false,
		exportMissingAttributes: false
	};
	const outputPaths: string[] = [];
	const flags: Record<string, keyof Pick<MetadataOptions, 'exportDuplicates' | 'exploreMissingImages' | 'exportMissingAttributes'>> = {
		'--export-duplicates': 'exportDuplicates',
		'--explore-missing-images': 'exploreMissingImages',
		'--export-missing-attributes': 'exportMissingAttributes'
	};

	for (const argument of args) {
		if (argument in flags) {
			options[flags[argument]] = true;
		} else if (argument.startsWith('--')) {
			return null;
		} else {
			outputPaths.push(argument);
		}
	}

	if (outputPaths.length > 1) return null;
	if (outputPaths.length === 1) options.outputPath = outputPaths[0];
	return options;
}

function getMissingAttributes(recipe: Recipe): string[] {
	const missingAttributes = optionalRecipeAttributes.filter((attribute) => {
		if (attribute === 'imageAttribution' && recipe.image === undefined) return false;
		if (
			attribute === 'prepTimeSource' &&
			(recipe.prepTimeMinutes === undefined || recipe.prepTimeEstimated === true)
		) {
			return false;
		}
		if (
			attribute === 'prepTimeEstimated' &&
			(recipe.prepTimeMinutes === undefined || recipe.prepTimeSource !== undefined)
		) {
			return false;
		}
		return recipe[attribute] === undefined;
	});
	if (recipe.nutrition) {
		const nutritionAttributes = ['calories', 'protein', 'carbohydrates', 'fat', 'fiber', 'sugar', 'sodium'];
		for (const attribute of nutritionAttributes) {
			if (recipe.nutrition[attribute as keyof typeof recipe.nutrition] === undefined) {
				missingAttributes.push(`nutrition.${attribute}`);
			}
		}
		if (!recipe.nutrition.micronutrients) {
			missingAttributes.push('nutrition.micronutrients');
		} else {
			const micronutrientAttributes = [
				'vitaminCMg',
				'vitaminDMcg',
				'calciumMg',
				'ironMg',
				'potassiumMg',
				'magnesiumMg',
				'folateMcg'
			];
			for (const attribute of micronutrientAttributes) {
				if (recipe.nutrition.micronutrients[attribute as keyof typeof recipe.nutrition.micronutrients] === undefined) {
					missingAttributes.push(`nutrition.micronutrients.${attribute}`);
				}
			}
		}
		if (recipe.nutrition.micronutrientEstimateSource === undefined) {
			missingAttributes.push('nutrition.micronutrientEstimateSource');
		}
	}
	if (recipe.ingredients.some((ingredient) => ingredient.canonicalId === undefined)) {
		missingAttributes.push('ingredients.canonicalId');
	}
	if (recipe.ingredients.some((ingredient) => ingredient.optional === undefined)) {
		missingAttributes.push('ingredients.optional');
	}
	return missingAttributes;
}

async function writeJson(outputPath: string, value: unknown): Promise<void> {
	await writeFile(outputPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function main(): Promise<void> {
	const options = parseOptions(process.argv.slice(2));
	if (!options) {
		printUsage();
		process.exitCode = 1;
		return;
	}

	const outputPath = path.resolve(options.outputPath ?? defaultOutputPath);
	const filenames = (await readdir(recipesDirectory))
		.filter((filename) => filename.endsWith('.md'))
		.sort((left, right) => left.localeCompare(right));
	const recipes: Recipe[] = [];
	const slugs = new Set<string>();

	for (const filename of filenames) {
		const markdown = await readFile(path.join(recipesDirectory, filename), 'utf8');
		const recipeMatter = matter(markdown);
		const blockTranslations = parseLanguageBlocks(recipeMatter.content) ?? {};
		const frontmatterTranslations = recipeMatter.data.translations ?? {};
		const translations = { ...blockTranslations, ...frontmatterTranslations };
		const parsed = localRecipeFrontmatterSchema.strict().safeParse({
			...recipeMatter.data,
			...(Object.keys(translations).length > 0 || recipeMatter.data.translations !== undefined ? { translations } : {})
		});
		if (!parsed.success) {
			const details = parsed.error.issues
				.map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
				.join('\n');
			throw new Error(`Invalid recipe frontmatter in ${filename}:\n${details}`);
		}
		if (slugs.has(parsed.data.slug)) {
			throw new Error(`Duplicate recipe slug: ${parsed.data.slug}`);
		}
		slugs.add(parsed.data.slug);
		recipes.push(parsed.data);
	}

	const dietaryTags: Record<string, number> = {};
	const allergens: Record<string, number> = {};
	const missingAttributeCounts: Record<string, number> = {};
	const imageGroups = new Map<string, RecipeSummary[]>();
	const recipeSummaries = recipes.map((recipe) => {
		for (const tag of recipe.dietaryTags) increment(dietaryTags, tag);
		for (const allergen of recipe.allergens) increment(allergens, allergen);
		for (const attribute of getMissingAttributes(recipe)) increment(missingAttributeCounts, attribute);

		const summary = { slug: recipe.slug, title: recipe.title, image: recipe.image ?? null };
		if (recipe.image) {
			const group = imageGroups.get(recipe.image) ?? [];
			group.push(summary);
			imageGroups.set(recipe.image, group);
		}
		return summary;
	});
	const duplicateImages = [...imageGroups.entries()]
		.filter(([, matchingRecipes]) => matchingRecipes.length > 1)
		.sort(([left], [right]) => left.localeCompare(right))
		.map(([image, matchingRecipes]) => ({ image, recipes: matchingRecipes }));
	const recipesWithoutImages = recipeSummaries
		.filter((recipe) => recipe.image === null)
		.map(({ slug, title }) => ({ slug, title }));
	const recipesWithMissingAttributes = recipes
		.map((recipe) => ({ slug: recipe.slug, title: recipe.title, missingAttributes: getMissingAttributes(recipe) }))
		.filter((recipe) => recipe.missingAttributes.length > 0);

	const metadata = {
		recipeCount: recipes.length,
		recipes: recipeSummaries,
		imageCounts: {
			missing: recipesWithoutImages.length,
			duplicateUrlGroups: duplicateImages.length,
			duplicateEntries: duplicateImages.reduce((count, group) => count + group.recipes.length - 1, 0)
		},
		attributeCounts: {
			description: recipes.filter((recipe) => recipe.description !== undefined).length,
			translations: recipes.filter((recipe) => recipe.translations !== undefined).length,
			image: recipes.filter((recipe) => recipe.image !== undefined).length,
			imageAttribution: recipes.filter((recipe) => recipe.imageAttribution !== undefined).length,
			prepTime: recipes.filter((recipe) => recipe.prepTimeMinutes !== undefined).length,
			prepTimeSource: recipes.filter((recipe) => recipe.prepTimeSource !== undefined).length,
			prepTimeEstimated: recipes.filter((recipe) => recipe.prepTimeEstimated === true).length,
			nutrition: recipes.filter((recipe) => recipe.nutrition !== undefined).length,
			canonicalIngredientIds: recipes.reduce(
				(total, recipe) => total + recipe.ingredients.filter((ingredient) => ingredient.canonicalId !== undefined).length,
				0
			),
			ingredientsWithOptionalFlag: recipes.reduce(
				(total, recipe) => total + recipe.ingredients.filter((ingredient) => ingredient.optional !== undefined).length,
				0
			),
			dietaryTags: sortedCounts(dietaryTags),
			allergens: sortedCounts(allergens)
		},
		missingAttributeCounts: sortedCounts(missingAttributeCounts),
		recipesWithMissingAttributes,
		recipesWithoutImages,
		duplicateImages
	};

	await mkdir(path.dirname(outputPath), { recursive: true });
	await writeJson(outputPath, metadata);
		if (options.exportDuplicates) {
			await writeJson(path.join(metadataDirectory, 'duplicate-images.json'), {
				count: duplicateImages.length,
				duplicateEntryCount: metadata.imageCounts.duplicateEntries,
				duplicates: duplicateImages
			});
		}
		if (options.exploreMissingImages) {
			await writeJson(path.join(metadataDirectory, 'recipes-without-images.json'), {
				count: recipesWithoutImages.length,
				recipes: recipesWithoutImages
			});
		}
	if (options.exportMissingAttributes) {
		await writeJson(path.join(metadataDirectory, 'recipes-with-missing-attributes.json'), recipesWithMissingAttributes);
	}
	console.log(
		`Generated metadata for ${recipes.length} recipe(s) at ${path.relative(process.cwd(), outputPath) || outputPath}. ` +
		`${metadata.imageCounts.missing} missing image(s), ${metadata.imageCounts.duplicateUrlGroups} duplicate image URL group(s) ` +
		`(${metadata.imageCounts.duplicateEntries} duplicate entr${metadata.imageCounts.duplicateEntries === 1 ? 'y' : 'ies'}), ` +
		`${recipesWithMissingAttributes.length} recipe(s) with missing optional attributes.`
	);
}

main().catch((error: unknown) => {
	console.error(error instanceof Error ? error.message : String(error));
	process.exitCode = 1;
});