<script lang="ts">
	import type { PageData } from './$types';
	import RecipeCard from '$lib/components/RecipeCard.svelte';
	import FilterChips from '$lib/components/FilterChips.svelte';
	import { allergenOptions, dietaryOptions } from '$lib/recipes/types';

	let { data }: { data: PageData } = $props();
	let query = $state('');
	let selectedDiet = $state('');
	let selectedAllergen = $state('');
	let selectedSort = $state('');

	$effect(() => {
		query = data.query ?? '';
		selectedDiet = data.dietary ?? '';
		selectedAllergen = data.allergen ?? '';
		selectedSort = data.sort ?? '';
	});

	let recipes = $derived(data.recipes ?? []);

	function applyFilters() {
		const params = new URLSearchParams();
		if (query.trim()) params.set('query', query.trim());
		if (selectedDiet) params.set('diet', selectedDiet);
		if (selectedAllergen) params.set('allergen', selectedAllergen);
		if (selectedSort) params.set('sort', selectedSort);
		window.location.href = `/recipes?${params.toString()}`;
	}
</script>

<svelte:head>
	<title>Browse recipes</title>
</svelte:head>

<div class="mx-auto max-w-6xl space-y-8 px-6 py-10">
	<div class="rounded-3xl bg-slate-900 p-8 text-white shadow-lg">
		<h1 class="text-3xl font-bold">Recipe discovery</h1>
		<p class="mt-2 text-slate-300">Search healthy meals by title, ingredient, dietary preference, and allergen profile.</p>
	</div>

	<div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
		<div class="grid gap-4 md:grid-cols-4">
			<label class="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
				Search
				<input bind:value={query} class="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200" placeholder="Search recipes" />
			</label>
			<label class="space-y-2 text-sm font-medium text-slate-700">
				Diet
				<select bind:value={selectedDiet} class="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200">
					<option value="">Any</option>
					{#each dietaryOptions as option}
						<option value={option}>{option}</option>
					{/each}
				</select>
			</label>
			<label class="space-y-2 text-sm font-medium text-slate-700">
				Allergen
				<select bind:value={selectedAllergen} class="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200">
					<option value="">None</option>
					{#each allergenOptions as option}
						<option value={option}>{option}</option>
					{/each}
				</select>
			</label>
			<label class="space-y-2 text-sm font-medium text-slate-700">
				Sort
				<select bind:value={selectedSort} class="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200">
					<option value="">Default</option>
					<option value="title">Title</option>
					<option value="protein">Protein</option>
					<option value="calories">Calories</option>
				</select>
			</label>
		</div>
		<div class="mt-5 flex justify-end">
			<button type="button" onclick={applyFilters} class="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500">Apply filters</button>
		</div>
	</div>

	<div class="mt-6">
		<FilterChips {selectedDiet} {selectedAllergen} dietOptions={dietaryOptions} allergenOptions={allergenOptions} onApply={applyFilters} />
	</div>

	<div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
		{#each recipes as recipe (recipe.slug)}
			<RecipeCard {recipe} />
		{/each}
	</div>
</div>
