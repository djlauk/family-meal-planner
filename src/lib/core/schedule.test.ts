import { describe, expect, it } from 'vitest';
import type { Schedule } from '#lib/data/types.ts';
import { filterIncludedDishes, setDishIncluded } from './inclusion';
import { planMeals } from './planner';
import {
	cellState,
	clearCell,
	clearCellAndExclude,
	createPlan,
	getMeal,
	isEditableCell,
	overrideCell
} from './schedule';
import { auto, makeSchedule, manual, planned } from './test-helpers';

const template: Schedule = makeSchedule({
	monday: [
		{ type: 'auto', label: 'Zmittag', absences: ['lea'] },
		{ type: 'planned', label: 'Znacht', name: 'Pizza' }
	],
	tuesday: [auto()]
});
const lunch = { weekday: 'monday', index: 0 } as const;
const pizzaCell = { weekday: 'monday', index: 1 } as const;
const tuesday = { weekday: 'tuesday', index: 0 } as const;

describe('cell helpers', () => {
	it('getMeal throws on a bad index', () => {
		expect(() => getMeal(template, { weekday: 'monday', index: 5 })).toThrow(RangeError);
	});

	it('only template auto cells are editable', () => {
		expect(isEditableCell(template, lunch)).toBe(true);
		expect(isEditableCell(template, pizzaCell)).toBe(false);
	});

	it('cellState distinguishes fixed, auto, planned and manual', () => {
		const plan = createPlan(template);
		expect(cellState(template, plan, pizzaCell)).toBe('fixed');
		expect(cellState(template, plan, lunch)).toBe('auto');
		const filled = planMeals([{ name: 'Rösti' }], plan).schedule;
		expect(cellState(template, filled, lunch)).toBe('planned');
		expect(cellState(template, filled, tuesday)).toBe('auto');
		const overridden = overrideCell(filled, template, tuesday, 'Curry');
		expect(cellState(template, overridden, tuesday)).toBe('manual');
	});

	it('overrideCell ignores nogos, allows duplicates and keeps the label', () => {
		const once = overrideCell(createPlan(template), template, lunch, 'Pizza');
		expect(getMeal(once, lunch)).toEqual({ type: 'manual', label: 'Zmittag', name: 'Pizza' });
		const twice = overrideCell(once, template, tuesday, 'Pizza');
		expect(getMeal(twice, tuesday)).toEqual(manual('Pizza'));
	});

	it('fixed cells cannot be overridden or cleared', () => {
		expect(() => overrideCell(template, template, pizzaCell, 'Curry')).toThrow(/fixed/);
		expect(() => clearCell(template, template, pizzaCell)).toThrow(/fixed/);
	});

	it('clearCell restores the template meal with absences', () => {
		const filled = overrideCell(template, template, lunch, 'Curry');
		const cleared = clearCell(filled, template, lunch);
		expect(getMeal(cleared, lunch)).toEqual({ type: 'auto', label: 'Zmittag', absences: ['lea'] });
	});

	it('helpers do not mutate and share unchanged days', () => {
		const before = structuredClone(template);
		const result = overrideCell(template, template, lunch, 'Curry');
		clearCell(result, template, lunch);
		expect(template).toEqual(before);
		expect(result.tuesday).toBe(template.tuesday);
	});
});

describe('clearCellAndExclude', () => {
	it('excludes the dish of a planned cell', () => {
		const suggested = planMeals([{ name: 'Rösti' }], template).schedule;
		const result = clearCellAndExclude(suggested, template, lunch, new Set(['Curry']));
		expect(getMeal(result.schedule, lunch).type).toBe('auto');
		expect([...result.excluded].sort()).toEqual(['Curry', 'Rösti']);
	});

	it('does not exclude the dish of a manual cell', () => {
		const excluded = new Set<string>();
		const overridden = overrideCell(template, template, lunch, 'Curry');
		const result = clearCellAndExclude(overridden, template, lunch, excluded);
		expect(getMeal(result.schedule, lunch).type).toBe('auto');
		expect(result.excluded).toBe(excluded);
	});

	it('a cleared suggestion is not suggested again', () => {
		const dishes = [{ name: 'Rösti' }, { name: 'Curry' }, { name: 'Suppe' }];
		const first = planMeals(dishes, template).schedule;
		expect(getMeal(first, lunch)).toMatchObject(planned('Rösti'));
		const cleared = clearCellAndExclude(first, template, lunch, new Set());
		const second = planMeals(filterIncludedDishes(dishes, cleared.excluded), cleared.schedule);
		// Curry stays on Tuesday from the first run, so Suppe is next in line.
		expect(getMeal(second.schedule, lunch)).toMatchObject(planned('Suppe'));
		expect(second.schedule.tuesday).toEqual([planned('Curry')]);
	});

	it('re-including the dish makes it available again', () => {
		const dishes = [{ name: 'Rösti' }];
		const cleared = clearCellAndExclude(
			planMeals(dishes, template).schedule,
			template,
			lunch,
			new Set()
		);
		const excluded = setDishIncluded(cleared.excluded, 'Rösti', true);
		const again = planMeals(filterIncludedDishes(dishes, excluded), cleared.schedule);
		expect(getMeal(again.schedule, lunch)).toMatchObject(planned('Rösti'));
	});
});
