import { describe, expect, it } from 'vitest';
// `?raw` makes Vite import the file as text, so the test follows any edit
// to the colour tokens without needing Node's file API.
import css from './app.css?raw';

function tokensIn(block: string): Map<string, string> {
	return new Map(
		[...block.matchAll(/--(color-[a-z-]+):\s*(#[0-9a-f]{6})/gi)].map((match) => [
			match[1] ?? '',
			match[2] ?? ''
		])
	);
}

function blockAfter(marker: string): string {
	const start = css.indexOf(marker);
	if (start === -1) throw new Error(`marker not found: ${marker}`);
	return css.slice(start, css.indexOf('}', start));
}

const light = tokensIn(blockAfter(':root {'));
const dark = new Map([...light, ...tokensIn(blockAfter('@media (prefers-color-scheme: dark)'))]);

// WCAG 2 relative luminance and contrast ratio.
function luminance(hex: string): number {
	const channels = [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255);
	const [red, green, blue] = channels.map((value) =>
		value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
	) as [number, number, number];
	return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(first: string, second: string): number {
	const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a) as [
		number,
		number
	];
	return (lighter + 0.05) / (darker + 0.05);
}

// Text token on background token, as used in the components.
const textPairs: [string, string][] = [
	['color-text', 'color-background'],
	['color-text', 'color-surface'],
	['color-text-muted', 'color-background'],
	['color-text-muted', 'color-surface'],
	['color-text', 'color-fixed-soft'],
	['color-text-muted', 'color-fixed-soft'],
	['color-text', 'color-accent-soft'],
	['color-text-muted', 'color-accent-soft'],
	['color-text', 'color-manual-soft'],
	['color-text-muted', 'color-manual-soft'],
	['color-accent', 'color-surface'],
	['color-accent', 'color-background'],
	['color-on-accent', 'color-accent']
];

describe('theme contrast (WCAG AA, 4.5:1 for text)', () => {
	it('computes known ratios', () => {
		expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 0);
		expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 5);
	});

	for (const [themeName, tokens] of [
		['light', light],
		['dark', dark]
	] as const) {
		for (const [foreground, background] of textPairs) {
			it(`${themeName}: ${foreground} on ${background}`, () => {
				const foregroundColor = tokens.get(foreground);
				const backgroundColor = tokens.get(background);
				expect(foregroundColor, foreground).toBeDefined();
				expect(backgroundColor, background).toBeDefined();
				expect(contrastRatio(foregroundColor ?? '', backgroundColor ?? '')).toBeGreaterThanOrEqual(
					4.5
				);
			});
		}
	}

	it('borders of the manual and planned markers are visible on the surface (3:1)', () => {
		for (const tokens of [light, dark]) {
			for (const marker of ['color-accent', 'color-manual']) {
				expect(
					contrastRatio(tokens.get(marker) ?? '', tokens.get('color-surface') ?? '')
				).toBeGreaterThanOrEqual(3);
			}
		}
	});
});
