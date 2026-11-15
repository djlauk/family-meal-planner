import type { Dish } from '#lib/data/types.ts';

const collator = new Intl.Collator('de-CH');

/** German alphabetical order (Ä next to A, not after Z). */
export function compareGerman(first: string, second: string): number {
	return collator.compare(first, second);
}

export function sortedDishNames(dishes: readonly Dish[]): string[] {
	return dishes.map((dish) => dish.name).sort(compareGerman);
}
