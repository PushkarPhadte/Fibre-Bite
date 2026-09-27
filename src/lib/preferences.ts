import { writable } from 'svelte/store';

const FAVORITES_KEY = 'fibre-bite-favorites';

function readFavorites(): string[] {
	if (typeof localStorage === 'undefined') return [];
	try {
		const saved = localStorage.getItem(FAVORITES_KEY);
		return saved ? JSON.parse(saved) : [];
	} catch {
		return [];
	}
}

function writeFavorites(ids: string[]) {
	if (typeof localStorage === 'undefined') return;
	localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}

export const favorites = writable<string[]>(readFavorites());

favorites.subscribe((ids) => writeFavorites(ids));

export function toggleFavorite(id: string) {
	favorites.update((current) => {
		if (current.includes(id)) {
			return current.filter((item) => item !== id);
		}
		return [...current, id];
	});
}

export function isFavorite(id: string) {
	let value = false;
	favorites.subscribe((ids) => {
		value = ids.includes(id);
	})();
	return value;
}
