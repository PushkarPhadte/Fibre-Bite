<script lang="ts">
	import { onMount } from 'svelte';
	import { Bookmark, BookOpen, CookingPot, Recycle, ShoppingBasket, Sprout } from 'lucide-svelte';
	import './layout.css';
	import { initializeAllergyProfile } from '$lib/allergy-profile.svelte';
	import favicon from '$lib/assets/favicon.png';
	import { initializeGroceryList } from '$lib/grocery-list.svelte';
	import { initializeMealPrep } from '$lib/meal-prep.svelte';
	import { initializePantry } from '$lib/pantry.svelte';
	import { initializeFavorites } from '$lib/preferences.svelte';
	import { initializeRecipeSwaps } from '$lib/recipe-swaps.svelte';
	import { initializeRecipeServings } from '$lib/recipe-servings.svelte';

	let { children } = $props();
	onMount(() => {
		initializeAllergyProfile();
		initializeFavorites();
		initializeGroceryList();
		initializeMealPrep();
		initializePantry();
		initializeRecipeSwaps();
		initializeRecipeServings();
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<a href="#main-content" class="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:not-sr-only focus:rounded-md focus:bg-white focus:px-4 focus:py-3 focus:font-semibold focus:text-emerald-950 focus:shadow-lg">Skip to content</a>
<header class="sticky top-0 z-40 border-b border-emerald-950/10 bg-[#f6f7f1]/90 backdrop-blur-md">
	<nav class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-5 py-3 sm:flex-nowrap sm:gap-4 sm:px-8" aria-label="Main navigation">
		<a href="/" class="flex shrink-0 items-center gap-2 whitespace-nowrap font-display text-2xl font-semibold text-emerald-950">
			<Sprout size={24} strokeWidth={1.8} />
			<span>Fibre-Bite</span>
		</a>
		<div class="flex w-full items-center justify-between gap-1 sm:w-auto sm:gap-5">
			<a href="/recipes" aria-label="Recipes" title="Recipes" class="inline-flex h-10 min-w-10 items-center justify-center gap-2 rounded-md px-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-950/5 sm:px-3">
				<BookOpen size={16} />
				<span class="sr-only sm:not-sr-only">Recipes</span>
			</a>
			<a href="/grocery-list" aria-label="Groceries" title="Groceries" class="inline-flex h-10 min-w-10 items-center justify-center gap-2 rounded-md px-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-950/5 sm:px-3">
				<ShoppingBasket size={16} />
				<span class="sr-only sm:not-sr-only">Groceries</span>
			</a>
			<a href="/meal-prep" aria-label="Meal prep" title="Meal prep" class="inline-flex h-10 min-w-10 items-center justify-center gap-2 rounded-md px-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-950/5 sm:px-3">
				<CookingPot size={16} />
				<span class="sr-only sm:not-sr-only">Meal prep</span>
			</a>
			<a href="/zero-waste" aria-label="Zero-waste recipe finder" title="Zero-waste recipe finder" class="inline-flex h-10 min-w-10 items-center justify-center gap-2 rounded-md px-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-950/5 sm:px-3">
				<Recycle size={16} />
				<span class="sr-only sm:not-sr-only">Waste</span>
			</a>
			<a href="/favorites" aria-label="Saved recipes" title="Saved recipes" class="inline-flex h-10 min-w-10 items-center justify-center gap-2 rounded-md px-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-950/5 sm:px-3">
				<Bookmark size={16} />
				<span class="sr-only sm:not-sr-only">Saved</span>
			</a>
		</div>
	</nav>
</header>
<div id="main-content" tabindex="-1">{@render children()}</div>
