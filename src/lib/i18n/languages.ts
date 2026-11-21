import configuration from './languages.json' with { type: 'json' };

export const languageOptions = configuration.languages;
export const languageCodes = languageOptions.map(({ code }) => code);
export const defaultLanguage = configuration.default;

export function isLanguage(value: string): boolean {
	return languageCodes.includes(value);
}