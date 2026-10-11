<script lang="ts">
	import NutritionLabel from '$lib/components/NutritionLabel.svelte';
	import ServingSelector from '$lib/components/ServingSelector.svelte';
	import { allergyProfile } from '$lib/allergy-profile.svelte';
	import { isOnGroceryList, toggleGroceryList } from '$lib/grocery-list.svelte';
	import { isInMealPrep, toggleMealPrepRecipe } from '$lib/meal-prep.svelte';
	import { getRecipeAllergens, getRecipeSwap, resetRecipeSwap, setRecipeSwap } from '$lib/recipe-swaps.svelte';
	import { recipeServings, getRecipeServings, setRecipeServings } from '$lib/recipe-servings.svelte';
	import { applyIngredientSwap, getSmartSwaps } from '$lib/smart-swaps';
	import { scaleNutrition } from '$lib/recipes/nutrition';
	import { formatIngredient } from '$lib/recipes/units';
	import { favorites, toggleFavorite } from '$lib/preferences.svelte';
	import { CookingPot, Heart, ShoppingBasket } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let recipe = $derived(data.recipe);
	let selectedServings = $state<number | null>(null);
	let servings = $derived(selectedServings ?? recipe.baseServings);
	let multiplier = $derived(servings / (recipe.baseServings || 1));
	let scaledNutrition = $derived(scaleNutrition(recipe.nutrition, multiplier));
	let saved = $derived(favorites.ids.includes(recipe.id));
	let onShoppingList = $derived(isOnGroceryList(recipe.id));
	let inMealPrepPlan = $derived(isInMealPrep(recipe.id));
	let profileConflicts = $derived(getRecipeAllergens(recipe).filter((allergen) => allergyProfile.allergens.includes(allergen)));
	$effect(() => {
		recipe.slug;
		selectedServings = recipeServings.initialized ? getRecipeServings(recipe.id) ?? null : null;
	});
</script>

<svelte:head>
	<title>{recipe.title} | Fibre-Bite</title>
	<meta name="description" content={recipe.description ?? `Ingredients, nutrition, and instructions for ${recipe.title}.`} />
</svelte:head>

<div class="mx-auto max-w-6xl px-6 py-10">
	<a href="/recipes" class="mb-6 inline-flex items-center text-sm font-semibold text-emerald-700">← Back to recipes</a>

	<div class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
		<img src={recipe.image ?? 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80'} alt={recipe.title} class="h-72 w-full object-cover md:h-96" />
		{#if recipe.imageAttribution}
			<p class="px-6 pt-2 text-xs text-slate-500 md:px-8">
				Photo: <a class="underline hover:text-slate-800" href={recipe.imageAttribution.sourceUrl} target="_blank" rel="noreferrer">{recipe.imageAttribution.title}</a>
				by <a class="underline hover:text-slate-800" href={recipe.imageAttribution.creatorUrl} target="_blank" rel="noreferrer">{recipe.imageAttribution.creator}</a>,
				<a class="underline hover:text-slate-800" href={recipe.imageAttribution.licenseUrl} target="_blank" rel="noreferrer">{recipe.imageAttribution.license}</a>.
			</p>
		{/if}
		<div class="space-y-8 p-6 md:p-8">
			<div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
				<div>
					<h1 class="mt-2 font-display text-3xl font-semibold text-slate-900 md:text-5xl">{recipe.title}</h1>
				</div>
				<div class="flex flex-wrap items-center gap-3">
					<button type="button" aria-pressed={saved} class="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm" onclick={() => toggleFavorite(recipe.id)}>
						<Heart size={16} class={saved ? 'fill-rose-500 text-rose-500' : 'text-slate-700'} />
						{saved ? 'Saved' : 'Save'}
					</button>
					<button type="button" aria-pressed={onShoppingList} class="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm" onclick={() => toggleGroceryList(recipe.id)}>
						<ShoppingBasket size={16} class={onShoppingList ? 'fill-emerald-500 text-emerald-600' : 'text-slate-700'} />
						{onShoppingList ? 'On list' : 'Add to list'}
					</button>
					<button type="button" aria-pressed={inMealPrepPlan} class="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm" onclick={() => toggleMealPrepRecipe(recipe.id)}>
						<CookingPot size={16} class={inMealPrepPlan ? 'text-emerald-700' : 'text-slate-700'} />
						{inMealPrepPlan ? 'In prep plan' : 'Add to prep plan'}
					</button>
					<ServingSelector {servings} min={1} max={12} onChange={(value) => { selectedServings = value === recipe.baseServings ? null : value; setRecipeServings(recipe.id, value, recipe.baseServings); }} />
				</div>
			</div>

			<p class="max-w-3xl text-lg text-slate-600">{recipe.description ?? 'A balanced, nourishing recipe that brings flavor and simplicity together.'}</p>

			<div class="flex flex-wrap gap-2">
				{#each recipe.dietaryTags as tag}
					<span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">{tag}</span>
				{/each}
				{#each recipe.allergens as allergen}
					<span class="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">Tagged allergen: {allergen}</span>
				{/each}
			</div>
			{#if recipe.allergens.length > 0}
				<p class="text-sm text-slate-500">Allergen labels are based on listed ingredients and are not a guarantee for allergy safety.</p>
			{/if}
			{#if profileConflicts.length > 0}
				<div role="alert" class="border-l-4 border-rose-700 bg-rose-50 px-4 py-3 text-sm text-rose-950">
					<p class="font-bold">This recipe matches your saved allergy profile.</p>
					<p class="mt-1">Tagged: {profileConflicts.join(', ')}. Do not rely on this label alone to determine whether a food is safe for you.</p>
				</div>
			{/if}

			<div class="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
				<section>
					<h2 class="text-2xl font-bold text-slate-900">Ingredients</h2>
					<ul class="mt-4 space-y-3">
						{#each recipe.ingredients as ingredient}
							{@const selectedSwap = getRecipeSwap(recipe.id, ingredient.name)}
							<li class="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700">
								<div class="flex gap-3">
									<span class="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
									<span>{formatIngredient(selectedSwap ? applyIngredientSwap(ingredient, selectedSwap) : ingredient, multiplier)}</span>
								</div>
								{#if getSmartSwaps(ingredient.name, allergyProfile.allergens).length > 0}
									<div class="mt-3 flex flex-wrap items-center gap-2">
										<span class="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Smart swaps</span>
										{#each getSmartSwaps(ingredient.name, allergyProfile.allergens) as swap}
											<button type="button" title={swap.reason} aria-pressed={selectedSwap?.name === swap.name} class={`rounded-full border px-2.5 py-1 text-xs font-semibold transition ${selectedSwap?.name === swap.name ? 'border-emerald-700 bg-emerald-700 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-emerald-600 hover:bg-emerald-50'}`} onclick={() => setRecipeSwap(recipe.id, ingredient.name, swap)}>
												{swap.name}
											</button>
										{/each}
										{#if selectedSwap}
											<button type="button" class="text-xs font-semibold text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline" onclick={() => resetRecipeSwap(recipe.id, ingredient.name)}>
												Reset
											</button>
										{/if}
									</div>
								{/if}
								{#if selectedSwap}
									<p class="mt-2 text-xs leading-5 text-slate-500">{selectedSwap.reason} Recipe directions and nutrition still reflect the original ingredient; adjust preparation as needed.</p>
								{/if}
							</li>
						{/each}
					</ul>
				</section>

				<section class="rounded-2xl bg-slate-50 p-5">
					<h2 class="text-2xl font-bold text-slate-900">Nutrition</h2>
					<div class="mt-4">
						<NutritionLabel nutrition={scaledNutrition} />
					</div>
				</section>
			</div>

			<section class="mt-8">
				<h2 class="text-2xl font-bold text-slate-900">Method</h2>
				<ol class="mt-5 space-y-4">
					{#each recipe.instructions as instruction}
						<li class="flex gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
							<span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">{instruction.number}</span>
							<p class="text-slate-700">{instruction.text}</p>
						</li>
					{/each}
				</ol>
			</section>
		</div>
	</div>
</div>
