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

export const micronutrientsSchema = z.object({
	vitaminCMg: z.number().nonnegative().optional(),
	vitaminDMcg: z.number().nonnegative().optional(),
	calciumMg: z.number().nonnegative().optional(),
	ironMg: z.number().nonnegative().optional(),
	potassiumMg: z.number().nonnegative().optional(),
	magnesiumMg: z.number().nonnegative().optional(),
	folateMcg: z.number().nonnegative().optional()
});

export const nutritionSchema = z.object({
	calories: z.number().nonnegative().optional(),
	protein: z.number().nonnegative().optional(),
	carbohydrates: z.number().nonnegative().optional(),
	fat: z.number().nonnegative().optional(),
	fiber: z.number().nonnegative().optional(),
	sugar: z.number().nonnegative().optional(),
	sodium: z.number().nonnegative().optional(),
	micronutrients: micronutrientsSchema.optional(),
	micronutrientEstimateSource: z.string().trim().min(1).optional()
});

export const ingredientSchema = z.object({
	name: z.string().trim().min(1),
	baseAmount: z.number().nonnegative(),
	unit: z.string().trim().min(1),
	optional: z.boolean().optional()
});

export const instructionStepSchema = z.object({
	number: z.number().int().positive(),
	text: z.string().trim().min(1)
});

export const instructionStepsSchema = z.array(instructionStepSchema).min(1).superRefine((steps, context) => {
	steps.forEach((step, index) => {
		if (step.number !== index + 1) {
			context.addIssue({
				code: 'custom',
				path: [index, 'number'],
				message: 'Instruction numbers must be sequential, starting at 1.'
			});
		}
	});
});

export const localRecipeFrontmatterSchema = z.object({
	title: z.string().trim().min(1),
	slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
	description: z.string().optional(),
	baseServings: z.coerce.number().positive(),
	ingredients: z.array(ingredientSchema).min(1),
	instructions: instructionStepsSchema,
	dietaryTags: z.array(dietaryTagSchema).default([]),
	allergens: z.array(allergenSchema).default([]),
	nutrition: nutritionSchema.optional(),
	image: z.string().url().optional()
});

export type DietaryTag = z.infer<typeof dietaryTagSchema>;
export type Allergen = z.infer<typeof allergenSchema>;
export type Nutrition = z.infer<typeof nutritionSchema>;
export type Micronutrients = z.infer<typeof micronutrientsSchema>;
export type MicronutrientKey = keyof Micronutrients;
export type Ingredient = z.infer<typeof ingredientSchema>;
export type InstructionStep = z.infer<typeof instructionStepSchema>;
export type Recipe = z.infer<typeof localRecipeFrontmatterSchema> & { id: string };
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
