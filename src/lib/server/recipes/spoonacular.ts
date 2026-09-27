import { z } from 'zod';
import type { Recipe, RecipeSearch } from '$lib/recipes/types';

const spoonacularRecipeSchema = z.object({
	id: z.number(),
	title: z.string(),
	description: z.string().optional(),
	servings: z.number().optional(),
	image: z.string().optional(),
	nutrition: z.object({
		nutrients: z.array(
			z.object({
				name: z.string(),
				amount: z.number(),
				unit: z.string()
			})
		)
	}).optional()
});

export async function getExternalRecipes(_search: RecipeSearch): Promise<Recipe[]> {
	return [];
}

export async function getExternalRecipeBySlug(_slug: string): Promise<Recipe | null> {
	return null;
}

export async function getExternalRecipeById(_id: string): Promise<Recipe | null> {
	return null;
}

export function normalizeSpoonacularRecipe(_data: unknown): Recipe | null {
	const parsed = spoonacularRecipeSchema.safeParse(_data);

	if (!parsed.success) {
		return null;
	}

	const item = parsed.data;

	return {
		id: String(item.id),
		slug: `spoonacular-${item.id}`,
		title: item.title,
		description: item.description,
		source: 'spoonacular',
		baseServings: item.servings ?? 2,
		ingredients: [],
		instructions: [],
		nutrition: {
			calories: item.nutrition?.nutrients.find((nutrient) => nutrient.name.toLowerCase() === 'calories')?.amount,
			protein: item.nutrition?.nutrients.find((nutrient) => nutrient.name.toLowerCase() === 'protein')?.amount,
			carbohydrates: item.nutrition?.nutrients.find((nutrient) => nutrient.name.toLowerCase() === 'carbohydrates')?.amount,
			fat: item.nutrition?.nutrients.find((nutrient) => nutrient.name.toLowerCase() === 'fat')?.amount,
			fiber: item.nutrition?.nutrients.find((nutrient) => nutrient.name.toLowerCase() === 'fiber')?.amount,
			sugar: item.nutrition?.nutrients.find((nutrient) => nutrient.name.toLowerCase() === 'sugar')?.amount,
			sodium: item.nutrition?.nutrients.find((nutrient) => nutrient.name.toLowerCase() === 'sodium')?.amount
		},
		dietaryTags: [],
		allergens: [],
		image: item.image
	};
}
