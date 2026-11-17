import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { localRecipeFrontmatterSchema } from '../src/lib/recipes/types.ts';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.dirname(scriptDirectory);
const recipesDirectory = path.join(projectDirectory, 'src/content/recipes');
const defaultOutputPath = path.join(projectDirectory, 'resources/recipe-metadata.json');

type Recipe = ReturnType<typeof localRecipeFrontmatterSchema.parse>;
type RecipeSummary = { slug: string; title: string; image: string | null };

function printUsage(): void {
	console.error('Usage: pnpm recipes:metadata [-- <output.json>]');
}

function increment(counts: Record<string, number>, value: string): void {
	counts[value] = (counts[value] ?? 0) + 1;
}

function sortedCounts(counts: Record<string, number>): Record<string, number> {
	return Object.fromEntries(Object.entries(counts).sort(([left], [right]) => left.localeCompare(right)));
}

async function main(): Promise<void> {
	const args = process.argv.slice(2);
	if (args[0] === '--') args.shift();
	if (args.length > 1 || args.some((argument) => argument.startsWith('--'))) {
		printUsage();
		process.exitCode = 1;
		return;
	}

	const outputPath = path.resolve(args[0] ?? defaultOutputPath);
	const filenames = (await readdir(recipesDirectory))
		.filter((filename) => filename.endsWith('.md'))
		.sort((left, right) => left.localeCompare(right));
	const recipes: Recipe[] = [];
	const slugs = new Set<string>();

	for (const filename of filenames) {
		const markdown = await readFile(path.join(recipesDirectory, filename), 'utf8');
		const parsed = localRecipeFrontmatterSchema.strict().safeParse(matter(markdown).data);
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
	const imageGroups = new Map<string, RecipeSummary[]>();
	const recipeSummaries = recipes.map((recipe) => {
		for (const tag of recipe.dietaryTags) increment(dietaryTags, tag);
		for (const allergen of recipe.allergens) increment(allergens, allergen);

		const summary = { slug: recipe.slug, title: recipe.title, image: recipe.image ?? null };
		if (recipe.image) {
			const group = imageGroups.get(recipe.image) ?? [];
			group.push(summary);
			imageGroups.set(recipe.image, group);
		}
		return summary;
	});

	const metadata = {
		recipeCount: recipes.length,
		recipes: recipeSummaries,
		attributeCounts: {
			description: recipes.filter((recipe) => recipe.description !== undefined).length,
			image: recipes.filter((recipe) => recipe.image !== undefined).length,
			imageAttribution: recipes.filter((recipe) => recipe.imageAttribution !== undefined).length,
			prepTime: recipes.filter((recipe) => recipe.prepTimeMinutes !== undefined).length,
			nutrition: recipes.filter((recipe) => recipe.nutrition !== undefined).length,
			dietaryTags: sortedCounts(dietaryTags),
			allergens: sortedCounts(allergens)
		},
		recipesWithoutImages: recipeSummaries
			.filter((recipe) => recipe.image === null)
			.map(({ slug, title }) => ({ slug, title })),
		duplicateImages: [...imageGroups.entries()]
			.filter(([, matchingRecipes]) => matchingRecipes.length > 1)
			.sort(([left], [right]) => left.localeCompare(right))
			.map(([image, matchingRecipes]) => ({ image, recipes: matchingRecipes }))
	};

	await writeFile(outputPath, `${JSON.stringify(metadata, null, 2)}\n`, 'utf8');
	console.log(
		`Generated metadata for ${recipes.length} recipe(s) at ${path.relative(process.cwd(), outputPath) || outputPath}. ` +
		`${metadata.recipesWithoutImages.length} missing image(s), ${metadata.duplicateImages.length} repeated image URL(s).`
	);
}

main().catch((error: unknown) => {
	console.error(error instanceof Error ? error.message : String(error));
	process.exitCode = 1;
});