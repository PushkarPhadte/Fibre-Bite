import type { Language } from '../locale.svelte';
import type { LocalizedRecipeText, Recipe, RecipeTranslations } from './types';
import { languageOptions } from '../i18n/languages.ts';

const languageBlockPattern = /^:::lang\s+([a-z]{2,3}(?:-[a-z0-9]{2,8})*)\s*\r?\n([\s\S]*?)^:::\s*$/gm;

function parseLanguageBlock(block: string): LocalizedRecipeText {
	const result: LocalizedRecipeText = {};
	const benefits: string[] = [];
	const instructions: Array<{ number: number; text: string }> = [];
	const additionalContent: string[] = [];
	let section: 'intro' | 'description' | 'benefits' | 'instructions' | 'content' = 'intro';
	const description: string[] = [];

	for (const rawLine of block.split(/\r?\n/)) {
		const line = rawLine.trim();
		if (!line) continue;
		const heading = line.match(/^(#{1,2})\s+(.+)$/);
		if (heading) {
			const label = heading[2].trim();
			if (heading[1].length === 1 && !result.title) {
				result.title = label;
				section = 'intro';
			} else {
				const normalizedLabel = label.toLowerCase();
				if (['description', 'about'].includes(normalizedLabel)) section = 'description';
				else if (['benefits', 'health benefits'].includes(normalizedLabel)) section = 'benefits';
				else if (['instructions', 'method', 'preparation'].includes(normalizedLabel)) section = 'instructions';
				else {
					section = 'content';
					additionalContent.push(label);
				}
			}
			continue;
		}

		if (section === 'intro' || section === 'description') description.push(line);
		else if (section === 'benefits') benefits.push(line.replace(/^[-*+]\s+/, ''));
		else if (section === 'instructions') {
			const numbered = line.match(/^(\d+)[.)]\s+(.+)$/);
			instructions.push({ number: instructions.length + 1, text: numbered?.[2] ?? line.replace(/^[-*+]\s+/, '') });
		} else additionalContent.push(line);
	}

	if (description.length > 0) result.description = description.join(' ');
	if (benefits.length > 0) result.benefits = benefits;
	if (instructions.length > 0) result.instructions = instructions;
	if (additionalContent.length > 0) result.content = additionalContent.join('\n');
	return result;
}

export function parseLanguageBlocks(markdown: string): RecipeTranslations {
	const translations: RecipeTranslations = {};
	for (const match of markdown.matchAll(languageBlockPattern)) {
		const locale = match[1];
		translations[locale] = parseLanguageBlock(match[2]);
	}
	return translations;
}

function renderLanguageBlock(text: LocalizedRecipeText): string {
	const lines: string[] = [];
	if (text.title) lines.push(`# ${text.title}`, '');
	if (text.description) lines.push(text.description, '');
	if (text.benefits?.length) lines.push('## Benefits', ...text.benefits.map((benefit) => `- ${benefit}`), '');
	if (text.instructions?.length) {
		lines.push('## Instructions', ...text.instructions.map((step, index) => `${index + 1}. ${step.text}`), '');
	}
	if (text.content) lines.push('## Content', text.content, '');
	return lines.join('\n').trim();
}

export function renderLanguageBlocks(translations: RecipeTranslations | undefined): string {
	if (!translations) return '';
	const configuredCodes = languageOptions.map(({ code }) => code);
	const locales = [
		...configuredCodes,
		...Object.keys(translations).filter((locale) => !configuredCodes.includes(locale)).sort()
	];
	return locales
		.filter((locale) => translations[locale])
		.map((locale) => `:::lang ${locale}\n${renderLanguageBlock(translations[locale]!)}\n:::`)
		.join('\n\n');
}

export function withoutLanguageBlocks(markdown: string): string {
	return markdown.replace(languageBlockPattern, '').trim();
}

export function getRecipeText(recipe: Recipe, locale: Language): LocalizedRecipeText & { title: string; description: string; instructions: Recipe['instructions'] } {
	const selected = recipe.translations?.[locale];
	const english = recipe.translations?.en;
	return {
		title: selected?.title ?? english?.title ?? recipe.title,
		description: selected?.description ?? english?.description ?? recipe.description ?? '',
		instructions: selected?.instructions ?? english?.instructions ?? recipe.instructions,
		benefits: selected?.benefits ?? english?.benefits,
		content: selected?.content ?? english?.content
	};
}