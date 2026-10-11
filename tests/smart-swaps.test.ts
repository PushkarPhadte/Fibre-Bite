import test from 'node:test';
import assert from 'node:assert/strict';

import { applyIngredientSwap, getSmartSwaps } from '../src/lib/smart-swaps.ts';

test('returns swaps for common dairy ingredients', () => {
	const swaps = getSmartSwaps('milk');
	assert.ok(swaps.some((swap) => swap.name.toLowerCase().includes('almond')));
	assert.ok(swaps.some((swap) => swap.name.toLowerCase().includes('soy')));
});

test('returns swaps for common cooking fats', () => {
	const swaps = getSmartSwaps('olive oil');
	assert.ok(swaps.some((swap) => swap.name.toLowerCase().includes('avocado')));
	assert.ok(swaps.some((swap) => swap.name.toLowerCase().includes('coconut')) || swaps.some((swap) => swap.name.toLowerCase().includes('canola')));
});

test('returns swaps for protein ingredients', () => {
	const swaps = getSmartSwaps('chicken breast');
	assert.ok(swaps.some((swap) => swap.name.toLowerCase().includes('tofu')));
	assert.ok(swaps.some((swap) => swap.name.toLowerCase().includes('turkey')));
});

test('returns an empty array when no swap is known', () => {
	assert.deepEqual(getSmartSwaps('dragonfruit'), []);
});

test('filters swaps that conflict with the allergy profile', () => {
	const treeNutSafe = getSmartSwaps('milk', ['tree-nuts']);
	assert.deepEqual(treeNutSafe.map((swap) => swap.name), ['soy milk']);
	assert.deepEqual(getSmartSwaps('milk', ['tree-nuts', 'soy']), []);
});

test('converts ingredient amount and unit for a measured substitution', () => {
	const ingredient = { name: 'garlic', baseAmount: 2, unit: 'cloves' };
	const garlicPowder = getSmartSwaps('garlic').find((swap) => swap.name === 'garlic powder');
	assert.ok(garlicPowder);
	assert.deepEqual(applyIngredientSwap(ingredient, garlicPowder), {
		name: 'garlic powder',
		baseAmount: 0.25,
		unit: 'tsp'
	});
});
