const RECIPE_SERVINGS_KEY = 'fibre-bite-recipe-servings';

export const recipeServings = $state({ byRecipe: {} as Record<string, number>, initialized: false });

export function initializeRecipeServings() {
	if (recipeServings.initialized || typeof localStorage === 'undefined') return;
	try {
		const saved: unknown = JSON.parse(localStorage.getItem(RECIPE_SERVINGS_KEY) ?? '{}');
		if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
			recipeServings.byRecipe = Object.fromEntries(Object.entries(saved).filter((entry): entry is [string, number] =>
			typeof entry[1] === 'number' && Number.isInteger(entry[1]) && entry[1] > 0
			));
		}
	} catch {
		recipeServings.byRecipe = {};
	} finally {
		recipeServings.initialized = true;
	}
}

function persistRecipeServings() {
	if (!recipeServings.initialized || typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(RECIPE_SERVINGS_KEY, JSON.stringify(recipeServings.byRecipe));
	} catch {
		// Storage may be unavailable in some browser contexts.
	}
}

export function getRecipeServings(recipeId: string): number | undefined {
	return recipeServings.byRecipe[recipeId];
}

export function setRecipeServings(recipeId: string, servings: number, baseServings: number) {
	if (!Number.isInteger(servings) || servings < 1) return;
	if (servings === baseServings) {
		const { [recipeId]: _removed, ...remaining } = recipeServings.byRecipe;
		recipeServings.byRecipe = remaining;
		persistRecipeServings();
		return;
	}
	recipeServings.byRecipe[recipeId] = servings;
	persistRecipeServings();
}
