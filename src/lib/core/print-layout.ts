import type { Plan, PlanMeal, Weekday } from '#lib/data/types.ts';

/** Day pairs for the two print halves. Thursday has no partner. */
export const printDayPairs: readonly (readonly [Weekday, Weekday | undefined])[] = [
	['monday', 'friday'],
	['tuesday', 'saturday'],
	['wednesday', 'sunday'],
	['thursday', undefined]
];

export type PrintHalf =
	{ kind: 'heading'; weekday: Weekday } | { kind: 'meal'; meal: PlanMeal } | { kind: 'empty' };

export type PrintRow = { left: PrintHalf; right: PrintHalf; startsBlock: boolean };

function headingHalf(weekday: Weekday | undefined): PrintHalf {
	return weekday === undefined ? { kind: 'empty' } : { kind: 'heading', weekday };
}

function mealHalf(meals: readonly PlanMeal[], index: number): PrintHalf {
	const meal = meals[index];
	return meal === undefined ? { kind: 'empty' } : { kind: 'meal', meal };
}

/**
 * Rows for the print grid. Each day pair is one block: a heading row, then as
 * many meal rows as the longer day; the shorter side is padded with empty
 * halves. So both halves always start their blocks on the same row.
 */
export function printRows(schedule: Plan): PrintRow[] {
	return printDayPairs.flatMap(([leftDay, rightDay]) => {
		const leftMeals = schedule[leftDay];
		const rightMeals = rightDay === undefined ? [] : schedule[rightDay];
		const mealRowCount = Math.max(leftMeals.length, rightMeals.length);
		const heading: PrintRow = {
			left: headingHalf(leftDay),
			right: headingHalf(rightDay),
			startsBlock: true
		};
		const mealRows = Array.from({ length: mealRowCount }, (_, index): PrintRow => ({
			left: mealHalf(leftMeals, index),
			right: mealHalf(rightMeals, index),
			startsBlock: false
		}));
		return [heading, ...mealRows];
	});
}
