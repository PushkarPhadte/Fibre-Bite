import { allergenOptions, type Allergen } from '$lib/recipes/types';
import type { Recipe } from '$lib/recipes/types';
import type { IngredientSwap } from '$lib/smart-swaps';

const RECIPE_SWAPS_KEY = 'fibre-bite-recipe-swaps';

type SavedSwaps = Record<string, Record<string, IngredientSwap>>;

export const recipeSwaps = $state({ byRecipe: {} as SavedSwaps, initialized: false });

function isIngredientSwap(value: unknown): value is IngredientSwap {
	return Boolean(value && typeof value === 'object'
		&& typeof (value as IngredientSwap).name === 'string'
		&& typeof (value as IngredientSwap).reason === 'string'
		&& Array.isArray((value as IngredientSwap).allergens)
		&& (value as IngredientSwap).allergens.every((item) => typeof item === 'string' && allergenOptions.includes(item as Allergen)));
}

export function initializeRecipeSwaps() {
	if (recipeSwaps.initialized || typeof localStorage === 'undefined') return;

	try {
		const saved: unknown = JSON.parse(localStorage.getItem(RECIPE_SWAPS_KEY) ?? '{}');
		if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
			const validSwaps: SavedSwaps = {};
			for (const [recipeId, ingredients] of Object.entries(saved)) {
				if (!ingredients || typeof ingredients !== 'object' || Array.isArray(ingredients)) continue;
				const recipeIngredients = Object.fromEntries(Object.entries(ingredients).filter((entry): entry is [string, IngredientSwap] => isIngredientSwap(entry[1])));
				if (Object.keys(recipeIngredients).length > 0) validSwaps[recipeId] = recipeIngredients;
			}
			recipeSwaps.byRecipe = validSwaps;
		}
	} catch {
		recipeSwaps.byRecipe = {};
	} finally {
		recipeSwaps.initialized = true;
	}
}

function persistRecipeSwaps() {
	if (!recipeSwaps.initialized || typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(RECIPE_SWAPS_KEY, JSON.stringify(recipeSwaps.byRecipe));
	} catch {
		// Storage may be unavailable in some browser contexts.
	}
}

export function getRecipeSwap(recipeId: string, ingredientName: string) {
	return recipeSwaps.byRecipe[recipeId]?.[ingredientName.trim().toLowerCase()];
}

export function setRecipeSwap(recipeId: string, ingredientName: string, swap: IngredientSwap) {
	const key = ingredientName.trim().toLowerCase();
	recipeSwaps.byRecipe[recipeId] = { ...recipeSwaps.byRecipe[recipeId], [key]: swap };
	persistRecipeSwaps();
}

export function resetRecipeSwap(recipeId: string, ingredientName: string) {
	const key = ingredientName.trim().toLowerCase();
	const { [key]: _removed, ...remaining } = recipeSwaps.byRecipe[recipeId] ?? {};
	if (Object.keys(remaining).length > 0) {
		recipeSwaps.byRecipe[recipeId] = remaining;
	} else {
		const { [recipeId]: _recipeRemoved, ...remainingRecipes } = recipeSwaps.byRecipe;
		recipeSwaps.byRecipe = remainingRecipes;
	}
	persistRecipeSwaps();
}

export function getRecipeAllergens(recipe: Recipe): Allergen[] {
	const allergens = new Set(recipe.allergens);
	for (const ingredient of recipe.ingredients) {
		for (const allergen of getRecipeSwap(recipe.id, ingredient.name)?.allergens ?? []) {
			allergens.add(allergen);
		}
	}
	return Array.from(allergens);
}
