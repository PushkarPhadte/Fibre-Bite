<script lang="ts">
	import { onMount } from 'svelte';
	import { Bookmark, Sprout } from 'lucide-svelte';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { initializeFavorites } from '$lib/preferences.svelte';

	let { children } = $props();
	onMount(initializeFavorites);
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<a href="#main-content" class="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:not-sr-only focus:rounded-md focus:bg-white focus:px-4 focus:py-3 focus:font-semibold focus:text-emerald-950 focus:shadow-lg">Skip to content</a>
<header class="sticky top-0 z-40 border-b border-emerald-950/10 bg-[#f6f7f1]/90 backdrop-blur-md">
	<nav class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8" aria-label="Main navigation">
		<a href="/" class="flex shrink-0 items-center gap-2 whitespace-nowrap font-display text-2xl font-semibold text-emerald-950">
			<Sprout size={24} strokeWidth={1.8} />
			<span>Fibre-Bite</span>
		</a>
		<div class="flex items-center gap-2 sm:gap-5">
			<a href="/recipes" class="rounded-md px-3 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-950/5">Recipes</a>
			<a href="/favorites" class="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-950/5">
				<Bookmark size={16} />
				<span>Saved</span>
			</a>
		</div>
	</nav>
</header>
<div id="main-content" tabindex="-1">{@render children()}</div>
