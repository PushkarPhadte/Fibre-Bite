<script lang="ts">
	import type { DietaryTag, Allergen } from '$lib/recipes/types';

	let {
		selectedDiet,
		selectedAllergen,
		dietOptions,
		allergenOptions,
		onApply
	}: {
		selectedDiet: string;
		selectedAllergen: string;
		dietOptions: DietaryTag[];
		allergenOptions: Allergen[];
		onApply: () => void;
	} = $props();
</script>

<div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
	<div class="flex flex-wrap gap-2">
		{#each dietOptions as option}
			<button
				type="button"
				class={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${selectedDiet === option ? 'border-emerald-500 bg-emerald-100 text-emerald-700' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`}
				onclick={() => {
					selectedDiet = selectedDiet === option ? '' : option;
					onApply();
				}}
			>
				{option}
			</button>
		{/each}
	</div>

	<div class="mt-4 flex flex-wrap gap-2">
		{#each allergenOptions as option}
			<button
				type="button"
				class={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${selectedAllergen === option ? 'border-amber-500 bg-amber-100 text-amber-700' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`}
				onclick={() => {
					selectedAllergen = selectedAllergen === option ? '' : option;
					onApply();
				}}
			>
				Avoid {option}
			</button>
		{/each}
	</div>
</div>
