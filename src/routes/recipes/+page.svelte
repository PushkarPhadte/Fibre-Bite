<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Search, ShieldAlert, SlidersHorizontal, X } from 'lucide-svelte';
	import { allergyProfile, toggleProfileAllergen } from '$lib/allergy-profile.svelte';
	import { getRecipeAllergens } from '$lib/recipe-swaps.svelte';
	import type { PageData } from './$types';
	import RecipeCard from '$lib/components/RecipeCard.svelte';
	import { allergenOptions, dietaryOptions, type Allergen, type DietaryTag } from '$lib/recipes/types';

	let { data }: { data: PageData } = $props();
	let query = $state('');
	let selectedDiet = $state<DietaryTag | ''>('');
	let excludedAllergens = $state<Allergen[]>([]);
	let selectedSort = $state<'' | 'title' | 'protein' | 'calories'>('');

	$effect(() => {
		query = page.url.searchParams.get('query') ?? '';
		selectedDiet = dietaryOptions.find((diet) => diet === page.url.searchParams.get('diet')) ?? '';
		excludedAllergens = allergenOptions.filter((allergen) => page.url.searchParams.getAll('exclude').includes(allergen));
		const sort = page.url.searchParams.get('sort');
		selectedSort = sort === 'title' || sort === 'protein' || sort === 'calories' ? sort : '';
	});

	let recipes = $derived.by(() => {
		const search = query.trim().toLowerCase();
		const activeAllergens = [...new Set([...excludedAllergens, ...allergyProfile.allergens])];
		const filtered = (data.recipes ?? []).filter((recipe) =>
			(!search || recipe.title.toLowerCase().includes(search) ||
				recipe.ingredients.some((ingredient) => ingredient.name.toLowerCase().includes(search))) &&
			(!selectedDiet || recipe.dietaryTags.includes(selectedDiet)) &&
			!activeAllergens.some((allergen) => getRecipeAllergens(recipe).includes(allergen))
		);

		if (selectedSort === 'title') filtered.sort((a, b) => a.title.localeCompare(b.title));
		if (selectedSort === 'protein') filtered.sort((a, b) => (b.nutrition?.protein ?? 0) - (a.nutrition?.protein ?? 0));
		if (selectedSort === 'calories') filtered.sort((a, b) => (a.nutrition?.calories ?? 0) - (b.nutrition?.calories ?? 0));
		return filtered;
	});

	let activeCount = $derived(Number(Boolean(query.trim())) + Number(Boolean(selectedDiet)) + excludedAllergens.length + Number(Boolean(selectedSort)));

	function toggleExcluded(allergen: Allergen) {
		excludedAllergens = excludedAllergens.includes(allergen)
			? excludedAllergens.filter((item) => item !== allergen)
			: [...excludedAllergens, allergen];
	}

	function applyFilters() {
		const params = new URLSearchParams();
		if (query.trim()) params.set('query', query.trim());
		if (selectedDiet) params.set('diet', selectedDiet);
		for (const allergen of excludedAllergens) params.append('exclude', allergen);
		if (selectedSort) params.set('sort', selectedSort);
		const search = params.toString();
		void goto(search ? `/recipes?${search}` : '/recipes', { keepFocus: true, noScroll: true });
	}

	function clearFilters() {
		query = '';
		selectedDiet = '';
		excludedAllergens = [];
		selectedSort = '';
		void goto('/recipes', { keepFocus: true, noScroll: true });
	}
</script>

<svelte:head>
	<title>Browse recipes | Fibre-Bite</title>
	<meta name="description" content="Find recipes by ingredient, dietary tag, or nutrition and scale servings to fit your table." />
</svelte:head>

<main class="page-enter mx-auto max-w-7xl space-y-8 px-5 py-8 sm:px-8 md:py-12">
	<header class="flex flex-wrap items-end justify-between gap-4 border-b border-emerald-950/15 pb-5">
		<div>
			<p class="text-sm font-bold uppercase tracking-[0.12em] text-emerald-700">Find your next meal</p>
			<h1 class="mt-2 font-display text-4xl font-semibold text-emerald-950">Browse recipes</h1>
		</div>
		<p class="text-sm font-semibold text-slate-600" aria-live="polite">{recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'}</p>
	</header>

	<form
		class="rounded-lg border border-emerald-950/10 bg-white p-5 shadow-sm sm:p-6"
		onsubmit={(event) => { event.preventDefault(); applyFilters(); }}
	>
		<div class="flex flex-wrap items-center justify-between gap-3">
			<h2 class="inline-flex items-center gap-2 text-base font-bold text-emerald-950">
				<SlidersHorizontal size={18} />
				Refine recipes
			</h2>
			{#if activeCount > 0}
				<button type="button" class="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800 hover:text-emerald-600" onclick={clearFilters}>
					<X size={15} /> Clear all
				</button>
			{/if}
		</div>

		<div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(14rem,2fr)_minmax(10rem,1fr)_minmax(11rem,1fr)_minmax(9rem,0.8fr)]">
			<label class="space-y-1.5 text-sm font-semibold text-slate-700">
				Search by recipe or ingredient
				<span class="relative block">
					<Search size={17} class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
					<input bind:value={query} class="w-full rounded-md border border-slate-300 bg-white py-2.5 pl-10 pr-3 font-normal outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100" placeholder="Try oats, lemon..." />
				</span>
			</label>
			<label class="space-y-1.5 text-sm font-semibold text-slate-700">
				Diet
				<select bind:value={selectedDiet} class="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100">
					<option value="">Any diet</option>
					{#each dietaryOptions as option}
						<option value={option}>{option}</option>
					{/each}
				</select>
			</label>
			<label class="space-y-1.5 text-sm font-semibold text-slate-700">
				Sort by
				<select bind:value={selectedSort} class="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100">
					<option value="">Recommended</option>
					<option value="title">Name, A to Z</option>
					<option value="protein">Protein, highest</option>
					<option value="calories">Calories, lowest</option>
				</select>
			</label>
			<div class="flex items-end">
				<button type="submit" class="w-full rounded-md bg-emerald-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800 focus-visible:outline-offset-2">
					Show {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'}
				</button>
			</div>
		</div>

		<fieldset class="mt-5 border-t border-slate-200 pt-4">
			<legend class="mb-3 text-sm font-semibold text-slate-700">Dietary preferences</legend>
			<div class="flex flex-wrap gap-2">
				{#each dietaryOptions as option}
					<button type="button" aria-pressed={selectedDiet === option} class={`rounded-md border px-3 py-2 text-sm font-medium capitalize transition focus-visible:outline-offset-2 ${selectedDiet === option ? 'border-emerald-800 bg-emerald-900 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-emerald-700 hover:bg-emerald-50'}`} onclick={() => { selectedDiet = selectedDiet === option ? '' : option; applyFilters(); }}>
						{option}
					</button>
				{/each}
			</div>
		</fieldset>

		<fieldset class="mt-4">
			<legend class="mb-1 inline-flex items-center gap-2 text-sm font-semibold text-slate-700"><ShieldAlert size={16} /> Your allergy profile</legend>
			<p class="mb-3 text-xs text-slate-500">Selected allergens are saved in this browser and automatically excluded from results. Recipe tags may be incomplete and cannot guarantee allergy safety or prevent cross-contact.</p>
			<div class="flex flex-wrap gap-2">
				{#each allergenOptions as option}
					<label class={`inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium capitalize transition ${allergyProfile.allergens.includes(option) ? 'border-rose-800 bg-rose-800 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-rose-600 hover:bg-rose-50'}`}>
						<input type="checkbox" class="h-4 w-4 accent-rose-700" checked={allergyProfile.allergens.includes(option)} onchange={() => toggleProfileAllergen(option)} />
						{option}
					</label>
				{/each}
			</div>
		</fieldset>
	</form>

	{#if recipes.length === 0}
		<section class="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
			<h2 class="font-display text-2xl font-semibold text-emerald-950">No recipes found</h2>
			<p class="mt-2 text-slate-600">Try a different search or clear your filters.</p>
			<button type="button" class="mt-5 rounded-md border border-emerald-800 px-4 py-2 text-sm font-bold text-emerald-900 hover:bg-emerald-50" onclick={clearFilters}>Clear filters</button>
		</section>
	{:else}
		<div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
			{#each recipes as recipe (recipe.slug)}
				<RecipeCard {recipe} />
			{/each}
		</div>
	{/if}
</main>