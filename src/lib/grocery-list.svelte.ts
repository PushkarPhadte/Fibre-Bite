const GROCERY_LIST_KEY = 'fibre-bite-grocery-list';

export const groceryList = $state({ recipeIds: [] as string[], initialized: false });

export function initializeGroceryList() {
	if (groceryList.initialized || typeof localStorage === 'undefined') return;

	try {
		const saved: unknown = JSON.parse(localStorage.getItem(GROCERY_LIST_KEY) ?? '[]');
		groceryList.recipeIds = Array.isArray(saved)
			? saved.filter((id): id is string => typeof id === 'string')
			: [];
	} catch {
		groceryList.recipeIds = [];
	} finally {
		groceryList.initialized = true;
	}
}

function persistGroceryList() {
	if (!groceryList.initialized || typeof localStorage === 'undefined') return;

	try {
		localStorage.setItem(GROCERY_LIST_KEY, JSON.stringify(groceryList.recipeIds));
	} catch {
		// Storage may be unavailable in some browser contexts.
	}
}

export function isOnGroceryList(id: string) {
	return groceryList.recipeIds.includes(id);
}

export function toggleGroceryList(id: string) {
	groceryList.recipeIds = isOnGroceryList(id)
		? groceryList.recipeIds.filter((item) => item !== id)
		: [...groceryList.recipeIds, id];
	persistGroceryList();
}

export function clearGroceryList() {
	groceryList.recipeIds = [];
	persistGroceryList();
}
