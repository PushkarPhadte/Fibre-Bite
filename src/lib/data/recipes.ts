import matter from 'gray-matter';
import { localRecipeFrontmatterSchema, type Recipe } from '$lib/recipes/types';

const recipeFiles = import.meta.glob<string>('../../content/recipes/*.md', {
	eager: true,
	query: '?raw',
	import: 'default'
});

export const localRecipes: Recipe[] = Object.entries(recipeFiles).map(([path, markdown]) => {
	const parsed = localRecipeFrontmatterSchema.safeParse(matter(markdown).data);
	if (!parsed.success) {
		throw new Error(`Invalid recipe frontmatter in ${path}: ${parsed.error.message}`);
	}

	return {
		...parsed.data,
		id: `local-${parsed.data.slug}`
	};
});

const recipeSlugs = new Set<string>();
for (const recipe of localRecipes) {
	if (recipeSlugs.has(recipe.slug)) {
		throw new Error(`Duplicate recipe slug: ${recipe.slug}`);
	}
	recipeSlugs.add(recipe.slug);
}