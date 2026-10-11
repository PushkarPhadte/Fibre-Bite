const MEAL_PREP_KEY = 'fibre-bite-meal-prep';

export const mealPrep = $state({ recipeIds: [] as string[], completedStepIds: [] as string[], initialized: false });

export function initializeMealPrep() {
	if (mealPrep.initialized || typeof localStorage === 'undefined') return;

	try {
		const saved: unknown = JSON.parse(localStorage.getItem(MEAL_PREP_KEY) ?? '{}');
		if (saved && typeof saved === 'object') {
			const plan = saved as { recipeIds?: unknown; completedStepIds?: unknown };
			mealPrep.recipeIds = Array.isArray(plan.recipeIds)
				? plan.recipeIds.filter((id): id is string => typeof id === 'string')
				: [];
			mealPrep.completedStepIds = Array.isArray(plan.completedStepIds)
				? plan.completedStepIds.filter((id): id is string => typeof id === 'string')
				: [];
		}
	} catch {
		mealPrep.recipeIds = [];
		mealPrep.completedStepIds = [];
	} finally {
		mealPrep.initialized = true;
	}
}

function persistMealPrep() {
	if (!mealPrep.initialized || typeof localStorage === 'undefined') return;

	try {
		localStorage.setItem(MEAL_PREP_KEY, JSON.stringify({
			recipeIds: mealPrep.recipeIds,
			completedStepIds: mealPrep.completedStepIds
		}));
	} catch {
		// Storage may be unavailable in some browser contexts.
	}
}

export function isInMealPrep(id: string) {
	return mealPrep.recipeIds.includes(id);
}

export function toggleMealPrepRecipe(id: string) {
	if (isInMealPrep(id)) {
		mealPrep.recipeIds = mealPrep.recipeIds.filter((recipeId) => recipeId !== id);
		mealPrep.completedStepIds = mealPrep.completedStepIds.filter((stepId) => !stepId.startsWith(`${id}:`));
	} else {
		mealPrep.recipeIds = [...mealPrep.recipeIds, id];
	}
	persistMealPrep();
}

export function toggleMealPrepStep(stepId: string) {
	mealPrep.completedStepIds = mealPrep.completedStepIds.includes(stepId)
		? mealPrep.completedStepIds.filter((id) => id !== stepId)
		: [...mealPrep.completedStepIds, stepId];
	persistMealPrep();
}

export function clearMealPrep() {
	mealPrep.recipeIds = [];
	mealPrep.completedStepIds = [];
	persistMealPrep();
}
