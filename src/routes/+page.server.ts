import { localRecipes } from '../lib/data/recipes';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	return { recipes: localRecipes };
};
