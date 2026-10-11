import type { Recipe } from './recipes/types';

export interface LowWasteSuggestion {
	recipe: Recipe;
	matchedIngredients: string[];
	totalIngredients: number;
}

function normalize(value: string): string {
	return value.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();
}

function ingredientMatches(pantryItem: string, recipeIngredient: string): boolean {
	const pantry = normalize(pantryItem);
	const ingredient = normalize(recipeIngredient);
	if (!pantry || !ingredient) return false;
	return pantry === ingredient || pantry.includes(ingredient) || ingredient.includes(pantry);
}

export function findLowWasteRecipes(recipes: Recipe[], pantryItems: string[]): LowWasteSuggestion[] {
	const pantry = Array.from(new Set(pantryItems.map(normalize).filter(Boolean)));
	if (pantry.length === 0) return [];

	return recipes
		.map((recipe) => {
			const matchedIngredients = recipe.ingredients
				.filter((ingredient) => pantry.some((item) => ingredientMatches(item, ingredient.name)))
				.map((ingredient) => ingredient.name);
			return { recipe, matchedIngredients, totalIngredients: recipe.ingredients.length };
		})
		.filter((suggestion) => suggestion.matchedIngredients.length > 0)
		.sort((left, right) => right.matchedIngredients.length - left.matchedIngredients.length
			|| (right.matchedIngredients.length / right.totalIngredients) - (left.matchedIngredients.length / left.totalIngredients)
			|| left.recipe.title.localeCompare(right.recipe.title));
}
