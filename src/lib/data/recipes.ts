import matter from 'gray-matter';
import { localRecipeFrontmatterSchema, type Recipe } from '$lib/recipes/types';
import { parseLanguageBlocks } from '$lib/recipes/localized-content';

const recipeFiles = import.meta.glob<string>('../../content/recipes/*.md', {
	eager: true,
	query: '?raw',
	import: 'default'
});

export const localRecipes: Recipe[] = Object.entries(recipeFiles).map(([path, markdown]) => {
	const recipeMatter = matter(markdown);
	const parsed = localRecipeFrontmatterSchema.safeParse(recipeMatter.data);
	if (!parsed.success) {
		throw new Error(`Invalid recipe frontmatter in ${path}: ${parsed.error.message}`);
	}

	return {
		...parsed.data,
		translations: { ...parseLanguageBlocks(recipeMatter.content), ...parsed.data.translations },
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