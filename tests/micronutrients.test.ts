import test from 'node:test';
import assert from 'node:assert/strict';

import { meetsMicronutrientThreshold } from '../src/lib/recipes/micronutrients.ts';
import { scaleNutrition } from '../src/lib/recipes/nutrition.ts';

test('matches a nutrient when its per-serving amount reaches the selected Daily Value threshold', () => {
	assert.equal(meetsMicronutrientThreshold({ calciumMg: 130 }, 'calciumMg', 10), true);
	assert.equal(meetsMicronutrientThreshold({ calciumMg: 130 }, 'calciumMg', 20), false);
});

test('does not treat a missing nutrient amount as zero or a match', () => {
	assert.equal(meetsMicronutrientThreshold(undefined, 'ironMg', 10), false);
	assert.equal(meetsMicronutrientThreshold({}, 'ironMg', 10), false);
});

test('scales known micronutrients to the selected serving count', () => {
	assert.deepEqual(
		scaleNutrition({ calories: 200, micronutrients: { calciumMg: 130, vitaminCMg: 9 } }, 2),
		{ calories: 400, micronutrients: { calciumMg: 260, vitaminCMg: 18 } }
	);
});

test('keeps empty nutrition unavailable', () => {
	assert.equal(scaleNutrition({}, 1), undefined);
});