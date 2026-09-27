<script lang="ts">
	import RecipeCard from '$lib/components/RecipeCard.svelte';
	import { localRecipes } from '$lib/data/recipes';
	import { favorites } from '$lib/preferences';

	let savedRecipes = $derived(localRecipes.filter((recipe) => $favorites.includes(recipe.id)));
</script>

<svelte:head>
	<title>Saved recipes | Fibre-Bite</title>
</svelte:head>

<div class="mx-auto max-w-6xl px-6 py-10">
	<div class="mb-8 rounded-3xl bg-slate-900 p-8 text-white shadow-lg">
		<h1 class="text-3xl font-bold">Saved recipes</h1>
		<p class="mt-2 text-slate-300">Your local favorites stay on this device until you remove them.</p>
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
