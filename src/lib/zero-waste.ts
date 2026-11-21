import type { Recipe } from './recipes/types';
import { normalizeIngredientName, resolveIngredientName } from './recipes/ingredients.ts';

export interface LowWasteSuggestion {
	recipe: Recipe;
	matchedIngredients: string[];
	totalIngredients: number;
}

function normalize(value: string): string {
	return normalizeIngredientName(value);
}

function ingredientMatches(pantryItem: string, recipeIngredient: { name: string; canonicalId?: string }): boolean {
	const pantry = normalize(pantryItem);
	const ingredient = normalize(recipeIngredient.name);
	if (!pantry || !ingredient) return false;
	if (!recipeIngredient.canonicalId && /\b(?:and|or|blend|mixture|masala)\b|\//i.test(ingredient)) return false;
	const pantryResolution = resolveIngredientName(pantryItem);
	const ingredientResolution = recipeIngredient.canonicalId
		? { status: 'known' as const, canonicalId: recipeIngredient.canonicalId }
		: resolveIngredientName(recipeIngredient.name);
	if (pantryResolution.status === 'ambiguous' || ingredientResolution.status === 'ambiguous') return false;
	if (pantryResolution.status === 'known' && ingredientResolution.status === 'known') {
		return pantryResolution.canonicalId === ingredientResolution.canonicalId;
	}
	return pantry === ingredient || pantry.includes(ingredient) || ingredient.includes(pantry);
}

export function findLowWasteRecipes(recipes: Recipe[], pantryItems: string[]): LowWasteSuggestion[] {
	const pantry = Array.from(new Set(pantryItems.map(normalize).filter(Boolean)));
	if (pantry.length === 0) return [];

	return recipes
		.map((recipe) => {
			const matchedIngredients = recipe.ingredients
				.filter((ingredient) => pantry.some((item) => ingredientMatches(item, ingredient)))
				.map((ingredient) => ingredient.name);
			return { recipe, matchedIngredients, totalIngredients: recipe.ingredients.length };
		})
		.filter((suggestion) => suggestion.matchedIngredients.length > 0)
		.sort((left, right) => right.matchedIngredients.length - left.matchedIngredients.length
			|| (right.matchedIngredients.length / right.totalIngredients) - (left.matchedIngredients.length / left.totalIngredients)
			|| left.recipe.title.localeCompare(right.recipe.title));
}
