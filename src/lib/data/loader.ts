import { selectDataSource } from './data-source';
import type { FullDataSet } from './types';
import { validateDataSet } from './validate';

// Vite resolves these globs at build time; a missing folder simply yields {}.
// `src/data-local/` is git-ignored and holds the real family data.
const localModules = import.meta.glob('../../data-local/*.json', {
	eager: true,
	import: 'default'
});
const sampleModules = import.meta.glob('../../data/*.json', { eager: true, import: 'default' });

// Validation runs during prerendering, so broken data fails the build.
export function loadDataSet(): FullDataSet {
	const source = selectDataSource(localModules, sampleModules);
	return validateDataSet(source.files, source.directory);
}
