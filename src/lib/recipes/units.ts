import type { Ingredient } from './types';

export function scaleAmount(amount: number, multiplier: number): number {
	return Number((amount * multiplier).toFixed(2));
}

export function formatAmount(value: number): string {
	if (Number.isInteger(value)) {
		return `${value}`;
	}

	const formatted = Number(value.toFixed(2));
	return `${formatted}`;
}

export function formatIngredient(ingredient: Ingredient, multiplier: number): string {
	const scaledAmount = scaleAmount(ingredient.baseAmount, multiplier);
	const amountText = scaledAmount === 0 ? 'to taste' : formatAmount(scaledAmount);
	return `${amountText} ${ingredient.unit} ${ingredient.name}`.trim();
}
