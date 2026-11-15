import { describe, expect, it } from 'vitest';
import { loadDataSet } from './loader';
import { DataValidationError, validateDataSet, type RawDataFiles } from './validate';

function emptyWeek(): Record<string, unknown[]> {
	return {
		monday: [],
		tuesday: [],
		wednesday: [],
		thursday: [],
		friday: [],
		saturday: [],
		sunday: []
	};
}

function validFiles(): RawDataFiles {
	return {
		'family.json': [
			{ id: 'anna', name: 'Anna' },
			{ id: 'ben', name: 'Ben' }
		],
		'dishes.json': [{ name: 'Suppe', ingredients: ['Wasser'], nogos: ['ben'] }, { name: 'Brot' }],
		'templates.json': {
			Woche: {
				...emptyWeek(),
				monday: [
					{ type: 'auto', label: 'Zmittag', absences: ['ben'] },
					{ type: 'planned', name: 'Pizza' }
				]
			}
		}
	};
}

function expectProblem(files: RawDataFiles, file: string, fragment: string): void {
	try {
		validateDataSet(files);
	} catch (error) {
		expect(error).toBeInstanceOf(DataValidationError);
		const validationError = error as DataValidationError;
		expect(validationError.file).toBe(file);
		expect(validationError.message).toContain(file);
		expect(validationError.message).toContain(fragment);
		return;
	}
	throw new Error('expected validation to fail');
}

describe('validateDataSet', () => {
	it('accepts valid data', () => {
		const dataSet = validateDataSet(validFiles());
		expect(dataSet.family).toHaveLength(2);
		expect(dataSet.dishes).toHaveLength(2);
		expect(Object.keys(dataSet.templates)).toEqual(['Woche']);
	});

	it('accepts the bundled sample data', () => {
		const dataSet = loadDataSet();
		expect(dataSet.family.length).toBeGreaterThanOrEqual(3);
		expect(dataSet.dishes.length).toBeGreaterThanOrEqual(12);
		expect(Object.keys(dataSet.templates).length).toBeGreaterThanOrEqual(2);
	});

	it('rejects an unknown family id in nogos', () => {
		const files = validFiles();
		files['dishes.json'] = [{ name: 'Suppe', nogos: ['zoe'] }];
		expectProblem(files, 'dishes.json', '[0].nogos[0]: unknown family id "zoe"');
	});

	it('rejects an unknown family id in absences', () => {
		const files = validFiles();
		files['templates.json'] = {
			Woche: { ...emptyWeek(), friday: [{ type: 'auto', absences: ['anna', 'zoe'] }] }
		};
		expectProblem(files, 'templates.json', 'Woche.friday[0].absences[1]: unknown family id "zoe"');
	});

	it('rejects duplicate ids within one list', () => {
		const files = validFiles();
		files['dishes.json'] = [{ name: 'Suppe', nogos: ['ben', 'ben'] }];
		expectProblem(files, 'dishes.json', 'duplicate family id "ben"');
	});

	it('rejects duplicate family ids', () => {
		const files = validFiles();
		files['family.json'] = [
			{ id: 'anna', name: 'Anna' },
			{ id: 'anna', name: 'Annina' }
		];
		expectProblem(files, 'family.json', 'duplicate family id "anna"');
	});

	it('rejects duplicate dish names', () => {
		const files = validFiles();
		files['dishes.json'] = [{ name: 'Suppe' }, { name: 'Suppe' }];
		expectProblem(files, 'dishes.json', 'duplicate dish name "Suppe"');
	});

	it('rejects a missing weekday', () => {
		const files = validFiles();
		const week = emptyWeek();
		delete week.sunday;
		files['templates.json'] = { Woche: week };
		expectProblem(files, 'templates.json', 'Woche.sunday: missing weekday');
	});

	it('rejects a wrong type', () => {
		const files = validFiles();
		files['dishes.json'] = [{ name: 'Suppe', ingredients: 'Wasser' }];
		expectProblem(files, 'dishes.json', '[0].ingredients');
	});

	it('rejects an unknown meal type', () => {
		const files = validFiles();
		files['templates.json'] = { Woche: { ...emptyWeek(), monday: [{ type: 'fixed' }] } };
		expectProblem(files, 'templates.json', 'Woche.monday[0]');
	});

	it('rejects unknown keys such as a misspelled field', () => {
		const files = validFiles();
		files['templates.json'] = {
			Woche: { ...emptyWeek(), monday: [{ type: 'auto', absent: ['ben'] }] }
		};
		expectProblem(files, 'templates.json', 'absent');
	});

	it('rejects a planned meal without a name', () => {
		const files = validFiles();
		files['templates.json'] = { Woche: { ...emptyWeek(), monday: [{ type: 'planned' }] } };
		expectProblem(files, 'templates.json', 'Woche.monday[0].name');
	});

	it('rejects blank names', () => {
		const files = validFiles();
		files['family.json'] = [{ id: 'anna', name: '  ' }];
		expectProblem(files, 'family.json', '[0].name: must not be blank');
	});

	it('rejects a file that is not an array', () => {
		const files = validFiles();
		files['family.json'] = { anna: 'Anna' };
		expectProblem(files, 'family.json', 'expected array');
	});
});
