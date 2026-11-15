import { describe, expect, it } from 'vitest';
import type { Schedule } from '#lib/data/types.ts';
import { planMeals } from './planner';
import { clearCell, clearSuggestion, getMeal, isSuggestionCell, overrideCell } from './schedule';
import { auto, makeSchedule, planned } from './test-helpers';

const template: Schedule = makeSchedule({
	monday: [
		{ type: 'auto', label: 'Zmittag', absences: ['lea'] },
		{ type: 'planned', label: 'Znacht', name: 'Pizza' }
	],
	tuesday: [auto()]
});
const lunch = { weekday: 'monday', index: 0 } as const;
const pizzaCell = { weekday: 'monday', index: 1 } as const;

describe('schedule helpers', () => {
	it('getMeal throws on a bad index', () => {
		expect(() => getMeal(template, { weekday: 'monday', index: 5 })).toThrow(RangeError);
	});

	it('isSuggestionCell is true only for template auto cells', () => {
		expect(isSuggestionCell(template, lunch)).toBe(true);
		expect(isSuggestionCell(template, pizzaCell)).toBe(false);
	});

	it('clearCell restores the template meal with absences', () => {
		const filled = overrideCell(template, lunch, 'Curry');
		const cleared = clearCell(filled, template, lunch);
		expect(getMeal(cleared, lunch)).toEqual({ type: 'auto', label: 'Zmittag', absences: ['lea'] });
	});

	it('clearCell refuses fixed template cells', () => {
		expect(() => clearCell(template, template, pizzaCell)).toThrow(/fixed/);
	});

	it('overrideCell ignores nogos and keeps the label', () => {
		// The helper has no dish list, so no nogos check is possible by design.
		const result = overrideCell(template, lunch, 'Curry');
		expect(getMeal(result, lunch)).toEqual({ type: 'planned', label: 'Zmittag', name: 'Curry' });
	});

	it('helpers do not mutate and share unchanged days', () => {
		const before = structuredClone(template);
		const result = overrideCell(template, lunch, 'Curry');
		clearCell(result, template, lunch);
		expect(template).toEqual(before);
		expect(result.tuesday).toBe(template.tuesday);
	});

	it('clearSuggestion clears the cell and excludes its dish', () => {
		const suggested = planMeals([{ name: 'Rösti' }], template);
		const result = clearSuggestion(suggested, template, lunch, new Set(['Curry']));
		expect(getMeal(result.schedule, lunch).type).toBe('auto');
		expect([...result.excluded].sort()).toEqual(['Curry', 'Rösti']);
	});

	it('clearSuggestion on an auto cell changes no exclusions', () => {
		const excluded = new Set<string>();
		const result = clearSuggestion(template, template, lunch, excluded);
		expect(result.excluded).toBe(excluded);
	});

	it('a cleared and excluded dish is not suggested again', () => {
		const first = planMeals([{ name: 'Rösti' }, { name: 'Curry' }], template);
		expect(getMeal(first, lunch)).toMatchObject(planned('Rösti'));
	});
});
