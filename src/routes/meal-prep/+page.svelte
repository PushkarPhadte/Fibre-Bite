<script lang="ts">
	import { clearMealPrep, mealPrep, toggleMealPrepRecipe, toggleMealPrepStep } from '$lib/meal-prep.svelte';
	import { Check, ClipboardList, CookingPot, ShoppingBasket, Trash2 } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let plannedRecipes = $derived(data.recipes.filter((recipe) => mealPrep.recipeIds.includes(recipe.id)));
	let tasks = $derived(plannedRecipes.flatMap((recipe) => recipe.instructions.map((instruction) => ({
		id: `${recipe.id}:${instruction.number}`,
		recipeId: recipe.id,
		recipeTitle: recipe.title,
		recipeSlug: recipe.slug,
		number: instruction.number,
		text: instruction.text
	}))));
	let completedCount = $derived(tasks.filter((task) => mealPrep.completedStepIds.includes(task.id)).length);
	let progress = $derived(tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0);
</script>

<svelte:head>
	<title>Meal prep workflow | Fibre-Bite</title>
	<meta name="description" content="Plan recipes together and work through one consolidated meal-prep checklist." />
</svelte:head>

<main class="mx-auto max-w-7xl space-y-8 px-5 py-8 sm:px-8 md:py-12">
	<header class="flex flex-wrap items-end justify-between gap-4 border-b border-emerald-950/15 pb-5">
		<div>
			<p class="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-emerald-700"><CookingPot size={16} /> Plan and prep</p>
			<h1 class="mt-2 font-display text-4xl font-semibold text-emerald-950">Meal prep workflow</h1>
			<p class="mt-2 max-w-2xl text-slate-600">Combine recipe instructions into one checklist and track your progress as you prep.</p>
		</div>
		{#if plannedRecipes.length > 0}
			<div class="flex flex-wrap items-center gap-3">
				<a href="/grocery-list" class="inline-flex items-center gap-2 rounded-md border border-emerald-900 px-4 py-2.5 text-sm font-bold text-emerald-900 transition hover:bg-emerald-50"><ShoppingBasket size={16} /> Shopping list</a>
				<button type="button" class="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-700" onclick={clearMealPrep}><Trash2 size={16} /> Clear plan</button>
			</div>
		{/if}
	</header>

	{#if plannedRecipes.length === 0}
		<section class="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
			<div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-800"><ClipboardList size={26} /></div>
			<h2 class="mt-4 font-display text-2xl font-semibold text-emerald-950">Start a prep plan</h2>
			<p class="mx-auto mt-2 max-w-lg text-slate-600">Add recipes to your plan from recipe cards or recipe pages. Their ingredients and numbered steps will be ready together here.</p>
			<a href="/recipes" class="mt-5 inline-flex items-center gap-2 rounded-md bg-emerald-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800">Browse recipes</a>
		</section>
	{:else}
		<div class="grid gap-8 lg:grid-cols-[minmax(15rem,0.8fr)_minmax(0,1.6fr)]">
			<aside class="space-y-4">
				<section class="rounded-lg border border-slate-200 bg-white p-5">
					<div class="flex items-center justify-between gap-3">
						<h2 class="text-lg font-bold text-slate-900">Recipes in this plan</h2>
						<span class="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">{plannedRecipes.length}</span>
					</div>
					<ul class="mt-4 divide-y divide-slate-200">
						{#each plannedRecipes as recipe (recipe.id)}
							<li class="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
								<a href={`/recipes/${recipe.slug}`} class="min-w-0">
									<span class="block truncate text-sm font-semibold text-slate-800">{recipe.title}</span>
									<span class="block text-xs text-slate-500">{recipe.instructions.length} prep steps</span>
								</a>
								<button type="button" aria-label={`Remove ${recipe.title} from meal prep plan`} class="rounded-md p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700" onclick={() => toggleMealPrepRecipe(recipe.id)}><Trash2 size={16} /></button>
							</li>
						{/each}
					</ul>
					<a href="/recipes" class="mt-4 inline-flex text-sm font-semibold text-emerald-800 hover:text-emerald-700">Add more recipes</a>
				</section>

				<section class="rounded-lg border border-emerald-950/10 bg-emerald-950 p-5 text-white">
					<div class="flex items-center justify-between gap-3">
						<h2 class="text-sm font-bold uppercase tracking-wide text-emerald-100">Prep progress</h2>
						<span class="text-sm font-bold">{completedCount}/{tasks.length}</span>
					</div>
					<div class="mt-3 h-2 overflow-hidden rounded-full bg-white/20" role="progressbar" aria-label="Meal prep steps completed" aria-valuemin="0" aria-valuemax={tasks.length} aria-valuenow={completedCount}>
						<div class="h-full rounded-full bg-lime-300 transition-[width]" style={`width: ${progress}%`}></div>
					</div>
					<p class="mt-2 text-sm text-emerald-100">{progress}% complete</p>
				</section>
			</aside>

			<section aria-labelledby="checklist-title">
				<div class="mb-4 flex items-end justify-between gap-3">
					<div>
						<p class="text-sm font-bold uppercase tracking-[0.12em] text-emerald-700">Consolidated workflow</p>
						<h2 id="checklist-title" class="mt-1 font-display text-2xl font-semibold text-emerald-950">Prep checklist</h2>
					</div>
					{#if completedCount === tasks.length}
						<span class="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800"><Check size={16} /> All done</span>
					{/if}
				</div>
				<ol class="space-y-5">
					{#each plannedRecipes as recipe (recipe.id)}
						<li class="overflow-hidden rounded-lg border border-slate-200 bg-white">
							<div class="border-b border-slate-200 bg-slate-50 px-4 py-3">
								<a href={`/recipes/${recipe.slug}`} class="font-bold text-slate-900 hover:text-emerald-800">{recipe.title}</a>
							</div>
							<ul class="divide-y divide-slate-100 px-4">
								{#each recipe.instructions as instruction (instruction.number)}
									{@const taskId = `${recipe.id}:${instruction.number}`}
									<li class="flex items-start gap-3 py-4">
										<input id={taskId} type="checkbox" checked={mealPrep.completedStepIds.includes(taskId)} class="mt-1 h-4 w-4 rounded border-slate-300 accent-emerald-800 focus:ring-emerald-700" onchange={() => toggleMealPrepStep(taskId)} />
										<label for={taskId} class={`flex-1 cursor-pointer text-sm leading-6 ${mealPrep.completedStepIds.includes(taskId) ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
											<span class="mr-1 font-bold text-emerald-800">{instruction.number}.</span>{instruction.text}
										</label>
									</li>
								{/each}
							</ul>
						</li>
					{/each}
				</ol>
			</section>
		</div>
	{/if}
</main>
