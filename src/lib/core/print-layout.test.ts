import { describe, expect, it } from 'vitest';
import { weekdays } from '#lib/data/types.ts';
import { printDayPairs, printRows } from './print-layout';
import { auto, makeSchedule, planned } from './test-helpers';

describe('printDayPairs', () => {
	it('covers every weekday exactly once', () => {
		const days = printDayPairs.flat().filter((day) => day !== undefined);
		expect([...days].sort()).toEqual([...weekdays].sort());
	});
});

describe('printRows', () => {
	it('pairs days into blocks with a heading row each', () => {
		const rows = printRows(makeSchedule());
		expect(rows).toHaveLength(4);
		expect(rows.every((row) => row.startsBlock)).toBe(true);
		expect(rows[0]).toMatchObject({
			left: { kind: 'heading', weekday: 'monday' },
			right: { kind: 'heading', weekday: 'friday' }
		});
		expect(rows[3]).toMatchObject({
			left: { kind: 'heading', weekday: 'thursday' },
			right: { kind: 'empty' }
		});
	});

	it('pads the shorter day on the right', () => {
		const rows = printRows(
			makeSchedule({ tuesday: [planned('A'), auto(), auto()], saturday: [planned('B'), auto()] })
		);
		const tuesdayBlock = rows.slice(1, 5);
		expect(tuesdayBlock[0]?.left).toEqual({ kind: 'heading', weekday: 'tuesday' });
		expect(tuesdayBlock.slice(1).map((row) => row.right.kind)).toEqual(['meal', 'meal', 'empty']);
		expect(tuesdayBlock.slice(1).map((row) => row.left.kind)).toEqual(['meal', 'meal', 'meal']);
	});

	it('pads the shorter day on the left', () => {
		const rows = printRows(
			makeSchedule({ monday: [planned('A')], friday: [planned('B'), planned('C')] })
		);
		expect(rows.slice(0, 3).map((row) => [row.left.kind, row.right.kind])).toEqual([
			['heading', 'heading'],
			['meal', 'meal'],
			['empty', 'meal']
		]);
	});

	it('lists Thursday meals with an empty right side', () => {
		const rows = printRows(makeSchedule({ thursday: [planned('Pizza')] }));
		expect(rows.at(-1)).toEqual({
			left: { kind: 'meal', meal: planned('Pizza') },
			right: { kind: 'empty' },
			startsBlock: false
		});
	});

	it('keeps meal order within a day', () => {
		const rows = printRows(makeSchedule({ monday: [planned('A'), planned('B')] }));
		expect(rows.slice(1, 3).map((row) => row.left)).toEqual([
			{ kind: 'meal', meal: planned('A') },
			{ kind: 'meal', meal: planned('B') }
		]);
	});
});
