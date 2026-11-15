import type { Family } from '#lib/data/types.ts';

/** Display names for ids, in the given order. Unknown ids show as-is. */
export function memberNames(family: Family, ids: readonly string[] | undefined): string[] {
	const namesById = new Map(family.map((member) => [member.id, member.name]));
	return (ids ?? []).map((id) => namesById.get(id) ?? id);
}
