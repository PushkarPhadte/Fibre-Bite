import { z } from 'zod';
import { localRecipes } from '$lib/data/recipes';
import { recipeSchema, type Recipe, type RecipeSearch } from '$lib/recipes/types';
import { getExternalRecipeById, getExternalRecipes } from './spoonacular';

export interface RecipeRepository {
	getLocalRecipes(): Promise<Recipe[]>;
	getRecipeById(id: string): Promise<Recipe | null>;
	searchRecipes(query: RecipeSearch): Promise<Recipe[]>;
	getRecipeDetails(id: string): Promise<Recipe | null>;
	getIngredientSubstitutes(_ingredient: string): Promise<Array<{ ingredient: string; substitutes: string[] }>>;
}

export const repository: RecipeRepository = {
	async getLocalRecipes() {
		return localRecipes.map((recipe) => recipeSchema.parse(recipe));
	},

	async getRecipeById(id: string) {
		const localRecipes = await this.getLocalRecipes();
		const local = localRecipes.find((recipe) => recipe.id === id || recipe.slug === id);
		if (local) {
			return local;
		}

		return getExternalRecipeById(id);
	},

	async searchRecipes(search: RecipeSearch) {
		const local = await this.getLocalRecipes();
		let filtered = [...local];

		if (search.query) {
			const query = search.query.toLowerCase();
			filtered = filtered.filter(
				(recipe) =>
					recipe.title.toLowerCase().includes(query) ||
					recipe.ingredients.some((ingredient) => ingredient.name.toLowerCase().includes(query))
			);
		}

		if (search.dietary) {
			filtered = filtered.filter((recipe) => recipe.dietaryTags.includes(search.dietary as any));
		}

		if (search.allergen) {
			filtered = filtered.filter((recipe) => !recipe.allergens.includes(search.allergen as any));
		}

		const external = await getExternalRecipes(search);
		filtered = [...filtered, ...external];

		const deduped = new Map<string, Recipe>();
		for (const recipe of filtered) {
			deduped.set(recipe.slug || recipe.id, recipe);
		}

		const sorted = [...deduped.values()];
		if (search.sort === 'protein') {
			sorted.sort((a, b) => (b.nutrition?.protein ?? 0) - (a.nutrition?.protein ?? 0));
		}
		if (search.sort === 'calories') {
			sorted.sort((a, b) => (b.nutrition?.calories ?? 0) - (a.nutrition?.calories ?? 0));
		}
		if (search.sort === 'title') {
			sorted.sort((a, b) => a.title.localeCompare(b.title));
		}

		return sorted;
	},

	async getRecipeDetails(id: string) {
		return this.getRecipeById(id);
	},

	async getIngredientSubstitutes(_ingredient: string) {
		return [
			{ ingredient: _ingredient, substitutes: ['Greek yogurt', 'almond milk'] }
		];
	}
};
