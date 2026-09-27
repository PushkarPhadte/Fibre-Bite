<script lang="ts">
	import RecipeCard from '$lib/components/RecipeCard.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let recipes = $derived(data.recipes ?? []);
</script>

<svelte:head>
	<title>Fibre-Bite | Healthy recipes</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
	<header class="mx-auto max-w-6xl px-6 py-10">
		<nav class="flex items-center justify-between gap-4">
			<div>
				<p class="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Fibre-Bite</p>
				<h1 class="mt-2 text-4xl font-black tracking-tight text-slate-900">Healthy recipes, made simple</h1>
			</div>
			<div class="flex items-center gap-3">
				<a href="/recipes" class="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700">Browse recipes</a>
				<a href="/favorites" class="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400">Saved</a>
			</div>
		</nav>
	</header>

	<main class="mx-auto max-w-6xl space-y-10 px-6 pb-16">
		<section class="rounded-3xl bg-slate-900 p-8 text-white shadow-xl">
			<div class="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
				<div>
					<p class="text-sm font-medium uppercase tracking-[0.2em] text-emerald-300">Fresh picks</p>
					<h2 class="mt-3 text-3xl font-bold md:text-4xl">Fuel your routine with nourishing meals.</h2>
					<p class="mt-4 max-w-xl text-lg text-slate-300">Explore protein-rich dinners, high-fiber breakfasts, and balanced dishes designed for everyday wellbeing.</p>
				</div>
				<div class="rounded-2xl bg-white/10 p-5 backdrop-blur-sm">
					<div class="space-y-3 text-sm text-slate-200">
						<p class="text-emerald-300">Popular filters</p>
						<ul class="space-y-2">
							<li>• High-protein</li>
							<li>• Vegetarian</li>
							<li>• Gluten-free</li>
						</ul>
					</div>
				</div>
			</div>
		</section>

		<section>
			<div class="mb-6 flex items-end justify-between gap-3">
				<div>
					<p class="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Featured recipes</p>
					<h3 class="mt-2 text-2xl font-bold text-slate-900">A few favourites for this week</h3>
				</div>
				<a href="/recipes" class="text-sm font-semibold text-emerald-700">View all</a>
			</div>

			{#if recipes.length === 0}
				<p class="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-slate-600">No recipes are available yet.</p>
			{:else}
				<div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
					{#each recipes as recipe (recipe.slug)}
						<RecipeCard {recipe} />
					{/each}
				</div>
			{/if}
		</section>
	</main>
</div>
