import english from './locales/en.json';
import hindi from './locales/hi.json';
import marathi from './locales/mr.json';

export type Language = 'en' | 'hi' | 'mr';

const LANGUAGE_KEY = 'fibre-bite-language';
const dictionaries: Record<Language, Record<string, string>> = { en: english, hi: hindi, mr: marathi };

export const language = $state({ current: 'en' as Language });

export function t(key: string, values: Record<string, string | number> = {}): string {
	let message = dictionaries[language.current][key] ?? dictionaries.en[key] ?? key;
	for (const [name, value] of Object.entries(values)) {
		message = message.replaceAll(`{${name}}`, String(value));
	}
	return message;
}

export function setLanguage(next: Language): void {
	language.current = next;
	if (typeof localStorage !== 'undefined') {
		try {
			localStorage.setItem(LANGUAGE_KEY, next);
		} catch {}
	}
}

export function initializeLanguage(): void {
	if (typeof localStorage === 'undefined') return;
	try {
		const saved = localStorage.getItem(LANGUAGE_KEY);
		if (saved === 'en' || saved === 'hi' || saved === 'mr') language.current = saved;
	} catch {
		language.current = 'en';
	}
}