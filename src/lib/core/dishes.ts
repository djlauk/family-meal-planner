import type { Dish } from '#lib/data/types.ts';

const collator = new Intl.Collator('de-CH');

/** Dish names in German alphabetical order (Ä next to A, not after Z). */
export function sortedDishNames(dishes: readonly Dish[]): string[] {
	return dishes.map((dish) => dish.name).sort(collator.compare);
}
