<script lang="ts">
	import { isOnGroceryList, toggleGroceryList } from '$lib/grocery-list.svelte';
	import { isInMealPrep, toggleMealPrepRecipe } from '$lib/meal-prep.svelte';
	import type { Recipe } from '$lib/recipes/types';
	import { favorites, toggleFavorite } from '$lib/preferences.svelte';
	import { ArrowRight, CookingPot, Heart, ShoppingBasket } from 'lucide-svelte';

	let { recipe }: { recipe: Recipe } = $props();
	let isSaved = $derived(favorites.ids.includes(recipe.id));
	let isOnList = $derived(isOnGroceryList(recipe.id));
	let isInPrepPlan = $derived(isInMealPrep(recipe.id));

	function onFavoriteClick(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
		toggleFavorite(recipe.id);
	}

	function onGroceryClick(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
		toggleGroceryList(recipe.id);
	}

	function onMealPrepClick(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
		toggleMealPrepRecipe(recipe.id);
	}
</script>

	<div class="group relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
	<a href={`/recipes/${recipe.slug}`} class="block">
		<img src={recipe.image ?? 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=900&q=80'} alt={recipe.title} loading="lazy" decoding="async" class="h-48 w-full object-cover" />
		<div class="space-y-3 p-5">
			<div class="flex items-center justify-between gap-3">
				<span class="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">{recipe.baseServings} servings</span>
				{#if recipe.nutrition?.protein !== undefined}
					<span class="text-sm font-semibold text-slate-600">{recipe.nutrition.protein}g protein</span>
				{/if}
			</div>
			<h2 class="text-xl font-semibold text-slate-900">{recipe.title}</h2>
			<p class="text-sm text-slate-600">{recipe.description ?? 'A healthy recipe worth trying.'}</p>
			<div class="flex items-center justify-between pt-2 text-sm font-medium text-emerald-700">
				<span>{recipe.dietaryTags.join(', ') || 'Balanced'}</span>
				<span class="inline-flex items-center gap-1">
					View recipe
					<ArrowRight size={16} />
				</span>
			</div>
		</div>
	</a>
	{#if recipe.imageAttribution}
		<p class="border-t border-slate-100 px-5 py-2 text-xs text-slate-500">
			Photo: <a class="underline hover:text-slate-800" href={recipe.imageAttribution.sourceUrl} target="_blank" rel="noreferrer">{recipe.imageAttribution.title}</a>
			by <a class="underline hover:text-slate-800" href={recipe.imageAttribution.creatorUrl} target="_blank" rel="noreferrer">{recipe.imageAttribution.creator}</a>,
			<a class="underline hover:text-slate-800" href={recipe.imageAttribution.licenseUrl} target="_blank" rel="noreferrer">{recipe.imageAttribution.license}</a>.
		</p>
	{/if}
	<button type="button" aria-label={isSaved ? 'Remove from saved recipes' : 'Save recipe'} aria-pressed={isSaved} class="absolute right-4 top-4 rounded-full border border-white bg-white/90 p-2 text-slate-700 shadow-sm transition hover:scale-105" onclick={onFavoriteClick}>
		<Heart size={18} class={isSaved ? 'fill-rose-500 text-rose-500' : 'text-slate-700'} />
	</button>
	<button type="button" aria-label={isOnList ? 'Remove from grocery list' : 'Add to grocery list'} aria-pressed={isOnList} class="absolute right-14 top-4 rounded-full border border-white bg-white/90 p-2 text-slate-700 shadow-sm transition hover:scale-105" onclick={onGroceryClick}>
		<ShoppingBasket size={18} class={isOnList ? 'fill-emerald-500 text-emerald-600' : 'text-slate-700'} />
	</button>
	<button type="button" aria-label={isInPrepPlan ? 'Remove from meal prep plan' : 'Add to meal prep plan'} aria-pressed={isInPrepPlan} title={isInPrepPlan ? 'Remove from meal prep plan' : 'Add to meal prep plan'} class="absolute right-24 top-4 rounded-full border border-white bg-white/90 p-2 text-slate-700 shadow-sm transition hover:scale-105" onclick={onMealPrepClick}>
		<CookingPot size={18} class={isInPrepPlan ? 'text-emerald-700' : 'text-slate-700'} />
	</button>
</div>
