import { describe, expect, it } from 'vitest';
import { excludeDish, filterIncludedDishes, includeDish } from './inclusion';

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
