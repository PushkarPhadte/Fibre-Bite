<script lang="ts">
	let { servings = $bindable(4), min = 1, max = 12 }: { servings: number; min?: number; max?: number } = $props();

	function decrement() {
		servings = Math.max(min, servings - 1);
	}

	function increment() {
		servings = Math.min(max, servings + 1);
	}
</script>

<div class="flex items-center gap-3 rounded-full border border-slate-200 bg-white p-1 shadow-sm">
	<button type="button" class="h-9 w-9 rounded-full border border-slate-200 text-lg" aria-label="Decrease servings" onclick={decrement}>−</button>
	<div class="min-w-20 text-center text-sm font-semibold text-slate-800">{servings} servings</div>
	<button type="button" class="h-9 w-9 rounded-full border border-slate-200 text-lg" aria-label="Increase servings" onclick={increment}>+</button>
</div>
