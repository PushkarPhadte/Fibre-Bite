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

	function decrement() {
		onChange(Math.max(min, servings - 1));
	}

	function increment() {
		onChange(Math.min(max, servings + 1));
	}
</script>

<div class="flex items-center gap-3 rounded-full border border-slate-200 bg-white p-1 shadow-sm">
	<button type="button" class="h-9 w-9 rounded-full border border-slate-200 text-lg enabled:hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Decrease servings" disabled={servings <= min} onclick={decrement}>−</button>
	<div class="min-w-20 text-center text-sm font-semibold text-slate-800" aria-live="polite">{servings} servings</div>
	<button type="button" class="h-9 w-9 rounded-full border border-slate-200 text-lg enabled:hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Increase servings" disabled={servings >= max} onclick={increment}>+</button>
</div>
