<script lang="ts">
	import type { Nutrition } from '$lib/recipes/types';
	import { micronutrientOptions } from '$lib/recipes/micronutrients';
	import { t } from '$lib/locale.svelte';

	let { nutrition }: { nutrition?: Nutrition } = $props();
</script>

{#if nutrition}
	<div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
		{#if nutrition.calories !== undefined}
			<div class="rounded-xl bg-slate-100 p-3">
				<div class="text-xs uppercase tracking-wide text-slate-500">{t('nutrition.calories')}</div>
				<div class="mt-1 text-lg font-semibold text-slate-900">{nutrition.calories}</div>
			</div>
		{/if}
		{#if nutrition.protein !== undefined}
			<div class="rounded-xl bg-slate-100 p-3">
				<div class="text-xs uppercase tracking-wide text-slate-500">{t('nutrition.protein')}</div>
				<div class="mt-1 text-lg font-semibold text-slate-900">{nutrition.protein}g</div>
			</div>
		{/if}
		{#if nutrition.carbohydrates !== undefined}
			<div class="rounded-xl bg-slate-100 p-3">
				<div class="text-xs uppercase tracking-wide text-slate-500">{t('nutrition.carbs')}</div>
				<div class="mt-1 text-lg font-semibold text-slate-900">{nutrition.carbohydrates}g</div>
			</div>
		{/if}
		{#if nutrition.fat !== undefined}
			<div class="rounded-xl bg-slate-100 p-3">
				<div class="text-xs uppercase tracking-wide text-slate-500">{t('nutrition.fat')}</div>
				<div class="mt-1 text-lg font-semibold text-slate-900">{nutrition.fat}g</div>
			</div>
		{/if}
		{#if nutrition.fiber !== undefined}
			<div class="rounded-xl bg-slate-100 p-3">
				<div class="text-xs uppercase tracking-wide text-slate-500">{t('nutrition.fiber')}</div>
				<div class="mt-1 text-lg font-semibold text-slate-900">{nutrition.fiber}g</div>
			</div>
		{/if}
	</div>
	{#if nutrition.micronutrients}
		<section class="mt-5 border-t border-slate-200 pt-4">
			<h3 class="text-sm font-bold text-slate-800">{t('nutrition.perServing')}</h3>
			<p class="mt-1 text-xs leading-5 text-slate-500">{t('nutrition.estimates')}</p>
			<dl class="mt-3 grid grid-cols-2 gap-x-5 gap-y-2 sm:grid-cols-3">
				{#each micronutrientOptions as option}
					{@const amount = nutrition.micronutrients[option.key]}
					{#if amount !== undefined}
						<div class="border-b border-slate-100 py-2">
							<dt class="text-xs text-slate-500">{option.label}</dt>
							<dd class="mt-0.5 text-sm font-semibold text-slate-900">{amount} {option.unit} <span class="font-normal text-slate-500">({Math.round((amount / option.dailyValue) * 100)}{t('nutrition.dailyValue')})</span></dd>
						</div>
					{/if}
				{/each}
			</dl>
			{#if nutrition.micronutrientEstimateSource}
				<p class="mt-3 text-xs leading-5 text-slate-500">{t('nutrition.source')} {nutrition.micronutrientEstimateSource}</p>
			{/if}
		</section>
	{/if}
{:else}
	<p class="text-sm text-slate-500">{t('nutrition.unavailable')}</p>
{/if}
