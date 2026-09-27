<script lang="ts">
	import type { Nutrition } from '$lib/recipes/types';

	let { nutrition }: { nutrition?: Nutrition } = $props();
</script>

{#if nutrition}
	<div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
		{#if nutrition.calories !== undefined}
			<div class="rounded-xl bg-slate-100 p-3">
				<div class="text-xs uppercase tracking-wide text-slate-500">Calories</div>
				<div class="mt-1 text-lg font-semibold text-slate-900">{nutrition.calories}</div>
			</div>
		{/if}
		{#if nutrition.protein !== undefined}
			<div class="rounded-xl bg-slate-100 p-3">
				<div class="text-xs uppercase tracking-wide text-slate-500">Protein</div>
				<div class="mt-1 text-lg font-semibold text-slate-900">{nutrition.protein}g</div>
			</div>
		{/if}
		{#if nutrition.carbohydrates !== undefined}
			<div class="rounded-xl bg-slate-100 p-3">
				<div class="text-xs uppercase tracking-wide text-slate-500">Carbs</div>
				<div class="mt-1 text-lg font-semibold text-slate-900">{nutrition.carbohydrates}g</div>
			</div>
		{/if}
		{#if nutrition.fat !== undefined}
			<div class="rounded-xl bg-slate-100 p-3">
				<div class="text-xs uppercase tracking-wide text-slate-500">Fat</div>
				<div class="mt-1 text-lg font-semibold text-slate-900">{nutrition.fat}g</div>
			</div>
		{/if}
		{#if nutrition.fiber !== undefined}
			<div class="rounded-xl bg-slate-100 p-3">
				<div class="text-xs uppercase tracking-wide text-slate-500">Fiber</div>
				<div class="mt-1 text-lg font-semibold text-slate-900">{nutrition.fiber}g</div>
			</div>
		{/if}
	</div>
{:else}
	<p class="text-sm text-slate-500">Nutrition details are not available for this recipe.</p>
{/if}
