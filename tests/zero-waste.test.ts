import test from 'node:test';
import assert from 'node:assert/strict';

import { findLowWasteRecipes } from '../src/lib/zero-waste.ts';
import type { Recipe } from '../src/lib/recipes/types.ts';

function makeRecipe(slug: string, title: string, ingredientNames: string[]): Recipe {
	return {
		id: `local-${slug}`,
		slug,
		title,
		baseServings: 2,
		ingredients: ingredientNames.map((name) => ({ name, baseAmount: 1, unit: 'piece' })),
		instructions: [{ number: 1, text: 'Prepare the ingredients.' }],
		dietaryTags: [],
		allergens: []
	};
}

test('ranks recipes by number of matching pantry ingredients', () => {
	const recipes = [
		makeRecipe('single', 'Single match', ['lemon', 'garlic']),
		makeRecipe('multiple', 'Multiple matches', ['lemon', 'garlic', 'olive oil'])
	];

	const results = findLowWasteRecipes(recipes, ['LEMON', 'garlic', 'oil']);
	assert.deepEqual(results.map((result) => result.recipe.slug), ['multiple', 'single']);
	assert.equal(results[0].matchedIngredients.length, 3);
});

test('returns no suggestions for empty pantry input', () => {
	assert.deepEqual(findLowWasteRecipes([makeRecipe('test', 'Test', ['lemon'])], []), []);
});

test('does not suggest recipes without ingredient overlap', () => {
	const recipe = makeRecipe('oats', 'Oats', ['rolled oats', 'milk']);
	assert.deepEqual(findLowWasteRecipes([recipe], ['mushrooms']), []);
});
