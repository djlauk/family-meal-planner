import { describe, expect, it } from 'vitest';
import { sortedDishNames } from './dishes';

describe('sortedDishNames', () => {
	it('sorts German names with umlauts in place', () => {
		const dishes = [{ name: 'Zopf' }, { name: 'Älplermagronen' }, { name: 'Bratwurst' }];
		expect(sortedDishNames(dishes)).toEqual(['Älplermagronen', 'Bratwurst', 'Zopf']);
	});

	it('does not mutate the input', () => {
		const dishes = [{ name: 'B' }, { name: 'A' }];
		sortedDishNames(dishes);
		expect(dishes.map((dish) => dish.name)).toEqual(['B', 'A']);
	});
});
