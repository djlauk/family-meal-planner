import type { Meal, Schedule, Weekday } from '#lib/data/types.ts';
import { excludeDish } from './inclusion';

export type CellRef = { weekday: Weekday; index: number };

/** Throws on a bad index: that is a programming error, not a data problem. */
export function getMeal(schedule: Schedule, cell: CellRef): Meal {
	const meal = schedule[cell.weekday][cell.index];
	if (meal === undefined) {
		throw new RangeError(`no meal at ${cell.weekday}[${cell.index}]`);
	}
	return meal;
}

/** A suggestion cell was `auto` in the template, so the user may change it. */
export function isSuggestionCell(template: Schedule, cell: CellRef): boolean {
	return getMeal(template, cell).type === 'auto';
}

// Copies only the one day that changes; other days are shared by reference.
function replaceMeal(schedule: Schedule, cell: CellRef, meal: Meal): Schedule {
	getMeal(schedule, cell);
	const meals = schedule[cell.weekday].map((existing, index) =>
		index === cell.index ? meal : existing
	);
	return { ...schedule, [cell.weekday]: meals };
}

function requireSuggestionCell(template: Schedule, cell: CellRef): void {
	if (!isSuggestionCell(template, cell)) {
		throw new Error(`${cell.weekday}[${cell.index}] is fixed in the template`);
	}
}

/** Restores the template's AutoMeal (including absences) for a suggestion cell. */
export function clearCell(schedule: Schedule, template: Schedule, cell: CellRef): Schedule {
	requireSuggestionCell(template, cell);
	return replaceMeal(schedule, cell, getMeal(template, cell));
}

/** Sets a cell to a dish of the user's choice. Deliberately no nogos check. */
export function overrideCell(schedule: Schedule, cell: CellRef, dishName: string): Schedule {
	const current = getMeal(schedule, cell);
	const meal: Meal =
		current.label === undefined
			? { type: 'planned', name: dishName }
			: { type: 'planned', label: current.label, name: dishName };
	return replaceMeal(schedule, cell, meal);
}

/**
 * Clears a suggestion and excludes its dish from later runs, so the next run
 * does not simply suggest it again.
 */
export function clearSuggestion(
	schedule: Schedule,
	template: Schedule,
	cell: CellRef,
	excluded: ReadonlySet<string>
): { schedule: Schedule; excluded: ReadonlySet<string> } {
	const current = getMeal(schedule, cell);
	return {
		schedule: clearCell(schedule, template, cell),
		excluded: current.type === 'planned' ? excludeDish(excluded, current.name) : excluded
	};
}
