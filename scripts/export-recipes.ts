import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { localRecipeFrontmatterSchema } from '../src/lib/recipes/types.ts';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.dirname(scriptDirectory);
const recipesDirectory = path.join(projectDirectory, 'src/content/recipes');

function printUsage(): void {
	console.error('Usage: pnpm recipes:export [-- <output.json>]');
}

async function main(): Promise<void> {
	const args = process.argv.slice(2);
	if (args[0] === '--') args.shift();
	if (args.length > 1 || args.some((argument) => argument.startsWith('--'))) {
		printUsage();
		process.exitCode = 1;
		return;
	}

	const outputPath = path.resolve(args[0] ?? path.join(projectDirectory, 'recipes.json'));
	const filenames = (await readdir(recipesDirectory))
		.filter((filename) => filename.endsWith('.md'))
		.sort((left, right) => left.localeCompare(right));
	const recipes = [];
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

	await writeFile(outputPath, `${JSON.stringify(recipes, null, 2)}\n`, 'utf8');
	console.log(`Exported ${recipes.length} recipe(s) to ${path.relative(process.cwd(), outputPath) || outputPath}.`);
}

main().catch((error: unknown) => {
	console.error(error instanceof Error ? error.message : String(error));
	process.exitCode = 1;
});
