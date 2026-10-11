<script lang="ts">
	import type { PageData } from './$types';
	import RecipeCard from '$lib/components/RecipeCard.svelte';
	import { favorites } from '$lib/preferences.svelte';

	let { data }: { data: PageData } = $props();
	let savedRecipes = $derived(data.recipes.filter((recipe) => favorites.ids.includes(recipe.id)));
</script>

<svelte:head>
	<title>Saved recipes | Fibre-Bite</title>
	<meta name="description" content="Recipes saved in this browser on this device." />
</svelte:head>

<div class="mx-auto max-w-6xl px-6 py-10">
	<div class="mb-8 rounded-lg bg-emerald-950 p-8 text-white shadow-lg">
		<h1 class="font-display text-3xl font-semibold">Saved recipes</h1>
		<p class="mt-2 text-emerald-100">Saved recipes stay in this browser on this device.</p>
	</div>

	{#if savedRecipes.length === 0}
		<div class="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
			<p class="text-lg font-medium">No saved recipes yet.</p>
			<a href="/recipes" class="mt-4 inline-block text-sm font-semibold text-emerald-700">Explore recipes</a>
		</div>
	{:else}
		<div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
			{#each savedRecipes as recipe (recipe.slug)}
				<RecipeCard {recipe} />
			{/each}
		</div>
	{/if}
</div>
