import type { DataFileName, RawDataFiles } from './validate';

export const dataFileNames: readonly DataFileName[] = [
	'family.json',
	'dishes.json',
	'templates.json'
];

export const sampleDirectory = 'src/data';
export const localDirectory = 'src/data-local';

export type DataSource = { directory: string; files: RawDataFiles };

/** Maps glob results like "../../data/family.json" to their file names. */
function byFileName(modules: Readonly<Record<string, unknown>>): Map<string, unknown> {
	return new Map(
		Object.entries(modules).map(([path, content]) => [path.split('/').at(-1) ?? path, content])
	);
}

/**
 * Real family data lives in the untracked `src/data-local/`. If that folder
 * holds any data file, it must hold all three: mixing real and sample files
 * would only produce confusing id errors. Without it, the sample data is used.
 */
export function selectDataSource(
	localModules: Readonly<Record<string, unknown>>,
	sampleModules: Readonly<Record<string, unknown>>
): DataSource {
	const local = byFileName(localModules);
	const localNames = dataFileNames.filter((name) => local.has(name));
	if (localNames.length === 0) {
		return { directory: sampleDirectory, files: pick(byFileName(sampleModules), sampleDirectory) };
	}
	if (localNames.length < dataFileNames.length) {
		const missing = dataFileNames.filter((name) => !local.has(name));
		throw new Error(
			`${localDirectory}: missing ${missing.join(', ')}. Provide all three data files or remove the folder.`
		);
	}
	return { directory: localDirectory, files: pick(local, localDirectory) };
}

function pick(modules: Map<string, unknown>, directory: string): RawDataFiles {
	const files = {} as RawDataFiles;
	for (const name of dataFileNames) {
		if (!modules.has(name)) throw new Error(`${directory}: missing ${name}`);
		files[name] = modules.get(name);
	}
	return files;
}
