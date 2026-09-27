import { repository } from '$lib/server/recipes/repository';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const recipes = await repository.getLocalRecipes();
	return { recipes };
};
