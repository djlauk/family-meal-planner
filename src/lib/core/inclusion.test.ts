import { describe, expect, it } from 'vitest';
import {
	excludeDish,
	filterIncludedDishes,
	includeAllDishes,
	includeDish,
	setDishIncluded
} from './inclusion';

const dishes = [{ name: 'Pizza' }, { name: 'Rösti' }, { name: 'Curry' }];

describe('inclusion', () => {
	it('filters out excluded dishes and keeps order', () => {
		expect(filterIncludedDishes(dishes, new Set(['Rösti']))).toEqual([
			{ name: 'Pizza' },
			{ name: 'Curry' }
		]);
	});

	it('keeps all dishes when nothing is excluded', () => {
		expect(filterIncludedDishes(dishes, new Set())).toEqual(dishes);
	});

	it('excludeDish and includeDish return new sets', () => {
		const original = new Set(['Pizza']);
		const added = excludeDish(original, 'Curry');
		expect([...added]).toEqual(['Pizza', 'Curry']);
		expect([...includeDish(added, 'Pizza')]).toEqual(['Curry']);
		expect([...original]).toEqual(['Pizza']);
	});
});

describe('toggles', () => {
	it('setDishIncluded adds and removes exclusions', () => {
		const off = setDishIncluded(new Set(), 'Pizza', false);
		expect([...off]).toEqual(['Pizza']);
		expect([...setDishIncluded(off, 'Pizza', true)]).toEqual([]);
	});

	it('includeAllDishes clears all exclusions', () => {
		expect(includeAllDishes().size).toBe(0);
	});
});
