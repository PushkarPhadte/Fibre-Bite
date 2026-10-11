import type { MicronutrientKey, Micronutrients } from './types';

export const micronutrientOptions = [
	{ key: 'calciumMg', label: 'Calcium', unit: 'mg', dailyValue: 1300 },
	{ key: 'ironMg', label: 'Iron', unit: 'mg', dailyValue: 18 },
	{ key: 'magnesiumMg', label: 'Magnesium', unit: 'mg', dailyValue: 420 },
	{ key: 'potassiumMg', label: 'Potassium', unit: 'mg', dailyValue: 4700 },
	{ key: 'vitaminCMg', label: 'Vitamin C', unit: 'mg', dailyValue: 90 },
	{ key: 'vitaminDMcg', label: 'Vitamin D', unit: 'mcg', dailyValue: 20 },
	{ key: 'folateMcg', label: 'Folate', unit: 'mcg', dailyValue: 400 }
] as const satisfies ReadonlyArray<{
	key: MicronutrientKey;
	label: string;
	unit: string;
	dailyValue: number;
}>;

export type MicronutrientFilterKey = (typeof micronutrientOptions)[number]['key'];

export function getMicronutrientOption(key: MicronutrientKey) {
	return micronutrientOptions.find((option) => option.key === key);
}

export function meetsMicronutrientThreshold(
	nutrients: Micronutrients | undefined,
	key: MicronutrientFilterKey,
	minimumPercent: 10 | 20
): boolean {
	const option = getMicronutrientOption(key);
	const amount = nutrients?.[key];

	return option !== undefined && amount !== undefined && amount >= (option.dailyValue * minimumPercent) / 100;
}