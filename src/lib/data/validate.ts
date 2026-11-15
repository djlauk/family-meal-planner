import type { z } from 'zod';
import { dishesSchema, familySchema, templatesSchema, weekdays } from './schemas';
import type { Dish, Family, FullDataSet, Schedule } from './types';

export type DataFileName = 'family.json' | 'dishes.json' | 'templates.json';

export type RawDataFiles = Record<DataFileName, unknown>;

export class DataValidationError extends Error {
	readonly file: DataFileName;
	readonly problems: readonly string[];

	constructor(file: DataFileName, problems: readonly string[]) {
		super(`${file}: ${problems.join(`\n${file}: `)}`);
		this.name = 'DataValidationError';
		this.file = file;
		this.problems = problems;
	}
}

type PathSegment = PropertyKey;

// Renders a Zod path as `Schulwoche.friday[1].absences[0]`.
function formatPath(path: readonly PathSegment[]): string {
	return path.reduce<string>((text, segment) => {
		if (typeof segment === 'number') return `${text}[${segment}]`;
		const key = String(segment);
		return text === '' ? key : `${text}.${key}`;
	}, '');
}

function formatProblem(path: readonly PathSegment[], message: string): string {
	const location = formatPath(path);
	return location === '' ? message : `${location}: ${message}`;
}

function parseFile<Output>(file: DataFileName, schema: z.ZodType<Output>, input: unknown): Output {
	const result = schema.safeParse(input);
	if (!result.success) {
		const problems = result.error.issues.map((issue) => formatProblem(issue.path, issue.message));
		throw new DataValidationError(file, problems);
	}
	return result.data;
}

function findDuplicates(values: readonly string[]): string[] {
	const seen = new Set<string>();
	const duplicates = new Set<string>();
	for (const value of values) {
		if (seen.has(value)) duplicates.add(value);
		seen.add(value);
	}
	return [...duplicates];
}

function checkIdList(
	path: readonly PathSegment[],
	ids: readonly string[] | undefined,
	knownIds: ReadonlySet<string>
): string[] {
	if (ids === undefined) return [];
	const unknown = ids.flatMap((id, index) =>
		knownIds.has(id) ? [] : [formatProblem([...path, index], `unknown family id "${id}"`)]
	);
	const duplicates = findDuplicates(ids).map((id) =>
		formatProblem(path, `duplicate family id "${id}"`)
	);
	return [...unknown, ...duplicates];
}

function checkFamily(family: Family): string[] {
	return findDuplicates(family.map((member) => member.id)).map(
		(id) => `duplicate family id "${id}"`
	);
}

function checkDishes(dishes: readonly Dish[], knownIds: ReadonlySet<string>): string[] {
	const duplicateNames = findDuplicates(dishes.map((dish) => dish.name)).map(
		(name) => `duplicate dish name "${name}"`
	);
	const badNogos = dishes.flatMap((dish, index) =>
		checkIdList([index, 'nogos'], dish.nogos, knownIds)
	);
	return [...duplicateNames, ...badNogos];
}

function checkTemplates(
	templates: Readonly<Record<string, Schedule>>,
	knownIds: ReadonlySet<string>
): string[] {
	return Object.entries(templates).flatMap(([templateName, schedule]) =>
		weekdays.flatMap((weekday) =>
			schedule[weekday].flatMap((meal, index) =>
				meal.type === 'auto'
					? checkIdList([templateName, weekday, index, 'absences'], meal.absences, knownIds)
					: []
			)
		)
	);
}

function throwIfAny(file: DataFileName, problems: readonly string[]): void {
	if (problems.length > 0) throw new DataValidationError(file, problems);
}

/**
 * Validates the three data files. Throws a DataValidationError naming the
 * first file that has problems, with every problem found in that file.
 */
export function validateDataSet(files: RawDataFiles): FullDataSet {
	const family = parseFile('family.json', familySchema, files['family.json']);
	throwIfAny('family.json', checkFamily(family));
	const knownIds = new Set(family.map((member) => member.id));

	const dishes = parseFile('dishes.json', dishesSchema, files['dishes.json']);
	throwIfAny('dishes.json', checkDishes(dishes, knownIds));

	const templates = parseFile('templates.json', templatesSchema, files['templates.json']);
	throwIfAny('templates.json', checkTemplates(templates, knownIds));

	return { family, dishes, templates };
}
