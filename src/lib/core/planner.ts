import { weekdays, type AutoMeal, type Dish, type Plan, type PlanMeal } from '#lib/data/types.ts';
import { filterIncludedDishes } from './inclusion';
import { shuffle } from './shuffle';

export type PlanResult = { schedule: Plan; unfilledCount: number };

/** A dish fits a cell if it has no nogos, or every nogo person is absent. */
export function isDishAcceptable(dish: Dish, meal: AutoMeal): boolean {
	const nogos = dish.nogos ?? [];
	const absences = meal.absences ?? [];
	return nogos.every((personId) => absences.includes(personId));
}

/** Names already in the schedule (fixed, planned or manual), any day. */
export function usedNames(schedule: Plan): Set<string> {
	return new Set(
		weekdays.flatMap((weekday) =>
			schedule[weekday].flatMap((meal) => (meal.type === 'auto' ? [] : [meal.name]))
		)
	);
}

/**
 * Greedy, deterministic fill of every `auto` cell. The caller decides dish
 * order (filtering and shuffling happen outside). Cells with no acceptable
 * dish stay `auto` and are counted. The input is not changed.
 */
export function planMeals(dishes: readonly Dish[], schedule: Plan): PlanResult {
	const alreadyUsed = usedNames(schedule);
	// Pool is a local working copy; only this function sees it change.
	const pool = dishes.filter((dish) => !alreadyUsed.has(dish.name));
	let unfilledCount = 0;

	const fillMeal = (meal: PlanMeal): PlanMeal => {
		if (meal.type !== 'auto') return meal;
		const index = pool.findIndex((dish) => isDishAcceptable(dish, meal));
		if (index === -1) {
			unfilledCount += 1;
			return meal;
		}
		const [dish] = pool.splice(index, 1) as [Dish];
		return meal.label === undefined
			? { type: 'planned', name: dish.name }
			: { type: 'planned', label: meal.label, name: dish.name };
	};

	// Build the result day by day in fixed order. Object spread would follow
	// the input's key order, which must not influence the fill order.
	const result = {} as Plan;
	for (const weekday of weekdays) {
		result[weekday] = schedule[weekday].map(fillMeal);
	}
	return { schedule: result, unfilledCount };
}

/** One Run: drop excluded dishes, shuffle with the given seed, fill. */
export function runPlanner(
	dishes: readonly Dish[],
	excluded: ReadonlySet<string>,
	schedule: Plan,
	seed: number
): PlanResult {
	return planMeals(shuffle(filterIncludedDishes(dishes, excluded), seed), schedule);
}
