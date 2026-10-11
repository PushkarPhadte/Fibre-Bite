<script lang="ts">
	import { allergyProfile } from '$lib/allergy-profile.svelte';
	import { addPantryIngredients, clearPantry, pantry, removePantryIngredient } from '$lib/pantry.svelte';
	import { getRecipeAllergens } from '$lib/recipe-swaps.svelte';
	import RecipeCard from '$lib/components/RecipeCard.svelte';
	import { findLowWasteRecipes } from '$lib/zero-waste';
	import { Plus, Recycle, Trash2, X } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let ingredientInput = $state('');
	let safeRecipes = $derived(data.recipes.filter((recipe) => !allergyProfile.allergens.some((allergen) => getRecipeAllergens(recipe).includes(allergen))));
	let suggestions = $derived(findLowWasteRecipes(safeRecipes, pantry.ingredients));

	function submitIngredients(event: SubmitEvent) {
		event.preventDefault();
		addPantryIngredients(ingredientInput);
		ingredientInput = '';
	}
</script>

<svelte:head>
	<title>Zero-waste recipe finder | Fibre-Bite</title>
	<meta name="description" content="Find recipes that use ingredients you already have on hand." />
</svelte:head>

<main class="page-enter mx-auto max-w-7xl space-y-8 px-5 py-8 sm:px-8 md:py-12">
	<header class="flex flex-wrap items-end justify-between gap-4 border-b border-emerald-950/15 pb-5">
		<div>
			<p class="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-emerald-700"><Recycle size={16} /> Use what you have</p>
			<h1 class="mt-2 font-display text-4xl font-semibold text-emerald-950">Zero-waste recipe finder</h1>
			<p class="mt-2 max-w-2xl text-slate-600">Add ingredients you want to use up. Recipes are ranked by how many of those ingredients they include.</p>
		</div>
	</header>

	<section class="grid gap-8 lg:grid-cols-[minmax(16rem,0.8fr)_minmax(0,1.5fr)]">
		<aside class="space-y-5">
			<div class="rounded-lg border border-slate-200 bg-white p-5">
				<h2 class="text-lg font-bold text-slate-900">Ingredients to use</h2>
				<form class="mt-4 flex gap-2" onsubmit={submitIngredients}>
					<label class="sr-only" for="pantry-ingredients">Ingredients to use up</label>
					<input id="pantry-ingredients" bind:value={ingredientInput} class="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100" placeholder="e.g. lemon, oats, milk" />
					<button type="submit" aria-label="Add ingredients" class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-emerald-900 text-white transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"><Plus size={18} /></button>
				</form>
				<p class="mt-2 text-xs text-slate-500">Separate multiple ingredients with commas.</p>

				{#if pantry.ingredients.length > 0}
					<div class="mt-5 border-t border-slate-200 pt-4">
						<div class="flex items-center justify-between gap-3">
							<h3 class="text-sm font-semibold text-slate-800">Your pantry match list</h3>
							<button type="button" class="text-xs font-semibold text-slate-500 hover:text-rose-700" onclick={clearPantry}>Clear</button>
						</div>
						<ul class="mt-3 flex flex-wrap gap-2">
							{#each pantry.ingredients as ingredient (ingredient)}
								<li class="inline-flex items-center gap-1 rounded-md border border-emerald-900/15 bg-emerald-50 px-2.5 py-1.5 text-sm text-emerald-950">
									{ingredient}
									<button type="button" aria-label={`Remove ${ingredient}`} class="rounded p-0.5 text-emerald-800 hover:bg-emerald-100" onclick={() => removePantryIngredient(ingredient)}><X size={14} /></button>
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>

			<div class="border-l-2 border-amber-500 bg-amber-50/70 px-4 py-3 text-sm leading-6 text-amber-950">
				<p class="font-semibold">Ingredient matching is approximate</p>
				<p class="mt-1">A match means the recipe lists a similar ingredient. Check freshness, quantity, and recipe details before cooking.</p>
			</div>
		</aside>

		<section aria-labelledby="suggestions-title">
			<div class="mb-4 flex flex-wrap items-end justify-between gap-3">
				<div>
					<p class="text-sm font-bold uppercase tracking-[0.12em] text-emerald-700">Best pantry matches</p>
					<h2 id="suggestions-title" class="mt-1 font-display text-2xl font-semibold text-emerald-950">Recipe suggestions</h2>
				</div>
				{#if pantry.ingredients.length > 0}
					<p class="text-sm font-semibold text-slate-600" aria-live="polite">{suggestions.length} matching {suggestions.length === 1 ? 'recipe' : 'recipes'}</p>
				{/if}
			</div>
			{#if pantry.ingredients.length === 0}
				<div class="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
					<p class="font-semibold text-slate-800">Add a few ingredients to get started.</p>
					<p class="mt-2 text-sm">The list is saved in this browser and used only to rank recipe matches.</p>
				</div>
			{:else if suggestions.length === 0}
				<div class="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
					<p class="font-semibold text-slate-800">No recipes match those ingredients yet.</p>
					<p class="mt-2 text-sm">Try a broader ingredient name or update your pantry list.</p>
				</div>
			{:else}
				<div class="space-y-6">
					{#each suggestions as suggestion (suggestion.recipe.id)}
						<article class="space-y-3">
							<div class="mb-3 flex flex-wrap items-center justify-between gap-2">
								<span class="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-900"><Recycle size={14} /> Uses {suggestion.matchedIngredients.length} of {suggestion.totalIngredients} ingredients</span>
								<p class="text-xs text-slate-600">Matched: {suggestion.matchedIngredients.join(', ')}</p>
							</div>
							<RecipeCard recipe={suggestion.recipe} />
						</article>
					{/each}
				</div>
			{/if}
		</section>
	</section>
</main>
