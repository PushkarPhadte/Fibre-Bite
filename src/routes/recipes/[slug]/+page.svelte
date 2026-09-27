<script lang="ts">
	import NutritionLabel from '$lib/components/NutritionLabel.svelte';
	import ServingSelector from '$lib/components/ServingSelector.svelte';
	import { scaleNutrition } from '$lib/recipes/nutrition';
	import { formatIngredient } from '$lib/recipes/units';
	import { favorites, toggleFavorite } from '$lib/preferences';
	import { Heart } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let recipe = $derived(data.recipe);
	let servings = $state(1);
	let multiplier = $derived(servings / (recipe.baseServings || 1));
	let scaledNutrition = $derived(scaleNutrition(recipe.nutrition, multiplier));
	let saved = $derived($favorites.includes(recipe.id));

	$effect(() => {
		if (recipe) {
			servings = recipe.baseServings;
		}
	});
</script>

<svelte:head>
	<title>{recipe.title} | Fibre-Bite</title>
</svelte:head>

<div class="mx-auto max-w-6xl px-6 py-10">
	<a href="/recipes" class="mb-6 inline-flex items-center text-sm font-semibold text-emerald-700">← Back to recipes</a>

	<div class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
		<img src={recipe.image ?? 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80'} alt={recipe.title} class="h-72 w-full object-cover md:h-96" />
		<div class="space-y-8 p-6 md:p-8">
			<div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
				<div>
					<p class="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">{recipe.source}</p>
					<h1 class="mt-2 text-3xl font-black text-slate-900 md:text-5xl">{recipe.title}</h1>
				</div>
				<div class="flex items-center gap-3">
					<button type="button" class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm" onclick={() => toggleFavorite(recipe.id)}>
						<Heart size={16} class={saved ? 'fill-rose-500 text-rose-500' : 'text-slate-700'} />
						{saved ? 'Saved' : 'Save'}
					</button>
					<ServingSelector bind:servings min={1} max={12} />
				</div>
			</div>

			<p class="max-w-3xl text-lg text-slate-600">{recipe.description ?? 'A balanced, nourishing recipe that brings flavor and simplicity together.'}</p>

			<div class="flex flex-wrap gap-2">
				{#each recipe.dietaryTags as tag}
					<span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">{tag}</span>
				{/each}
				{#each recipe.allergens as allergen}
					<span class="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">Avoid {allergen}</span>
				{/each}
			</div>

			<div class="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
				<section>
					<h2 class="text-2xl font-bold text-slate-900">Ingredients</h2>
					<ul class="mt-4 space-y-3">
						{#each recipe.ingredients as ingredient}
							<li class="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700">
								<span class="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
								<span>{formatIngredient(ingredient, multiplier)}</span>
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
