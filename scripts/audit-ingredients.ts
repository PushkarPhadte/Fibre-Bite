import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { normalizeIngredientName, resolveIngredientName } from '../src/lib/recipes/ingredients.ts';

const projectDirectory = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const recipesDirectory = path.join(projectDirectory, 'src/content/recipes');
const candidates = new Map<string, { name: string; recipeCount: number }>();
let recipeCount = 0;

for (const filename of (await readdir(recipesDirectory)).filter((entry) => entry.endsWith('.md'))) {
	const data = matter(await readFile(path.join(recipesDirectory, filename), 'utf8')).data;
	recipeCount += 1;
	for (const ingredient of data.ingredients ?? []) {
		if (typeof ingredient.name !== 'string') continue;
		const resolution = resolveIngredientName(ingredient.name);
		if (resolution.status !== 'unknown' || ingredient.canonicalId) continue;
		const key = normalizeIngredientName(ingredient.name);
		const candidate = candidates.get(key) ?? { name: ingredient.name, recipeCount: 0 };
		candidate.recipeCount += 1;
		candidates.set(key, candidate);
	}
}

console.log(`Audited ${recipeCount} recipes. ${candidates.size} ingredient names have no curated multilingual alias.`);
console.log('Add frequently used entries to src/lib/recipes/ingredients.ts, or set canonicalId in recipe frontmatter.');
console.log(JSON.stringify([...candidates.values()].sort((left, right) => right.recipeCount - left.recipeCount || left.name.localeCompare(right.name)), null, 2));