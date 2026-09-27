import type { Nutrition, Recipe } from './types';

export function scaleNutrition(nutrition: Nutrition | undefined, multiplier: number): Nutrition | undefined {
	if (!nutrition) {
		return undefined;
	}

	const scaled: Nutrition = {};

	for (const [key, value] of Object.entries(nutrition)) {
		if (typeof value === 'number') {
			scaled[key as keyof Nutrition] = Number((value * multiplier).toFixed(1));
		}
	}

	return Object.keys(scaled).length > 0 ? scaled : undefined;
}

export function calculateNutritionPerServing(recipe: Recipe, servings: number): Nutrition | undefined {
	if (!recipe.nutrition) {
		return undefined;
	}

	const multiplier = servings / recipe.baseServings;
	return scaleNutrition(recipe.nutrition, multiplier);
}

export function nutritionValues(recipe: Recipe): Array<{ label: string; value: string }> {
	if (!recipe.nutrition) {
		return [];
	}

	const valueMap: Array<{ label: string; value: string }> = [
		{ label: 'Calories', value: `${recipe.nutrition.calories ?? 0}` },
		{ label: 'Protein', value: `${recipe.nutrition.protein ?? 0} g` },
		{ label: 'Carbs', value: `${recipe.nutrition.carbohydrates ?? 0} g` },
		{ label: 'Fat', value: `${recipe.nutrition.fat ?? 0} g` },
		{ label: 'Fiber', value: `${recipe.nutrition.fiber ?? 0} g` }
	];

	return valueMap.filter((item) => item.value !== '0' && item.value !== '0 g');
}

export function getSortValue(recipe: Recipe, key: 'protein' | 'calories') {
	if (!recipe.nutrition) {
		return 0;
	}

	return key === 'protein' ? recipe.nutrition.protein ?? 0 : recipe.nutrition.calories ?? 0;
}
