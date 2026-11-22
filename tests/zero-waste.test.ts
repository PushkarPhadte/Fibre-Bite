import test from 'node:test';
import assert from 'node:assert/strict';

import { findLowWasteRecipes } from '../src/lib/zero-waste.ts';
import { pantryInputFeedback, resolveIngredientName } from '../src/lib/recipes/ingredients.ts';
import type { Recipe } from '../src/lib/recipes/types.ts';

function makeRecipe(slug: string, title: string, ingredientNames: string[]): Recipe {
	return {
		id: `local-${slug}`,
		slug,
		title,
		benefits: ['Provides dietary fiber.'],
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

test('matches multilingual and romanized coriander leaf names by canonical identity', () => {
	const recipe = makeRecipe('coriander', 'Coriander salad', ['fresh cilantro, chopped']);
	for (const name of ['Coriander', 'Coriander Leaves', 'Cilantro', 'Dhaniya', 'Hara Dhaniya', 'धनिया', 'कोथिंबीर', 'Kothimbir']) {
		assert.equal(findLowWasteRecipes([recipe], [name]).length, 1, `${name} should match coriander leaves`);
	}
});

test('does not merge coriander leaves with seeds or powder', () => {
	const recipes = [
		makeRecipe('seeds', 'Seeds', ['coriander seeds, crushed']),
		makeRecipe('powder', 'Powder', ['ground coriander'])
	];
	assert.deepEqual(findLowWasteRecipes(recipes, ['Kothimbir']), []);
});

test('does not treat a mixed spice blend as a single coriander ingredient', () => {
	const recipe = makeRecipe('spice-blend', 'Spiced dish', ['ground cumin and coriander']);
	assert.deepEqual(findLowWasteRecipes([recipe], ['Kothimbir']), []);
});

test('uses an explicit recipe ingredient canonicalId when provided', () => {
	const recipe = makeRecipe('canonical-herb', 'Herb salad', ['fresh green herb']);
	recipe.ingredients[0].canonicalId = 'coriander-leaves';
	assert.equal(findLowWasteRecipes([recipe], ['Kothimbir']).length, 1);
});

test('reports unknown and ambiguous names without discarding them', () => {
	assert.deepEqual(pantryInputFeedback(['mystery herb', 'pepper']), {
		unknown: ['mystery herb'],
		ambiguous: ['pepper']
	});
	const dhaniya = resolveIngredientName('  DHANIYA!! ');
	assert.equal(dhaniya.status, 'known');
	if (dhaniya.status === 'known') assert.equal(dhaniya.canonicalId, 'coriander-leaves');
});
