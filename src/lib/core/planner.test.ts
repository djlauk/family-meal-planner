import { describe, expect, it } from 'vitest';
import { loadDataSet } from '#lib/data/loader.ts';
import { weekdays, type Dish, type Plan, type PlanMeal, type Schedule } from '#lib/data/types.ts';
import { isDishAcceptable, planMeals, runPlanner } from './planner';
import { shuffle } from './shuffle';
import { auto, makePlan, makeSchedule, planned } from './test-helpers';

function allMeals(schedule: Plan): PlanMeal[] {
	return weekdays.flatMap((weekday) => schedule[weekday]);
}

function plannedNamesInOrder(schedule: Plan): string[] {
	return allMeals(schedule).flatMap((meal) => (meal.type !== 'auto' ? [meal.name] : []));
}

const fill = (dishList: readonly Dish[], schedule: Plan) => planMeals(dishList, schedule).schedule;

const dishes: Dish[] = [
	{ name: 'Curry', nogos: ['lea', 'nico'] },
	{ name: 'Suppe', nogos: ['lea'] },
	{ name: 'Pizza' },
	{ name: 'Rösti', nogos: [] },
	{ name: 'Lasagne' }
];

describe('isDishAcceptable', () => {
	it('accepts dishes without nogos anywhere', () => {
		expect(isDishAcceptable({ name: 'A' }, { type: 'auto' })).toBe(true);
		expect(isDishAcceptable({ name: 'A', nogos: [] }, { type: 'auto' })).toBe(true);
	});

	it('requires every nogo person to be absent', () => {
		const dish = { name: 'A', nogos: ['lea', 'nico'] };
		expect(isDishAcceptable(dish, { type: 'auto' })).toBe(false);
		expect(isDishAcceptable(dish, { type: 'auto', absences: [] })).toBe(false);
		expect(isDishAcceptable(dish, { type: 'auto', absences: ['lea'] })).toBe(false);
		expect(isDishAcceptable(dish, { type: 'auto', absences: ['nico', 'lea', 'mara'] })).toBe(true);
	});
});

describe('planMeals', () => {
	it('gives the same output for the same input', () => {
		const schedule = makeSchedule({ monday: [auto(), auto(['lea'])], friday: [auto()] });
		expect(fill(dishes, schedule)).toEqual(fill(dishes, schedule));
	});

	it('takes the first acceptable dish in list order', () => {
		const result = fill(dishes, makeSchedule({ monday: [auto()] }));
		expect(result.monday).toEqual([planned('Pizza')]);
	});

	it('places a dish with nogos only where all those people are absent', () => {
		const schedule = makeSchedule({
			monday: [auto(['lea'])],
			tuesday: [auto(['nico'])],
			wednesday: [auto(['lea', 'nico'])]
		});
		const result = fill([{ name: 'Curry', nogos: ['lea', 'nico'] }], schedule);
		expect(result.monday).toEqual([auto(['lea'])]);
		expect(result.tuesday).toEqual([auto(['nico'])]);
		expect(result.wednesday).toEqual([planned('Curry')]);
	});

	it('never places a dish with nogos in a cell without absences', () => {
		const schedule = makeSchedule({ monday: [auto(), auto([])], sunday: [auto()] });
		const result = fill([{ name: 'Curry', nogos: ['lea'] }], schedule);
		expect(result).toEqual(schedule);
	});

	it('never suggests a dish that is planned elsewhere in the schedule', () => {
		const schedule = makeSchedule({ monday: [auto()], thursday: [planned('Pizza')] });
		const result = fill([{ name: 'Pizza' }, { name: 'Rösti' }], schedule);
		expect(result.monday).toEqual([planned('Rösti')]);
		expect(plannedNamesInOrder(result).filter((name) => name === 'Pizza')).toHaveLength(1);
	});

	it('uses no dish twice', () => {
		const schedule = makeSchedule(
			Object.fromEntries(weekdays.map((weekday) => [weekday, [auto(['lea', 'nico']), auto()]]))
		);
		const names = plannedNamesInOrder(fill(dishes, schedule));
		expect(new Set(names).size).toBe(names.length);
		expect(names).toHaveLength(dishes.length);
	});

	it('leaves planned cells unchanged', () => {
		const pinned = { type: 'planned', label: 'Znacht', name: 'Restaurant' } as const;
		const result = fill(dishes, makeSchedule({ friday: [pinned, auto()] }));
		expect(result.friday[0]).toEqual(pinned);
	});

	it('keeps the label of a filled cell', () => {
		const result = fill(dishes, makeSchedule({ monday: [{ type: 'auto', label: 'Zmittag' }] }));
		expect(result.monday).toEqual([{ type: 'planned', label: 'Zmittag', name: 'Pizza' }]);
	});

	it('does not mutate its inputs', () => {
		const schedule = makeSchedule({ monday: [auto(['lea']), planned('Pizza')], tuesday: [auto()] });
		const scheduleBefore = structuredClone(schedule);
		const dishesBefore = structuredClone(dishes);
		fill(dishes, schedule);
		expect(schedule).toEqual(scheduleBefore);
		expect(dishes).toEqual(dishesBefore);
	});

	it('leaves a cell auto when nothing fits', () => {
		const schedule = makeSchedule({ monday: [auto()], tuesday: [auto()] });
		const result = fill([{ name: 'Rösti' }], schedule);
		expect(result.monday).toEqual([planned('Rösti')]);
		expect(result.tuesday).toEqual([auto()]);
	});

	it('handles an empty dish list', () => {
		const schedule = makeSchedule({ monday: [auto()] });
		expect(fill([], schedule)).toEqual(schedule);
	});

	it('fills in fixed weekday order regardless of key order', () => {
		const forward = makeSchedule(
			Object.fromEntries(weekdays.map((weekday) => [weekday, [auto()]]))
		);
		const reversed = Object.fromEntries(
			[...weekdays].reverse().map((weekday) => [weekday, [auto()]])
		) as Schedule;
		const sevenDishes = ['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((name) => ({ name }));
		const result = fill(sevenDishes, reversed);
		expect(result.monday).toEqual([planned('A')]);
		expect(result.sunday).toEqual([planned('G')]);
		expect(result).toEqual(fill(sevenDishes, forward));
		expect(Object.keys(result)).toEqual([...weekdays]);
	});

	it('works on the sample data with shuffled dishes', () => {
		const dataSet = loadDataSet();
		for (const [, template] of Object.entries(dataSet.templates)) {
			for (const seed of [1, 2, 3]) {
				const result = fill(shuffle(dataSet.dishes, seed), template);
				weekdays.forEach((weekday) =>
					result[weekday].forEach((meal, index) => {
						const original = template[weekday][index];
						if (original?.type !== 'auto' || meal.type !== 'planned') return;
						const dish = dataSet.dishes.find((candidate) => candidate.name === meal.name);
						expect(dish && isDishAcceptable(dish, original)).toBe(true);
					})
				);
			}
		}
	});

	it('counts cells it could not fill', () => {
		const schedule = makeSchedule({ monday: [auto(), auto()], tuesday: [auto(), planned('X')] });
		expect(planMeals([{ name: 'Rösti' }], schedule).unfilledCount).toBe(2);
		expect(planMeals(dishes, schedule).unfilledCount).toBe(0);
	});

	it('leaves manual cells untouched and does not suggest their dish again', () => {
		const manual: PlanMeal = { type: 'manual', name: 'Pizza' };
		const schedule = makePlan({ monday: [manual, auto()] });
		const result = fill([{ name: 'Pizza' }, { name: 'Rösti' }], schedule);
		expect(result.monday).toEqual([manual, planned('Rösti')]);
	});

	it('a second run fills only cells that are still auto', () => {
		const schedule = makeSchedule({ monday: [auto(), auto(['lea'])] });
		const first = fill([{ name: 'Rösti' }], schedule);
		const second = fill([{ name: 'Curry', nogos: ['lea'] }, { name: 'Pizza' }], first);
		expect(second.monday).toEqual([planned('Rösti'), planned('Curry')]);
	});
});

describe('runPlanner', () => {
	const schedule = makeSchedule(
		Object.fromEntries(weekdays.map((weekday) => [weekday, [auto(), auto()]]))
	);

	it('never uses excluded dishes', () => {
		for (const seed of [1, 2, 3, 4, 5]) {
			const names = plannedNamesInOrder(
				runPlanner(dishes, new Set(['Pizza', 'Lasagne']), schedule, seed).schedule
			);
			expect(names).not.toContain('Pizza');
			expect(names).not.toContain('Lasagne');
		}
	});

	it('is deterministic for a seed', () => {
		expect(runPlanner(dishes, new Set(), schedule, 9)).toEqual(
			runPlanner(dishes, new Set(), schedule, 9)
		);
	});
});
