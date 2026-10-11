import { error } from '@sveltejs/kit';
import { localRecipes } from '../../../lib/data/recipes';
import type { PageServerLoad } from './$types';

export const prerender = true;

export const entries = async () => {
	return localRecipes.map(({ slug }) => ({ slug }));
};

export const load: PageServerLoad = ({ params }) => {
	const recipe = localRecipes.find(({ slug }) => slug === params.slug);

	if (!recipe) {
		throw error(404, 'Recipe not found');
	}

	return { recipe };
};
