import { weekdays, type AutoMeal, type Dish, type Meal, type Schedule } from '#lib/data/types.ts';

/** A dish fits a cell if it has no nogos, or every nogo person is absent. */
export function isDishAcceptable(dish: Dish, meal: AutoMeal): boolean {
	const nogos = dish.nogos ?? [];
	const absences = meal.absences ?? [];
	return nogos.every((personId) => absences.includes(personId));
}

/** Names of all planned meals in the schedule, any day. */
export function plannedNames(schedule: Schedule): Set<string> {
	return new Set(
		weekdays.flatMap((weekday) =>
			schedule[weekday].flatMap((meal) => (meal.type === 'planned' ? [meal.name] : []))
		)
	);
}

/**
 * Greedy, deterministic fill of every `auto` cell. The caller decides dish
 * order (filtering and shuffling happen outside). Cells with no acceptable
 * dish stay `auto`. Returns a new schedule; the input is not changed.
 */
export function planMeals(dishes: readonly Dish[], schedule: Schedule): Schedule {
	const alreadyPlanned = plannedNames(schedule);
	// Pool is a local working copy; only this function sees it change.
	const pool = dishes.filter((dish) => !alreadyPlanned.has(dish.name));

	const fillMeal = (meal: Meal): Meal => {
		if (meal.type === 'planned') return meal;
		const index = pool.findIndex((dish) => isDishAcceptable(dish, meal));
		if (index === -1) return meal;
		const [dish] = pool.splice(index, 1) as [Dish];
		return meal.label === undefined
			? { type: 'planned', name: dish.name }
			: { type: 'planned', label: meal.label, name: dish.name };
	};

	// Build the result day by day in fixed order. Object spread would follow
	// the input's key order, which must not influence the fill order.
	const result = {} as Schedule;
	for (const weekday of weekdays) {
		result[weekday] = schedule[weekday].map(fillMeal);
	}
	return result;
}
