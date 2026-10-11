import { allergenOptions, type Allergen } from '$lib/recipes/types';

const ALLERGY_PROFILE_KEY = 'fibre-bite-allergy-profile';

export const allergyProfile = $state({ allergens: [] as Allergen[], initialized: false });

export function initializeAllergyProfile() {
	if (allergyProfile.initialized || typeof localStorage === 'undefined') return;

	try {
		const saved: unknown = JSON.parse(localStorage.getItem(ALLERGY_PROFILE_KEY) ?? '[]');
		allergyProfile.allergens = Array.isArray(saved)
			? Array.from(new Set(saved.filter((item): item is Allergen => typeof item === 'string' && allergenOptions.includes(item as Allergen))))
			: [];
	} catch {
		allergyProfile.allergens = [];
	} finally {
		allergyProfile.initialized = true;
	}
}

export function toggleProfileAllergen(allergen: Allergen) {
	allergyProfile.allergens = allergyProfile.allergens.includes(allergen)
		? allergyProfile.allergens.filter((item) => item !== allergen)
		: [...allergyProfile.allergens, allergen];

	if (allergyProfile.initialized && typeof localStorage !== 'undefined') {
		try {
			localStorage.setItem(ALLERGY_PROFILE_KEY, JSON.stringify(allergyProfile.allergens));
		} catch {
			// Storage may be unavailable in some browser contexts.
		}
	}
}
