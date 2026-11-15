import dishesFile from '../../data/dishes.json';
import familyFile from '../../data/family.json';
import templatesFile from '../../data/templates.json';
import type { FullDataSet } from './types';
import { validateDataSet } from './validate';

// The JSON is bundled at build time. Validation runs during prerendering,
// so broken data fails the build instead of shipping.
export function loadDataSet(): FullDataSet {
	return validateDataSet({
		'family.json': familyFile,
		'dishes.json': dishesFile,
		'templates.json': templatesFile
	});
}
