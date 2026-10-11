<script lang="ts">
	import { ArrowRight, Leaf } from 'lucide-svelte';
	import RecipeCard from '$lib/components/RecipeCard.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let recipes = $derived(data.recipes ?? []);
	let featured = $derived(recipes[0]);
</script>

<svelte:head>
	<title>Fibre-Bite | Recipes for everyday good eating</title>
	<meta name="description" content="Explore practical, nourishing recipes with adjustable servings and clear nutrition information." />
</svelte:head>

<main class="page-enter">
	<section class="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-14 pt-10 sm:px-8 md:grid-cols-[1fr_0.9fr] md:gap-14 md:pb-20 md:pt-16">
		<div class="max-w-xl">
			<p class="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-emerald-800">
				<Leaf size={16} />
				Everyday food, thoughtfully made
			</p>
			<h1 class="mt-5 font-display text-5xl font-semibold leading-[1.04] text-emerald-950 sm:text-6xl">
				Good food, made for <span class="text-emerald-700">real life.</span>
			</h1>
			<p class="mt-6 max-w-lg text-lg leading-8 text-slate-700">
				Find nourishing recipes with honest ingredients, useful nutrition, and servings that scale to your table.
			</p>
			<div class="mt-8 flex flex-wrap items-center gap-4">
				<a href="/recipes" class="inline-flex items-center gap-3 rounded-md bg-emerald-900 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800">
					Explore recipes
					<ArrowRight size={17} />
				</a>
				<p class="text-sm font-medium text-slate-600">{recipes.length} recipes ready to explore</p>
			</div>
			<div class="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-emerald-950/15 pt-5 text-sm font-semibold text-emerald-950">
				<span>Serving-size scaling</span>
				<span class="text-amber-600" aria-hidden="true">/</span>
				<span>Ingredient-first search</span>
			</div>
		</div>

		{#if featured}
			<a
				href={`/recipes/${featured.slug}`}
				aria-label={`Start with this: view ${featured.title} recipe`}
				class="group relative block rounded-lg focus-visible:outline-offset-8"
			>
				<img
					src={featured.image ?? 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80'}
					alt={featured.title}
					fetchpriority="high"
					class="aspect-4/3 w-full rounded-lg object-cover shadow-xl shadow-emerald-950/10 transition duration-300 group-hover:brightness-95"
				/>
				<span class="absolute -bottom-4 left-4 flex max-w-[calc(100%-2rem)] items-center justify-between gap-5 rounded-md border border-emerald-950/10 bg-white px-4 py-3 shadow-lg transition group-hover:-translate-y-1 sm:left-6">
					<span class="min-w-0">
						<span class="block text-xs font-bold uppercase tracking-widest text-emerald-700">Start with this</span>
						<span class="mt-1 block truncate font-display text-xl font-semibold text-emerald-950">{featured.title}</span>
					</span>
					<ArrowRight size={19} class="shrink-0 text-emerald-800" />
				</span>
			</a>
		{/if}
	</section>

	<section class="border-t border-emerald-950/10 bg-white/70 py-12 md:py-16" aria-labelledby="featured-heading">
		<div class="mx-auto max-w-7xl px-5 sm:px-8">
			<div class="mb-7 flex flex-wrap items-end justify-between gap-4">
				<div>
					<p class="text-sm font-bold uppercase tracking-[0.12em] text-emerald-700">From the kitchen</p>
					<h2 id="featured-heading" class="mt-2 font-display text-3xl font-semibold text-emerald-950">A good place to begin</h2>
				</div>
				<a href="/recipes" class="inline-flex items-center gap-2 text-sm font-bold text-emerald-800 hover:text-emerald-600">
					All recipes <ArrowRight size={16} />
				</a>
			</div>

			{#if recipes.length === 0}
				<p class="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-slate-600">No recipes are available yet.</p>
			{:else}
				<div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
					{#each recipes as recipe (recipe.slug)}
						<RecipeCard {recipe} />
					{/each}
				</div>
			{/if}
		</div>
	</section>
</main>