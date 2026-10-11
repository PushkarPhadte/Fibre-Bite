import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { z } from 'zod';
import { localRecipeFrontmatterSchema } from '../src/lib/recipes/types.ts';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.dirname(scriptDirectory);
const recipesDirectory = path.join(projectDirectory, 'src/content/recipes');
const recipeBatchSchema = z.array(localRecipeFrontmatterSchema.strict()).min(1);

function printUsage(): void {
	console.error('Usage: pnpm recipes:import -- <recipes.json> [--dry-run]');
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
	const inputPath = args.find((argument) => argument !== '--dry-run');

	if (!inputPath || args.some((argument) => argument.startsWith('--') && argument !== '--dry-run')) {
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
	const existingSlugs = new Set<string>();
	for (const filename of existingRecipeFiles) {
		const existingMarkdown = await readFile(path.join(recipesDirectory, filename), 'utf8');
		const existingFrontmatter = localRecipeFrontmatterSchema.safeParse(matter(existingMarkdown).data);
		if (existingFrontmatter.success) existingSlugs.add(existingFrontmatter.data.slug);
	}

	const inputSlugs = new Set<string>();
	const collisions: string[] = [];
	for (const recipe of parsed.data) {
		if (inputSlugs.has(recipe.slug)) collisions.push(`${recipe.slug} appears more than once in the JSON file`);
		if (existingSlugs.has(recipe.slug) || existingFilenames.has(`${recipe.slug}.md`)) {
			collisions.push(`${recipe.slug} already exists in ${recipesDirectory}`);
		}
		inputSlugs.add(recipe.slug);
	}

	if (collisions.length > 0) {
		console.error(`Recipe slug conflicts:\n${collisions.map((collision) => `  - ${collision}`).join('\n')}`);
		process.exitCode = 1;
		return;
	}

	if (dryRun) {
		console.log(`Validated ${parsed.data.length} recipe(s); no files written.`);
		return;
	}

	for (const recipe of parsed.data) {
		const filename = path.join(recipesDirectory, `${recipe.slug}.md`);
		await writeFile(filename, matter.stringify('', recipe), { flag: 'wx' });
		console.log(`Created ${path.relative(projectDirectory, filename)}`);
	}
}

main().catch((error: unknown) => {
	console.error(error instanceof Error ? error.message : String(error));
	process.exitCode = 1;
});