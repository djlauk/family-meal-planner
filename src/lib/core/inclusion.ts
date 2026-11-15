import type { Dish } from '#lib/data/types.ts';

export function excludeDish(excluded: ReadonlySet<string>, dishName: string): ReadonlySet<string> {
	return new Set([...excluded, dishName]);
}

export function includeDish(excluded: ReadonlySet<string>, dishName: string): ReadonlySet<string> {
	return new Set([...excluded].filter((name) => name !== dishName));
}

export function includeAllDishes(): ReadonlySet<string> {
	return new Set();
}

export function setDishIncluded(
	excluded: ReadonlySet<string>,
	dishName: string,
	included: boolean
): ReadonlySet<string> {
	return included ? includeDish(excluded, dishName) : excludeDish(excluded, dishName);
}

export function filterIncludedDishes(
	dishes: readonly Dish[],
	excluded: ReadonlySet<string>
): Dish[] {
	return dishes.filter((dish) => !excluded.has(dish.name));
}
