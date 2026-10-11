import type { Allergen, Ingredient } from './recipes/types';

export interface IngredientSwap {
	name: string;
	reason: string;
	allergens: Allergen[];
	amountMultiplier?: number;
	unit?: string;
}

const swapCatalog: Record<string, IngredientSwap[]> = {
	'milk': [
		{ name: 'almond milk', reason: 'A dairy-free alternative with a lighter body.', allergens: ['tree-nuts'] },
		{ name: 'soy milk', reason: 'Adds protein and works well in many savory and sweet dishes.', allergens: ['soy'] }
	],
	'greek yogurt': [
		{ name: 'plain skyr', reason: 'A tangy protein-rich option with a similar creamy texture.', allergens: ['milk'] },
		{ name: 'coconut yogurt', reason: 'A dairy-free alternative that works well in breakfast bowls.', allergens: ['tree-nuts'] }
	],
	'olive oil': [
		{ name: 'avocado oil', reason: 'A neutral option with a high smoke point for roasting and sautéing.', allergens: [] },
		{ name: 'canola oil', reason: 'A mild, budget-friendly cooking oil for everyday use.', allergens: [] }
	],
	'chicken breast': [
		{ name: 'tofu', reason: 'A plant-based protein that absorbs herbs and marinades well.', allergens: ['soy'] },
		{ name: 'turkey breast', reason: 'A lean alternative with a similar high-protein profile.', allergens: [] }
	],
	'rolled oats': [
		{ name: 'quinoa flakes', reason: 'A gluten-free hot-cereal option; texture and cook time will differ.', allergens: [] },
		{ name: 'certified gluten-free rolled oats', reason: 'Use when the concern is wheat cross-contact; verify package certification.', allergens: [] }
	],
	'chia seeds': [
		{ name: 'ground flaxseed', reason: 'Adds similar fiber and thickening power in overnight recipes.', allergens: [] },
		{ name: 'pumpkin seeds', reason: 'A crunchy seed option that brings extra minerals and texture.', allergens: [] }
	],
	'garlic': [
		{ name: 'shallot', reason: 'Milder and sweeter, with a softer aromatic profile.', allergens: [] },
		{ name: 'garlic powder', reason: 'A pantry-friendly swap when fresh garlic is unavailable.', allergens: [], amountMultiplier: 0.125, unit: 'tsp' }
	],
	'lemon': [
		{ name: 'lime', reason: 'A brighter citrus option with a similar acid kick.', allergens: [] }
	],
	'honey': [
		{ name: 'maple syrup', reason: 'A plant-based sweetener with a mellow sweetness.', allergens: [] },
		{ name: 'agave nectar', reason: 'A smooth liquid sweetener that works well in small amounts.', allergens: [] }
	]
};

function normalizeIngredientName(value: string): string {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

export function getSmartSwaps(ingredientName: string, excludedAllergens: Allergen[] = []): IngredientSwap[] {
	const normalized = normalizeIngredientName(ingredientName);
	if (!normalized) return [];

	const matches = swapCatalog[normalized] ?? Object.entries(swapCatalog).find(([key]) => normalized.includes(key) || key.includes(normalized))?.[1] ?? [];

	return matches.filter((swap) => !swap.allergens.some((allergen) => excludedAllergens.includes(allergen)));
}

export function applyIngredientSwap(ingredient: Ingredient, swap: IngredientSwap): Ingredient {
	return {
		...ingredient,
		name: swap.name,
		baseAmount: Number((ingredient.baseAmount * (swap.amountMultiplier ?? 1)).toFixed(2)),
		unit: swap.unit ?? ingredient.unit
	};
}
