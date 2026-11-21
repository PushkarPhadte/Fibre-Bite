<script lang="ts">
	import { clearGroceryList, groceryList, toggleGroceryList } from '$lib/grocery-list.svelte';
	import { getRecipeSwap } from '$lib/recipe-swaps.svelte';
	import { getRecipeServings } from '$lib/recipe-servings.svelte';
	import { applyIngredientSwap } from '$lib/smart-swaps';
	import type { Recipe } from '$lib/recipes/types';
	import { formatAmount } from '$lib/recipes/units';
	import type { PageData } from './$types';
	import { ArrowRight, ListX, ShoppingBasket, Trash2 } from 'lucide-svelte';
	import { t, language } from '$lib/locale.svelte';
	import { getRecipeText } from '$lib/recipes/localized-content';

	let { data }: { data: PageData } = $props();
	let groceryRecipes = $derived(data.recipes.filter((recipe) => groceryList.recipeIds.includes(recipe.id)));

	let smartList = $derived.by(() => {
		const entries = new Map<string, { name: string; unit: string; amount: number; sources: Set<string> }>();

		for (const recipe of groceryRecipes) {
			const servingMultiplier = (getRecipeServings(recipe.id) ?? recipe.baseServings) / recipe.baseServings;
			for (const ingredient of recipe.ingredients) {
				const swap = getRecipeSwap(recipe.id, ingredient.name);
				const effectiveIngredient = swap ? applyIngredientSwap(ingredient, swap) : ingredient;
				const key = `${effectiveIngredient.name.trim().toLowerCase()}::${effectiveIngredient.unit.trim().toLowerCase()}`;
				const existing = entries.get(key) ?? {
					name: effectiveIngredient.name,
					unit: effectiveIngredient.unit,
					amount: 0,
					sources: new Set<string>()
				};

				existing.amount += effectiveIngredient.baseAmount * servingMultiplier;
					existing.sources.add(getRecipeText(recipe, language.current).title);
				entries.set(key, existing);
			}
		}

		return Array.from(entries.entries())
			.map(([key, entry]) => ({
				key,
				name: entry.name,
				unit: entry.unit,
				amount: entry.amount,
				sources: Array.from(entry.sources).sort((a, b) => a.localeCompare(b))
			}))
			.sort((a, b) => a.name.localeCompare(b.name));
	});

	function ingredientLabel(amount: number, unit: string, name: string) {
		if (amount === 0) {
			return `${name} — ${t('grocery.toTaste')}`;
		}
		return `${formatAmount(amount)} ${unit} ${name}`.trim();
	}
</script>

<svelte:head>
	<title>{t('grocery.title')} | Fibre-Bite</title>
	<meta name="description" content="Combine saved recipes into one smart grocery list." />
</svelte:head>

<div class="mx-auto max-w-6xl px-6 py-10">
	<div class="mb-8 rounded-lg bg-emerald-950 p-8 text-white shadow-lg">
		<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
			<div>
				<p class="text-sm font-bold uppercase tracking-[0.12em] text-emerald-200">{t('grocery.eyebrow')}</p>
				<h1 class="mt-2 font-display text-3xl font-semibold">{t('grocery.title')}</h1>
			</div>
			{#if groceryRecipes.length > 0}
				<button type="button" class="inline-flex items-center gap-2 rounded-md border border-white/25 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10" onclick={clearGroceryList}>
					<Trash2 size={16} />
					{t('grocery.clear')}
				</button>
			{/if}
		</div>
	</div>

	{#if groceryRecipes.length === 0}
		<div class="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
			<div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
				<ShoppingBasket size={26} />
			</div>
			<p class="text-lg font-semibold text-slate-800">{t('grocery.emptyTitle')}</p>
			<p class="mt-2 text-sm">{t('grocery.emptyNote')}</p>
			<a href="/recipes" class="mt-5 inline-flex items-center gap-2 rounded-md bg-emerald-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800">
				{t('home.explore')}
				<ArrowRight size={16} />
			</a>
		</div>
	{:else}
		<div class="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
			<aside class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
				<div class="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
					<h2 class="text-lg font-bold text-slate-900">{t('grocery.included')}</h2>
					<span class="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-800">{groceryRecipes.length}</span>
				</div>
				<ul class="mt-4 space-y-3">
					{#each groceryRecipes as recipe (recipe.id)}
						<li class="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
							<a href={`/recipes/${recipe.slug}`} class="min-w-0 text-left">
								<span class="block truncate text-sm font-semibold text-slate-800">{getRecipeText(recipe, language.current).title}</span>
								<span class="block text-xs text-slate-500">{recipe.ingredients.length} {t('grocery.ingredients')}</span>
							</a>
							<button type="button" class="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-700" onclick={() => toggleGroceryList(recipe.id)}>
								<ListX size={14} />
								{t('grocery.remove')}
							</button>
						</li>
					{/each}
				</ul>
			</aside>

			<section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
				<div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
					<h2 class="text-lg font-bold text-slate-900">{t('grocery.combined')}</h2>
					<span class="text-sm font-semibold text-slate-600">{smartList.length} {smartList.length === 1 ? t('grocery.uniqueItem') : t('grocery.uniqueItems')}</span>
				</div>

				<ul class="mt-5 space-y-3">
					{#each smartList as item}
						<li class="rounded-xl border border-slate-200 bg-slate-50 p-4">
							<div class="flex items-start justify-between gap-3">
								<p class="text-base font-semibold text-slate-900">{ingredientLabel(item.amount, item.unit, item.name)}</p>
							</div>
							<p class="mt-2 text-xs font-medium uppercase tracking-wide text-slate-500">{t('grocery.from')} {item.sources.join(', ')}</p>
						</li>
					{/each}
				</ul>
			</section>
		</div>
	{/if}
</div>
