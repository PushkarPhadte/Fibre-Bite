import test from 'node:test';
import assert from 'node:assert/strict';

import { getRecipeText, parseLanguageBlocks, renderLanguageBlocks } from '../src/lib/recipes/localized-content.ts';
import type { Recipe } from '../src/lib/recipes/types.ts';

const markdown = `:::lang hi
# धनिया सलाद

## Description
ताज़ी और सरल सलाद।

## Benefits
- फाइबर का स्रोत

## Instructions
1. सामग्री मिलाएँ।

## Serving idea
रोटी के साथ परोसें।
:::`;

function makeRecipe(translations?: Recipe['translations']): Recipe {
	return {
		id: 'local-test',
		slug: 'test-recipe',
		title: 'Coriander salad',
		description: 'A fresh salad.',
		baseServings: 2,
		ingredients: [{ name: 'cilantro', baseAmount: 1, unit: 'cup' }],
		instructions: [{ number: 1, text: 'Mix the ingredients.' }],
		dietaryTags: [],
		allergens: [],
		translations
	};
}

test('parses language blocks into localized recipe fields and additional text', () => {
	const translations = parseLanguageBlocks(markdown);
	assert.equal(translations.hi?.title, 'धनिया सलाद');
	assert.equal(translations.hi?.description, 'ताज़ी और सरल सलाद।');
	assert.deepEqual(translations.hi?.benefits, ['फाइबर का स्रोत']);
	assert.deepEqual(translations.hi?.instructions, [{ number: 1, text: 'सामग्री मिलाएँ।' }]);
	assert.equal(translations.hi?.content, 'Serving idea\nरोटी के साथ परोसें।');
});

test('renders structured JSON translations as Markdown language blocks', () => {
	const rendered = renderLanguageBlocks({
		ta: {
			title: 'தமிழ் தலைப்பு',
			description: 'தமிழ் விளக்கம்',
			instructions: [{ number: 1, text: 'கலக்கவும்.' }]
		},
		hi: {
			title: 'धनिया सलाद',
			description: 'ताज़ी सलाद।',
			benefits: ['फाइबर का स्रोत'],
			instructions: [{ number: 1, text: 'सामग्री मिलाएँ।' }]
		}
	});
	assert.match(rendered, /^:::lang hi/m);
	assert.match(rendered, /^:::lang ta/m);
	assert.equal(parseLanguageBlocks(rendered).ta?.title, 'தமிழ் தலைப்பு');
	assert.deepEqual(parseLanguageBlocks(rendered).hi?.instructions, [{ number: 1, text: 'सामग्री मिलाएँ।' }]);
});

test('preserves recipe blocks for languages outside the active selector', () => {
	const inactiveTranslation = parseLanguageBlocks(':::lang mr\n# जुनी पाककृती\n:::');
	assert.equal(inactiveTranslation.mr?.title, 'जुनी पाककृती');
	assert.match(renderLanguageBlocks(inactiveTranslation), /^:::lang mr/m);
});

test('falls back field by field to English and existing recipe fields', () => {
	const recipe = makeRecipe({ hi: { title: 'धनिया सलाद' } });
	assert.deepEqual(getRecipeText(recipe, 'hi'), {
		title: 'धनिया सलाद',
		description: 'A fresh salad.',
		instructions: [{ number: 1, text: 'Mix the ingredients.' }],
		benefits: undefined,
		content: undefined
	});
	assert.equal(getRecipeText(recipe, 'mr').title, 'Coriander salad');
});