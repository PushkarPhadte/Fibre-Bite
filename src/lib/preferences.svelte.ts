const FAVORITES_KEY = 'fibre-bite-favorites';

export const favorites = $state({ ids: [] as string[], initialized: false });

export function initializeFavorites() {
	if (favorites.initialized || typeof localStorage === 'undefined') return;

	try {
		const saved: unknown = JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? '[]');
		favorites.ids = Array.isArray(saved) ? saved.filter((id): id is string => typeof id === 'string') : [];
	} catch {
		favorites.ids = [];
	}
	favorites.initialized = true;
}

function persistFavorites() {
	if (!favorites.initialized || typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites.ids));
	} catch {
		// Storage can be unavailable in private browsing or restricted contexts.
	}
}

export function toggleFavorite(id: string) {
	favorites.ids = favorites.ids.includes(id)
		? favorites.ids.filter((item) => item !== id)
		: [...favorites.ids, id];
	persistFavorites();
}