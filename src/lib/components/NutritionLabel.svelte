<script lang="ts">
	import type { Nutrition } from '$lib/recipes/types';
	import { micronutrientOptions } from '$lib/recipes/micronutrients';

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
	{#if nutrition.micronutrients}
		<section class="mt-5 border-t border-slate-200 pt-4">
			<h3 class="text-sm font-bold text-slate-800">Micronutrients per serving</h3>
			<p class="mt-1 text-xs leading-5 text-slate-500">Approximate food-composition estimates. Percent Daily Values use standard adult references, not individualized targets. Values vary with ingredients and preparation; this information is not medical advice.</p>
			<dl class="mt-3 grid grid-cols-2 gap-x-5 gap-y-2 sm:grid-cols-3">
				{#each micronutrientOptions as option}
					{@const amount = nutrition.micronutrients[option.key]}
					{#if amount !== undefined}
						<div class="border-b border-slate-100 py-2">
							<dt class="text-xs text-slate-500">{option.label}</dt>
							<dd class="mt-0.5 text-sm font-semibold text-slate-900">{amount} {option.unit} <span class="font-normal text-slate-500">({Math.round((amount / option.dailyValue) * 100)}% DV)</span></dd>
						</div>
					{/if}
				{/each}
			</dl>
			{#if nutrition.micronutrientEstimateSource}
				<p class="mt-3 text-xs leading-5 text-slate-500">Source and estimate basis: {nutrition.micronutrientEstimateSource}</p>
			{/if}
		</section>
	{/if}
{:else}
	<p class="text-sm text-slate-500">Nutrition details are not available for this recipe.</p>
{/if}
