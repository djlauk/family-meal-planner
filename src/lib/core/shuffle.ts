/**
 * mulberry32: a tiny 32-bit PRNG. Good enough to vary dish order, not for
 * anything security-related. Returns floats in [0, 1).
 */
export function createRandom(seed: number): () => number {
	// `>>> 0` and `| 0` force 32-bit integer arithmetic, which JS numbers lack.
	let state = seed >>> 0;
	return () => {
		state = (state + 0x6d2b79f5) | 0;
		let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
		mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
		return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
	};
}

/** Fisher–Yates on a copy. Same seed, same order. */
export function shuffle<Item>(items: readonly Item[], seed: number): Item[] {
	const random = createRandom(seed);
	const result = [...items];
	for (let index = result.length - 1; index > 0; index--) {
		const swapIndex = Math.floor(random() * (index + 1));
		const current = result[index] as Item;
		result[index] = result[swapIndex] as Item;
		result[swapIndex] = current;
	}
	return result;
}
