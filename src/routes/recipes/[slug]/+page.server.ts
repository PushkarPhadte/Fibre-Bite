import { error } from '@sveltejs/kit';
import { repository } from '$lib/server/recipes/repository';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const recipe = await repository.getRecipeById(params.slug);

	if (!recipe) {
		throw error(404, 'Recipe not found');
	}

	return { recipe };
};
