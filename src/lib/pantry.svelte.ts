const PANTRY_KEY = 'fibre-bite-zero-waste-pantry';

export const pantry = $state({ ingredients: [] as string[], initialized: false });

export function initializePantry() {
	if (pantry.initialized || typeof localStorage === 'undefined') return;
	try {
		const saved: unknown = JSON.parse(localStorage.getItem(PANTRY_KEY) ?? '[]');
		pantry.ingredients = Array.isArray(saved)
			? Array.from(new Set(saved.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean)))
			: [];
	} catch {
		pantry.ingredients = [];
	} finally {
		pantry.initialized = true;
	}
}

function persistPantry() {
	if (!pantry.initialized || typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(PANTRY_KEY, JSON.stringify(pantry.ingredients));
	} catch {
		// Storage may be unavailable in some browser contexts.
	}
}

export function addPantryIngredients(value: string) {
	const additions = value.split(',').map((item) => item.trim()).filter(Boolean);
	const known = new Set(pantry.ingredients.map((item) => item.toLowerCase()));
	pantry.ingredients = [...pantry.ingredients, ...additions.filter((item) => !known.has(item.toLowerCase()))];
	persistPantry();
}

export function removePantryIngredient(value: string) {
	pantry.ingredients = pantry.ingredients.filter((item) => item !== value);
	persistPantry();
}

export function clearPantry() {
	pantry.ingredients = [];
	persistPantry();
}
