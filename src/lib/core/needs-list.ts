import { weekdays, type Dish, type Plan } from '#lib/data/types.ts';
import { compareGerman } from './dishes';

/** Merge key only; the displayed spelling is the first one seen. */
export function normalizeIngredient(name: string): string {
	return name.trim().replace(/\s+/g, ' ').toLocaleLowerCase('de-CH');
}

/**
 * Ingredients of every fixed, planned and manual meal whose name matches a
 * dish exactly. Free text and dishes without ingredients add nothing.
 * Merged by normalized name, sorted alphabetically (de-CH).
 */
export function needsList(schedule: Plan, dishes: readonly Dish[]): string[] {
	const dishesByName = new Map(dishes.map((dish) => [dish.name, dish]));
	// Map keeps insertion order, so the first spelling wins.
	const spellingByKey = new Map<string, string>();

	for (const weekday of weekdays) {
		for (const meal of schedule[weekday]) {
			if (meal.type === 'auto') continue;
			for (const ingredient of dishesByName.get(meal.name)?.ingredients ?? []) {
				const key = normalizeIngredient(ingredient);
				if (!spellingByKey.has(key)) spellingByKey.set(key, ingredient.trim().replace(/\s+/g, ' '));
			}
		}
	}

	return [...spellingByKey.values()].sort(compareGerman);
}

export function needsListText(items: readonly string[]): string {
	return items.join('\n');
}
