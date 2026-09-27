import { z } from 'zod';

export const dietaryTagSchema = z.enum([
	'vegetarian',
	'vegan',
	'gluten-free',
	'high-protein',
	'low-carb',
	'high-fiber',
	'keto'
]);

export const allergenSchema = z.enum([
	'milk',
	'eggs',
	'peanuts',
	'tree-nuts',
	'soy',
	'wheat',
	'sesame',
	'fish',
	'shellfish'
]);

export const nutritionSchema = z.object({
	calories: z.number().optional(),
	protein: z.number().optional(),
	carbohydrates: z.number().optional(),
	fat: z.number().optional(),
	fiber: z.number().optional(),
	sugar: z.number().optional(),
	sodium: z.number().optional()
});

export const ingredientSchema = z.object({
	name: z.string().min(1),
	baseAmount: z.number().nonnegative(),
	unit: z.string().min(1),
	optional: z.boolean().optional()
});

export const instructionStepSchema = z.object({
	number: z.number().int().positive(),
	text: z.string().min(1)
});

export const recipeSchema = z.object({
	id: z.string().min(1),
	slug: z.string().min(1),
	title: z.string().min(1),
	description: z.string().optional(),
	source: z.enum(['local', 'spoonacular']),
	baseServings: z.number().positive(),
	ingredients: z.array(ingredientSchema),
	instructions: z.array(instructionStepSchema),
	nutrition: nutritionSchema.optional(),
	dietaryTags: z.array(dietaryTagSchema).default([]),
	allergens: z.array(allergenSchema).default([]),
	image: z.string().optional()
});

export const localRecipeFrontmatterSchema = z.object({
	title: z.string().min(1),
	slug: z.string().min(1),
	description: z.string().optional(),
	baseServings: z.coerce.number().positive(),
	dietaryTags: z.array(dietaryTagSchema).default([]),
	allergens: z.array(allergenSchema).default([]),
	nutrition: nutritionSchema.optional(),
	image: z.string().optional()
});

export const searchSchema = z.object({
	query: z.string().optional(),
	dietary: dietaryTagSchema.optional(),
	allergen: allergenSchema.optional(),
	sort: z.enum(['title', 'protein', 'calories']).optional()
});

export type DietaryTag = z.infer<typeof dietaryTagSchema>;
export type Allergen = z.infer<typeof allergenSchema>;
export type Nutrition = z.infer<typeof nutritionSchema>;
export type Ingredient = z.infer<typeof ingredientSchema>;
export type InstructionStep = z.infer<typeof instructionStepSchema>;
export type Recipe = z.infer<typeof recipeSchema>;
export type RecipeSearch = z.infer<typeof searchSchema>;

export const dietaryOptions: DietaryTag[] = [
	'vegetarian',
	'vegan',
	'gluten-free',
	'high-protein',
	'low-carb',
	'high-fiber',
	'keto'
];

export const allergenOptions: Allergen[] = [
	'milk',
	'eggs',
	'peanuts',
	'tree-nuts',
	'soy',
	'wheat',
	'sesame',
	'fish',
	'shellfish'
];
