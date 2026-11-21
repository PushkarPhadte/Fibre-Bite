import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import matter from 'gray-matter';
import { z } from 'zod';
import { localRecipeFrontmatterSchema } from '../src/lib/recipes/types.ts';
import { parseLanguageBlocks, renderLanguageBlocks, withoutLanguageBlocks } from '../src/lib/recipes/localized-content.ts';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.dirname(scriptDirectory);
const recipesDirectory = path.join(projectDirectory, 'src/content/recipes');
const recipeBatchSchema = z.array(localRecipeFrontmatterSchema.strict()).min(1);

function printUsage(): void {
	console.error('Usage: pnpm recipes:import -- <recipes.json> [--dry-run] [--changed-only]');
}

function formatValidationError(error: z.ZodError): string {
	return error.issues
		.map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
		.join('\n');
}

async function main(): Promise<void> {
	const args = process.argv.slice(2);
	if (args[0] === '--') args.shift();
	const dryRun = args.includes('--dry-run');
	const changedOnly = args.includes('--changed-only');
	const inputPath = args.find((argument) => !argument.startsWith('--'));

	if (
		!inputPath ||
		args.some((argument) => argument.startsWith('--') && !['--dry-run', '--changed-only'].includes(argument))
	) {
		printUsage();
		process.exitCode = 1;
		return;
	}

	let source: unknown;
	try {
		source = JSON.parse(await readFile(path.resolve(inputPath), 'utf8'));
	} catch (error) {
		console.error(`Could not read valid JSON from ${inputPath}: ${(error as Error).message}`);
		process.exitCode = 1;
		return;
	}

	const parsed = recipeBatchSchema.safeParse(source);
	if (!parsed.success) {
		console.error(`Recipe JSON is invalid:\n${formatValidationError(parsed.error)}`);
		process.exitCode = 1;
		return;
	}

	const existingFiles = await readdir(recipesDirectory);
	const existingRecipeFiles = existingFiles.filter((entry) => entry.endsWith('.md'));
	const existingFilenames = new Set(existingRecipeFiles);
	const existingRecipes = new Map<string, { filename: string; content: string; recipe: z.infer<typeof localRecipeFrontmatterSchema> }>();
	for (const filename of existingRecipeFiles) {
		const existingMarkdown = await readFile(path.join(recipesDirectory, filename), 'utf8');
		const existingMatter = matter(existingMarkdown);
		const existingFrontmatter = localRecipeFrontmatterSchema.safeParse({
			...existingMatter.data,
			translations: { ...parseLanguageBlocks(existingMatter.content), ...existingMatter.data.translations }
		});
		if (existingFrontmatter.success) {
			existingRecipes.set(existingFrontmatter.data.slug, {
				filename,
				content: matter(existingMarkdown).content,
				recipe: existingFrontmatter.data
			});
		}
	}

	const inputSlugs = new Set<string>();
	const collisions: string[] = [];
	const recipesToCreate: z.infer<typeof localRecipeFrontmatterSchema>[] = [];
	const recipesToUpdate: Array<{
		filename: string;
		content: string;
		recipe: z.infer<typeof localRecipeFrontmatterSchema>;
	}> = [];
	let unchangedCount = 0;
	for (const recipe of parsed.data) {
		if (inputSlugs.has(recipe.slug)) collisions.push(`${recipe.slug} appears more than once in the JSON file`);
		const existingRecipe = existingRecipes.get(recipe.slug);
		const filenameExists = existingFilenames.has(`${recipe.slug}.md`);
		if (changedOnly && existingRecipe) {
			if (isDeepStrictEqual(recipe, existingRecipe.recipe)) unchangedCount += 1;
			else recipesToUpdate.push({
				...existingRecipe,
				recipe: { ...recipe, translations: recipe.translations ?? existingRecipe.recipe.translations }
			});
		} else if (filenameExists || existingRecipe) {
			collisions.push(`${recipe.slug} already exists in ${recipesDirectory}`);
		} else {
			recipesToCreate.push(recipe);
		}
		inputSlugs.add(recipe.slug);
	}

	if (collisions.length > 0) {
		console.error(`Recipe slug conflicts:\n${collisions.map((collision) => `  - ${collision}`).join('\n')}`);
		process.exitCode = 1;
		return;
	}

	if (dryRun) {
		if (changedOnly) {
			console.log(
				`Validated ${parsed.data.length} recipe(s): ${recipesToCreate.length} to create, ${recipesToUpdate.length} to update, ${unchangedCount} unchanged; no files written.`
			);
		} else {
			console.log(`Validated ${parsed.data.length} recipe(s); no files written.`);
		}
		return;
	}

	for (const recipe of recipesToCreate) {
		const filename = path.join(recipesDirectory, `${recipe.slug}.md`);
		const { translations, ...sharedRecipe } = recipe;
		await writeFile(filename, matter.stringify(renderLanguageBlocks(translations), sharedRecipe), { flag: 'wx' });
		console.log(`Created ${path.relative(projectDirectory, filename)}`);
	}
	for (const { filename: existingFilename, content, recipe } of recipesToUpdate) {
		const filename = path.join(recipesDirectory, existingFilename);
		const { translations, ...sharedRecipe } = recipe;
		const retainedContent = withoutLanguageBlocks(content);
		const localizedContent = renderLanguageBlocks(translations);
		await writeFile(filename, matter.stringify([retainedContent, localizedContent].filter(Boolean).join('\n\n'), sharedRecipe), 'utf8');
		console.log(`Updated ${path.relative(projectDirectory, filename)}`);
	}
}

main().catch((error: unknown) => {
	console.error(error instanceof Error ? error.message : String(error));
	process.exitCode = 1;
});