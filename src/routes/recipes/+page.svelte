<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Search, ShieldAlert, SlidersHorizontal, X } from 'lucide-svelte';
	import { allergyProfile, toggleProfileAllergen } from '$lib/allergy-profile.svelte';
	import { getRecipeAllergens } from '$lib/recipe-swaps.svelte';
	import { meetsMicronutrientThreshold, micronutrientOptions, type MicronutrientFilterKey } from '$lib/recipes/micronutrients';
	import type { PageData } from './$types';
	import RecipeCard from '$lib/components/RecipeCard.svelte';
	import { allergenOptions, dietaryOptions, type Allergen, type DietaryTag } from '$lib/recipes/types';
	import { language, t } from '$lib/locale.svelte';
	import { getRecipeText } from '$lib/recipes/localized-content';

	const prepTimeOptions = [
		{ value: 5, minimum: 0, label: 'browse.prep5' },
		{ value: 15, minimum: 6, label: 'browse.prep15' },
		{ value: 30, minimum: 16, label: 'browse.prep30' },
		{ value: 45, minimum: 31, label: 'browse.prep45' },
		{ value: 60, minimum: 46, label: 'browse.prep60' },
		{ value: 90, minimum: 61, label: 'browse.prep90' }
	] as const;
	type PrepTimeLimit = (typeof prepTimeOptions)[number]['value'];
	const sortOptions = [
		{ value: 'title-asc', label: 'browse.sortNameAsc' },
		{ value: 'title-desc', label: 'browse.sortNameDesc' },
		{ value: 'prep-asc', label: 'browse.sortPrepAsc' },
		{ value: 'prep-desc', label: 'browse.sortPrepDesc' },
		{ value: 'protein-desc', label: 'browse.sortProteinDesc' },
		{ value: 'protein-asc', label: 'browse.sortProteinAsc' },
		{ value: 'calories-asc', label: 'browse.sortCaloriesAsc' },
		{ value: 'calories-desc', label: 'browse.sortCaloriesDesc' },
		{ value: 'fiber-desc', label: 'browse.sortFiberDesc' },
		{ value: 'carbohydrates-asc', label: 'browse.sortCarbsAsc' },
		{ value: 'sodium-asc', label: 'browse.sortSodiumAsc' },
		{ value: 'sugar-asc', label: 'browse.sortSugarAsc' }
	] as const;
	type RecipeSort = (typeof sortOptions)[number]['value'];

	let { data }: { data: PageData } = $props();
	let query = $state('');
	let selectedDiet = $state<DietaryTag | ''>('');
	let selectedPrepTime = $state<PrepTimeLimit | ''>('');
	let excludedAllergens = $state<Allergen[]>([]);
	let selectedSort = $state<RecipeSort | ''>('');
	let selectedMicronutrient = $state<MicronutrientFilterKey | ''>('');
	let micronutrientThreshold = $state<10 | 20>(10);
	let availableMicronutrients = $derived(micronutrientOptions.filter((option) =>
		(data.recipes ?? []).some((recipe) => recipe.nutrition?.micronutrients?.[option.key] !== undefined)
	));

	$effect(() => {
		query = page.url.searchParams.get('query') ?? '';
		selectedDiet = dietaryOptions.find((diet) => diet === page.url.searchParams.get('diet')) ?? '';
		const prepTime = Number(page.url.searchParams.get('prepTime'));
		selectedPrepTime = prepTimeOptions.find((option) => option.value === prepTime)?.value ?? '';
		excludedAllergens = allergenOptions.filter((allergen) => page.url.searchParams.getAll('exclude').includes(allergen));
		const sort = page.url.searchParams.get('sort');
		selectedSort = sortOptions.find((option) => option.value === sort)?.value ?? '';
		const micronutrient = page.url.searchParams.get('micronutrient');
		selectedMicronutrient = availableMicronutrients.find((option) => option.key === micronutrient)?.key ?? '';
		micronutrientThreshold = page.url.searchParams.get('microThreshold') === '20' ? 20 : 10;
	});

	let recipes = $derived.by(() => {
		const search = query.trim().toLocaleLowerCase();
		const activeAllergens = [...new Set([...excludedAllergens, ...allergyProfile.allergens])];
		const prepTimeRange = prepTimeOptions.find((option) => option.value === selectedPrepTime);
		const filtered = (data.recipes ?? []).filter((recipe) =>
			(!search || getRecipeText(recipe, language.current).title.toLocaleLowerCase().includes(search) || recipe.title.toLocaleLowerCase().includes(search) ||
				recipe.ingredients.some((ingredient) => ingredient.name.toLowerCase().includes(search))) &&
			(!selectedDiet || recipe.dietaryTags.includes(selectedDiet)) &&
			(!prepTimeRange || (recipe.prepTimeMinutes !== undefined && recipe.prepTimeMinutes >= prepTimeRange.minimum && recipe.prepTimeMinutes <= prepTimeRange.value)) &&
			(!selectedMicronutrient || meetsMicronutrientThreshold(recipe.nutrition?.micronutrients, selectedMicronutrient, micronutrientThreshold)) &&
			!activeAllergens.some((allergen) => getRecipeAllergens(recipe).includes(allergen))
		);

		if (selectedSort === 'title-asc') filtered.sort((a, b) => getRecipeText(a, language.current).title.localeCompare(getRecipeText(b, language.current).title));
		if (selectedSort === 'title-desc') filtered.sort((a, b) => getRecipeText(b, language.current).title.localeCompare(getRecipeText(a, language.current).title));
		if (selectedSort === 'prep-asc') filtered.sort((a, b) => compareOptionalNumbers(a.prepTimeMinutes, b.prepTimeMinutes));
		if (selectedSort === 'prep-desc') filtered.sort((a, b) => compareOptionalNumbers(a.prepTimeMinutes, b.prepTimeMinutes, 'desc'));
		if (selectedSort === 'protein-desc') filtered.sort((a, b) => compareOptionalNumbers(a.nutrition?.protein, b.nutrition?.protein, 'desc'));
		if (selectedSort === 'protein-asc') filtered.sort((a, b) => compareOptionalNumbers(a.nutrition?.protein, b.nutrition?.protein));
		if (selectedSort === 'calories-asc') filtered.sort((a, b) => compareOptionalNumbers(a.nutrition?.calories, b.nutrition?.calories));
		if (selectedSort === 'calories-desc') filtered.sort((a, b) => compareOptionalNumbers(a.nutrition?.calories, b.nutrition?.calories, 'desc'));
		if (selectedSort === 'fiber-desc') filtered.sort((a, b) => compareOptionalNumbers(a.nutrition?.fiber, b.nutrition?.fiber, 'desc'));
		if (selectedSort === 'carbohydrates-asc') filtered.sort((a, b) => compareOptionalNumbers(a.nutrition?.carbohydrates, b.nutrition?.carbohydrates));
		if (selectedSort === 'sodium-asc') filtered.sort((a, b) => compareOptionalNumbers(a.nutrition?.sodium, b.nutrition?.sodium));
		if (selectedSort === 'sugar-asc') filtered.sort((a, b) => compareOptionalNumbers(a.nutrition?.sugar, b.nutrition?.sugar));
		return filtered;
	});

	function compareOptionalNumbers(first: number | undefined, second: number | undefined, direction: 'asc' | 'desc' = 'asc') {
		if (first === undefined) return second === undefined ? 0 : 1;
		if (second === undefined) return -1;
		return direction === 'asc' ? first - second : second - first;
	}

	let activeCount = $derived(Number(Boolean(query.trim())) + Number(Boolean(selectedDiet)) + Number(Boolean(selectedPrepTime)) + excludedAllergens.length + Number(Boolean(selectedSort)) + Number(Boolean(selectedMicronutrient)));

	function toggleExcluded(allergen: Allergen) {
		excludedAllergens = excludedAllergens.includes(allergen)
			? excludedAllergens.filter((item) => item !== allergen)
			: [...excludedAllergens, allergen];
	}

	function applyFilters() {
		const params = new URLSearchParams();
		if (query.trim()) params.set('query', query.trim());
		if (selectedDiet) params.set('diet', selectedDiet);
		if (selectedPrepTime) params.set('prepTime', String(selectedPrepTime));
		for (const allergen of excludedAllergens) params.append('exclude', allergen);
		if (selectedSort) params.set('sort', selectedSort);
		if (selectedMicronutrient) {
			params.set('micronutrient', selectedMicronutrient);
			params.set('microThreshold', String(micronutrientThreshold));
		}
		const search = params.toString();
		void goto(search ? `/recipes?${search}` : '/recipes', { keepFocus: true, noScroll: true });
	}

	function clearFilters() {
		query = '';
		selectedDiet = '';
		selectedPrepTime = '';
		excludedAllergens = [];
		selectedSort = '';
		selectedMicronutrient = '';
		micronutrientThreshold = 10;
		void goto('/recipes', { keepFocus: true, noScroll: true });
	}
</script>

<svelte:head>
	<title>{t('browse.title')} | Fibre-Bite</title>
	<meta name="description" content={t('meta.recipesDescription')} />
</svelte:head>

<main class="page-enter mx-auto max-w-7xl space-y-8 px-5 py-8 sm:px-8 md:py-12">
	<header class="flex flex-wrap items-end justify-between gap-4 border-b border-emerald-950/15 pb-5">
		<div>
			<p class="text-sm font-bold uppercase tracking-[0.12em] text-emerald-700">{t('browse.eyebrow')}</p>
			<h1 class="mt-2 font-display text-4xl font-semibold text-emerald-950">{t('browse.title')}</h1>
		</div>
		<p class="text-sm font-semibold text-slate-600" aria-live="polite">{recipes.length} {recipes.length === 1 ? t('browse.recipe') : t('browse.recipes')}</p>
	</header>

	<form
		class="rounded-lg border border-emerald-950/10 bg-white p-5 shadow-sm sm:p-6"
		onsubmit={(event) => { event.preventDefault(); applyFilters(); }}
	>
		<div class="flex flex-wrap items-center justify-between gap-3">
			<h2 class="inline-flex items-center gap-2 text-base font-bold text-emerald-950">
				<SlidersHorizontal size={18} />
				{t('browse.refine')}
			</h2>
			{#if activeCount > 0}
				<button type="button" class="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800 hover:text-emerald-600" onclick={clearFilters}>
					<X size={15} /> {t('browse.clearAll')}
				</button>
			{/if}
		</div>

		<div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<label class="space-y-1.5 text-sm font-semibold text-slate-700">
				{t('browse.search')}
				<span class="relative block">
					<Search size={17} class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
					<input bind:value={query} class="w-full rounded-md border border-slate-300 bg-white py-2.5 pl-10 pr-3 font-normal outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100" placeholder={t('browse.searchPlaceholder')} />
				</span>
			</label>
			<label class="space-y-1.5 text-sm font-semibold text-slate-700">
				{t('browse.diet')}
				<select bind:value={selectedDiet} class="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100">
					<option value="">{t('browse.anyDiet')}</option>
					{#each dietaryOptions as option}
						<option value={option}>{t(`tag.${option}`)}</option>
					{/each}
				</select>
			</label>
			<label class="space-y-1.5 text-sm font-semibold text-slate-700">
				{t('browse.prepTime')}
				<select bind:value={selectedPrepTime} class="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100">
					<option value="">{t('browse.anyPrep')}</option>
					{#each prepTimeOptions as option}
						<option value={option.value}>{t(option.label)}</option>
					{/each}
				</select>
			</label>
			<label class="space-y-1.5 text-sm font-semibold text-slate-700">
				{t('browse.sortBy')}
				<select bind:value={selectedSort} class="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100">
					<option value="">{t('browse.recommended')}</option>
					{#each sortOptions as option}
						<option value={option.value}>{t(option.label)}</option>
					{/each}
				</select>
			</label>
			<label class="space-y-1.5 text-sm font-semibold text-slate-700">
				{t('browse.micronutrient')}
				<select bind:value={selectedMicronutrient} class="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100">
					<option value="">{t('browse.anyMicronutrient')}</option>
					{#each availableMicronutrients as option}
						<option value={option.key}>{t(`micronutrient.${option.key}`)}</option>
					{/each}
				</select>
			</label>
			<label class="space-y-1.5 text-sm font-semibold text-slate-700">
				{t('browse.minimumDailyValue')}
				<select bind:value={micronutrientThreshold} class="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100">
					<option value={10}>{t('browse.atLeast10')}</option>
					<option value={20}>{t('browse.atLeast20')}</option>
				</select>
			</label>
			<div class="flex items-end">
				<button type="submit" class="w-full rounded-md bg-emerald-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800 focus-visible:outline-offset-2">
					{t('browse.show')} {recipes.length} {recipes.length === 1 ? t('browse.recipe') : t('browse.recipes')}
				</button>
			</div>
		</div>

		<fieldset class="mt-5 border-t border-slate-200 pt-4">
			<legend class="mb-3 text-sm font-semibold text-slate-700">{t('browse.dietaryPreferences')}</legend>
			<div class="flex flex-wrap gap-2">
				{#each dietaryOptions as option}
					<button type="button" aria-pressed={selectedDiet === option} class={`rounded-md border px-3 py-2 text-sm font-medium capitalize transition focus-visible:outline-offset-2 ${selectedDiet === option ? 'border-emerald-800 bg-emerald-900 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-emerald-700 hover:bg-emerald-50'}`} onclick={() => { selectedDiet = selectedDiet === option ? '' : option; applyFilters(); }}>
						{t(`tag.${option}`)}
					</button>
				{/each}
			</div>
		</fieldset>

		<fieldset class="mt-4">
			<legend class="mb-1 inline-flex items-center gap-2 text-sm font-semibold text-slate-700"><ShieldAlert size={16} /> {t('browse.allergyProfile')}</legend>
			<p class="mb-3 text-xs text-slate-500">{t('browse.allergyNote')}</p>
			<div class="flex flex-wrap gap-2">
				{#each allergenOptions as option}
					<label class={`inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium capitalize transition ${allergyProfile.allergens.includes(option) ? 'border-rose-800 bg-rose-800 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-rose-600 hover:bg-rose-50'}`}>
						<input type="checkbox" class="h-4 w-4 accent-rose-700" checked={allergyProfile.allergens.includes(option)} onchange={() => toggleProfileAllergen(option)} />
						{t(`allergen.${option}`)}
					</label>
				{/each}
			</div>
		</fieldset>
	</form>

	{#if recipes.length === 0}
		<section class="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
			<h2 class="font-display text-2xl font-semibold text-emerald-950">{t('browse.noResults')}</h2>
			<p class="mt-2 text-slate-600">{t('browse.tryAgain')}</p>
			<button type="button" class="mt-5 rounded-md border border-emerald-800 px-4 py-2 text-sm font-bold text-emerald-900 hover:bg-emerald-50" onclick={clearFilters}>{t('browse.clearFilters')}</button>
		</section>
	{:else}
		<div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
			{#each recipes as recipe (recipe.slug)}
				<RecipeCard {recipe} />
			{/each}
		</div>
	{/if}
</main>