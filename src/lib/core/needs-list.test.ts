import { describe, expect, it } from 'vitest';
import type { Dish } from '#lib/data/types.ts';
import { needsList, needsListText, normalizeIngredient } from './needs-list';
import { overrideCell } from './schedule';
import { auto, makePlan, makeSchedule, manual, planned } from './test-helpers';

const dishes: Dish[] = [
	{ name: 'Pizza', ingredients: ['Mehl', 'Mozzarella', 'Zwiebeln'] },
	{ name: 'Rösti', ingredients: ['Kartoffeln', '  zwiebeln ', 'Butter'] },
	{ name: 'Suppe', ingredients: ['Lauch', 'Äpfel'] },
	{ name: 'Resten' }
];

describe('normalizeIngredient', () => {
	it('trims, collapses whitespace and lowercases', () => {
		expect(normalizeIngredient('  Passierte   Tomaten ')).toBe('passierte tomaten');
		expect(normalizeIngredient('ÄPFEL')).toBe('äpfel');
	});
});

describe('needsList', () => {
	it('lists an ingredient used in several meals once, first spelling wins', () => {
		const schedule = makeSchedule({ monday: [planned('Pizza')], tuesday: [planned('Rösti')] });
		expect(needsList(schedule, dishes)).toEqual([
			'Butter',
			'Kartoffeln',
			'Mehl',
			'Mozzarella',
			'Zwiebeln'
		]);
	});

	it('first seen follows weekday order, not key order', () => {
		const schedule = makeSchedule({ tuesday: [planned('Pizza')], monday: [planned('Rösti')] });
		expect(needsList(schedule, dishes)).toContain('zwiebeln');
		expect(needsList(schedule, dishes)).not.toContain('Zwiebeln');
	});

	it('counts fixed, planned and manual meals', () => {
		const schedule = makePlan({
			monday: [planned('Pizza'), manual('Suppe')]
		});
		expect(needsList(schedule, dishes)).toEqual(expect.arrayContaining(['Mehl', 'Lauch', 'Äpfel']));
	});

	it('ignores auto cells, free text and dishes without ingredients', () => {
		const schedule = makeSchedule({
			monday: [auto(), planned('Restaurant'), planned('Resten')]
		});
		expect(needsList(schedule, dishes)).toEqual([]);
	});

	it('matches dish names exactly', () => {
		expect(needsList(makeSchedule({ monday: [planned('pizza')] }), dishes)).toEqual([]);
	});

	it('adds a duplicated dish only once', () => {
		const schedule = makeSchedule({ monday: [planned('Suppe'), planned('Suppe')] });
		expect(needsList(schedule, dishes)).toEqual(['Äpfel', 'Lauch']);
	});

	it('sorts German words in place', () => {
		const schedule = makeSchedule({ monday: [planned('Suppe'), planned('Pizza')] });
		expect(needsList(schedule, dishes)).toEqual([
			'Äpfel',
			'Lauch',
			'Mehl',
			'Mozzarella',
			'Zwiebeln'
		]);
	});

	it('changes when the plan changes', () => {
		const template = makeSchedule({ monday: [auto()] });
		const before = needsList(template, dishes);
		const after = needsList(
			overrideCell(template, template, { weekday: 'monday', index: 0 }, 'Suppe'),
			dishes
		);
		expect(before).toEqual([]);
		expect(after).toEqual(['Äpfel', 'Lauch']);
	});

	it('does not mutate its inputs', () => {
		const schedule = makeSchedule({ monday: [planned('Rösti')] });
		const scheduleBefore = structuredClone(schedule);
		const dishesBefore = structuredClone(dishes);
		needsList(schedule, dishes);
		expect(schedule).toEqual(scheduleBefore);
		expect(dishes).toEqual(dishesBefore);
	});
});

describe('needsListText', () => {
	it('puts one ingredient per line', () => {
		expect(needsListText(['Butter', 'Mehl'])).toBe('Butter\nMehl');
		expect(needsListText([])).toBe('');
	});
});
