import type { Plan, PlanMeal, Schedule, Weekday } from '#lib/data/types.ts';
import { excludeDish } from './inclusion';

export type CellRef = { weekday: Weekday; index: number };

/**
 * fixed: planned in the template, never editable.
 * auto: free, not filled yet (or nothing fitted).
 * planned: filled by a Run.
 * manual: set by hand.
 */
export type CellState = 'fixed' | 'auto' | 'planned' | 'manual';

/** Throws on a bad index: that is a programming error, not a data problem. */
export function getMeal<Meal>(
	schedule: Readonly<Record<Weekday, readonly Meal[]>>,
	cell: CellRef
): Meal {
	const meal = schedule[cell.weekday][cell.index];
	if (meal === undefined) {
		throw new RangeError(`no meal at ${cell.weekday}[${cell.index}]`);
	}
	return meal;
}

/** The working plan starts as the template. Data is immutable, so no copy is needed. */
export function createPlan(template: Schedule): Plan {
	return template;
}

export function isEditableCell(template: Schedule, cell: CellRef): boolean {
	return getMeal(template, cell).type === 'auto';
}

export function cellState(template: Schedule, schedule: Plan, cell: CellRef): CellState {
	if (!isEditableCell(template, cell)) return 'fixed';
	return getMeal(schedule, cell).type;
}

function requireEditableCell(template: Schedule, cell: CellRef): void {
	if (!isEditableCell(template, cell)) {
		throw new Error(`${cell.weekday}[${cell.index}] is fixed in the template`);
	}
}

// Copies only the one day that changes; other days are shared by reference.
function replaceMeal(schedule: Plan, cell: CellRef, meal: PlanMeal): Plan {
	getMeal(schedule, cell);
	const meals = schedule[cell.weekday].map((existing, index) =>
		index === cell.index ? meal : existing
	);
	return { ...schedule, [cell.weekday]: meals };
}

/** Restores the template's AutoMeal (including absences). */
export function clearCell(schedule: Plan, template: Schedule, cell: CellRef): Plan {
	requireEditableCell(template, cell);
	return replaceMeal(schedule, cell, getMeal(template, cell));
}

/** Sets any dish by hand. Deliberately no nogos or duplicate check. */
export function overrideCell(
	schedule: Plan,
	template: Schedule,
	cell: CellRef,
	dishName: string
): Plan {
	requireEditableCell(template, cell);
	const { label } = getMeal(template, cell);
	const meal: PlanMeal =
		label === undefined
			? { type: 'manual', name: dishName }
			: { type: 'manual', label, name: dishName };
	return replaceMeal(schedule, cell, meal);
}

/**
 * Clears a cell. A Run suggestion also excludes its dish, so the next Run
 * does not offer it again. A manual choice is just removed.
 */
export function clearCellAndExclude(
	schedule: Plan,
	template: Schedule,
	cell: CellRef,
	excluded: ReadonlySet<string>
): { schedule: Plan; excluded: ReadonlySet<string> } {
	const current = getMeal(schedule, cell);
	return {
		schedule: clearCell(schedule, template, cell),
		excluded: current.type === 'planned' ? excludeDish(excluded, current.name) : excluded
	};
}
