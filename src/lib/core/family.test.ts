import { describe, expect, it } from 'vitest';
import { memberNames } from './family';

const family = [
	{ id: 'lea', name: 'Lea' },
	{ id: 'nico', name: 'Nico' }
];

describe('memberNames', () => {
	it('maps ids to names in order', () => {
		expect(memberNames(family, ['nico', 'lea'])).toEqual(['Nico', 'Lea']);
	});

	it('returns an empty list for missing ids', () => {
		expect(memberNames(family, undefined)).toEqual([]);
	});

	it('falls back to the id when unknown', () => {
		expect(memberNames(family, ['zoe'])).toEqual(['zoe']);
	});
});
