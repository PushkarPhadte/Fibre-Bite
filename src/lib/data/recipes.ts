import type { Recipe } from '$lib/recipes/types';

export const localRecipes: Recipe[] = [
	{
		id: 'local-lemon-herb-chicken',
		slug: 'lemon-herb-chicken',
		title: 'Lemon Herb Chicken',
		description: 'Bright, protein-rich chicken with herbs and lemon for an easy weeknight meal.',
		source: 'local',
		baseServings: 4,
		ingredients: [
			{ name: 'chicken breast', baseAmount: 500, unit: 'g' },
			{ name: 'lemon', baseAmount: 1, unit: 'whole' },
			{ name: 'olive oil', baseAmount: 2, unit: 'tbsp' },
			{ name: 'garlic', baseAmount: 2, unit: 'cloves' },
			{ name: 'dried oregano', baseAmount: 1, unit: 'tsp' },
			{ name: 'parsley', baseAmount: 1, unit: 'tsp' },
			{ name: 'salt and pepper', baseAmount: 1, unit: 'pinch', optional: true }
		],
		instructions: [
			{ number: 1, text: 'Season the chicken with lemon juice, olive oil, garlic, oregano, and herbs.' },
			{ number: 2, text: 'Marinate for 15 minutes while the oven preheats to 220°C.' },
			{ number: 3, text: 'Roast or pan-sear until the chicken is cooked through and golden.' },
			{ number: 4, text: 'Finish with extra lemon zest and serve immediately.' }
		],
		nutrition: {
			calories: 420,
			protein: 46,
			carbohydrates: 12,
			fat: 21,
			fiber: 3,
			sugar: 2,
			sodium: 320
		},
		dietaryTags: ['high-protein'],
		allergens: [],
		image: 'https://images.unsplash.com/photo-1604909052743-94e838986d24?auto=format&fit=crop&w=1200&q=80'
	},
	{
		id: 'local-overnight-oats',
		slug: 'overnight-oats',
		title: 'Overnight Oats',
		description: 'Creamy oats with chia, berries, and vanilla for a quick fiber-rich breakfast.',
		source: 'local',
		baseServings: 2,
		ingredients: [
			{ name: 'rolled oats', baseAmount: 1, unit: 'cup' },
			{ name: 'milk', baseAmount: 1, unit: 'cup' },
			{ name: 'chia seeds', baseAmount: 1, unit: 'tbsp' },
			{ name: 'Greek yogurt', baseAmount: 1, unit: 'tbsp' },
			{ name: 'vanilla extract', baseAmount: 1, unit: 'tsp' },
			{ name: 'berries', baseAmount: 0.5, unit: 'cup' },
			{ name: 'honey', baseAmount: 1, unit: 'tbsp', optional: true }
		],
		instructions: [
			{ number: 1, text: 'Stir the oats, milk, chia seeds, yogurt, vanilla, and honey together.' },
			{ number: 2, text: 'Refrigerate overnight so the oats soften and absorb the liquid.' },
			{ number: 3, text: 'Top with berries in the morning and serve chilled.' }
		],
		nutrition: {
			calories: 340,
			protein: 18,
			carbohydrates: 41,
			fat: 11,
			fiber: 9,
			sugar: 10,
			sodium: 150
		},
		dietaryTags: ['vegetarian', 'high-fiber'],
		allergens: ['milk'],
		image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=1200&q=80'
	}
];
