<script lang="ts">
	let {
		servings,
		min = 1,
		max = 12,
		onChange
	}: {
		servings: number;
		min?: number;
		max?: number;
		onChange: (value: number) => void;
	} = $props();

</script>

<div class="w-full min-w-40 rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm sm:w-52">
	<div class="mb-1 flex items-center justify-between gap-3">
		<label for="serving-size" class="text-xs font-semibold text-slate-600">Servings</label>
		<output for="serving-size" class="text-sm font-bold tabular-nums text-emerald-900" aria-live="polite">{servings}</output>
	</div>
	<input
		id="serving-size"
		type="range"
		min={min}
		max={max}
		step="1"
		value={servings}
		aria-label="Serving size"
		class="h-2 w-full cursor-pointer accent-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800"
		oninput={(event) => onChange(Number(event.currentTarget.value))}
	/>
</div>
