import { describe, expect, it } from 'vitest';
import { selectDataSource } from './data-source';
import { DataValidationError, validateDataSet } from './validate';

const sample = {
	'../../data/family.json': ['sample family'],
	'../../data/dishes.json': ['sample dishes'],
	'../../data/templates.json': { sample: true }
};

describe('selectDataSource', () => {
	it('uses the sample data when there is no local data', () => {
		const source = selectDataSource({}, sample);
		expect(source.directory).toBe('src/data');
		expect(source.files['family.json']).toEqual(['sample family']);
	});

	it('prefers complete local data', () => {
		const local = {
			'../../data-local/family.json': ['real family'],
			'../../data-local/dishes.json': [],
			'../../data-local/templates.json': {}
		};
		const source = selectDataSource(local, sample);
		expect(source.directory).toBe('src/data-local');
		expect(source.files['family.json']).toEqual(['real family']);
	});

	it('rejects incomplete local data and names the missing files', () => {
		const local = { '../../data-local/family.json': [] };
		expect(() => selectDataSource(local, sample)).toThrow(
			'src/data-local: missing dishes.json, templates.json'
		);
	});

	it('ignores unrelated JSON files in the local folder', () => {
		expect(selectDataSource({ '../../data-local/notes.json': {} }, sample).directory).toBe(
			'src/data'
		);
	});
});

describe('validateDataSet with a directory', () => {
	it('names the folder in the error', () => {
		const files = {
			'family.json': [{ id: 'a', name: 'A' }],
			'dishes.json': [{ name: 'S', nogos: ['z'] }],
			'templates.json': {}
		};
		expect(() => validateDataSet(files, 'src/data-local')).toThrow(DataValidationError);
		expect(() => validateDataSet(files, 'src/data-local')).toThrow(
			'src/data-local/dishes.json: [0].nogos[0]: unknown family id "z"'
		);
	});
});
