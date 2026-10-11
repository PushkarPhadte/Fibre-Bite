import type { Nutrition } from './types';

export function scaleNutrition(nutrition: Nutrition | undefined, multiplier: number): Nutrition | undefined {
	if (!nutrition) {
		return undefined;
	}

	const scaled: Nutrition = {};

	for (const [key, value] of Object.entries(nutrition)) {
		if (typeof value === 'number') {
			scaled[key as keyof Nutrition] = Number((value * multiplier).toFixed(1));
		}
	}

	return Object.keys(scaled).length > 0 ? scaled : undefined;
}
