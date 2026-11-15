import { describe, expect, it } from 'vitest';
import { createRandom, shuffle } from './shuffle';

const items = Array.from({ length: 20 }, (_, index) => `item-${index}`);

describe('createRandom', () => {
	it('returns values in [0, 1)', () => {
		const random = createRandom(42);
		for (let count = 0; count < 1000; count++) {
			const value = random();
			expect(value).toBeGreaterThanOrEqual(0);
			expect(value).toBeLessThan(1);
		}
	});

	it('repeats the sequence for the same seed', () => {
		const first = createRandom(7);
		const second = createRandom(7);
		for (let count = 0; count < 10; count++) expect(first()).toBe(second());
	});
});

describe('shuffle', () => {
	it('gives the same order for the same seed', () => {
		expect(shuffle(items, 123)).toEqual(shuffle(items, 123));
	});

	it('usually gives different orders for different seeds', () => {
		const orders = new Set(Array.from({ length: 10 }, (_, seed) => shuffle(items, seed).join(',')));
		expect(orders.size).toBeGreaterThan(8);
	});

	it('keeps all items', () => {
		expect([...shuffle(items, 99)].sort()).toEqual([...items].sort());
	});

	it('does not mutate the input', () => {
		const input = [...items];
		shuffle(input, 5);
		expect(input).toEqual(items);
	});

	it('handles empty and single-item lists', () => {
		expect(shuffle([], 1)).toEqual([]);
		expect(shuffle(['only'], 1)).toEqual(['only']);
	});
});
