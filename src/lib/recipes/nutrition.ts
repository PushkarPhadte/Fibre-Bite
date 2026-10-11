import type { Micronutrients, Nutrition } from './types';

export function scaleNutrition(nutrition: Nutrition | undefined, multiplier: number): Nutrition | undefined {
	if (!nutrition) {
		return undefined;
	}

	const scaled: Nutrition = {
		...nutrition,
		...(nutrition.micronutrients
			? {
					micronutrients: Object.fromEntries(
					Object.entries(nutrition.micronutrients).map(([key, value]) => [
						key,
						typeof value === 'number' ? Number((value * multiplier).toFixed(1)) : value
					])
					) as Micronutrients
				}
			: {})
	};

	for (const [key, value] of Object.entries(nutrition)) {
		if (typeof value === 'number') {
			Object.assign(scaled, { [key]: Number((value * multiplier).toFixed(1)) });
		}
	}

	return Object.keys(scaled).length > 0 ? scaled : undefined;
}
