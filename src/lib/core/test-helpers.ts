import type { Meal, Schedule } from '#lib/data/types.ts';

/** A schedule with empty days, overridden by the given days. */
export function makeSchedule(days: Partial<Schedule> = {}): Schedule {
	return {
		monday: [],
		tuesday: [],
		wednesday: [],
		thursday: [],
		friday: [],
		saturday: [],
		sunday: [],
		...days
	};
}

export const auto = (absences?: string[]): Meal =>
	absences === undefined ? { type: 'auto' } : { type: 'auto', absences };

export const planned = (name: string): Meal => ({ type: 'planned', name });
