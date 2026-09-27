import { repository } from '$lib/server/recipes/repository';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const query = url.searchParams.get('query') ?? undefined;
	const dietary = url.searchParams.get('diet') ?? undefined;
	const allergen = url.searchParams.get('allergen') ?? undefined;
	const sort = (url.searchParams.get('sort') as 'title' | 'protein' | 'calories') ?? undefined;

	const recipes = await repository.searchRecipes({
		query,
		dietary: dietary as any,
		allergen: allergen as any,
		sort
	});

	return {
		recipes,
		query,
		dietary,
		allergen,
		sort
	};
};
