import { defaultLanguage, isLanguage, languageCodes } from './i18n/languages';

export type Language = string;

const LANGUAGE_KEY = 'fibre-bite-language';
const localeModules = import.meta.glob<Record<string, string>>('./locales/*.json', {
	eager: true,
	import: 'default'
});
const dictionaries = Object.fromEntries(languageCodes.map((code) => [
	code,
	localeModules[`./locales/${code}.json`] ?? {}
])) as Record<Language, Record<string, string>>;

export const language = $state({ current: defaultLanguage as Language });

export function t(key: string, values: Record<string, string | number> = {}): string {
	let message = dictionaries[language.current]?.[key] ?? dictionaries[defaultLanguage]?.[key] ?? key;
	for (const [name, value] of Object.entries(values)) {
		message = message.replaceAll(`{${name}}`, String(value));
	}
	return message;
}

export function setLanguage(next: Language): void {
	if (!isLanguage(next)) return;
	language.current = next;
	if (typeof document !== 'undefined') document.documentElement.lang = next;
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
		if (saved && isLanguage(saved)) language.current = saved;
	} catch {
		language.current = defaultLanguage;
	}
	if (typeof document !== 'undefined') document.documentElement.lang = language.current;
}