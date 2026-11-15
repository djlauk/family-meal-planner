import type { Weekday } from '#lib/data/types.ts';
import type { CellState } from '#lib/core/schedule.ts';

export const strings = {
	pageTitle: 'Familien-Menüplan',
	plan: {
		heading: 'Wochenplan',
		template: 'Vorlage',
		run: 'Vorschläge erstellen',
		reset: 'Zurücksetzen',
		unfilled: (count: number) =>
			count === 1 ? '1 Mahlzeit ohne Vorschlag' : `${count} Mahlzeiten ohne Vorschlag`,
		allFilled: 'Alle freien Mahlzeiten haben einen Vorschlag.'
	},
	cell: {
		states: {
			fixed: 'fix',
			auto: 'frei',
			planned: 'Vorschlag',
			manual: 'gewählt'
		} satisfies Record<CellState, string>,
		absent: 'Abwesend',
		discard: 'Verwerfen',
		remove: 'Entfernen',
		choose: 'Gericht wählen …',
		chooseFor: (place: string) => `Gericht wählen für ${place}`,
		excludedSuffix: '(ausgeschlossen)'
	},
	dishes: {
		heading: 'Gerichte',
		hint: 'Nur aktivierte Gerichte werden vorgeschlagen.',
		includeAll: 'Alle aktivieren',
		excluded: 'ausgeschlossen',
		nogos: 'Mag nicht'
	},
	weekdays: {
		monday: 'Montag',
		tuesday: 'Dienstag',
		wednesday: 'Mittwoch',
		thursday: 'Donnerstag',
		friday: 'Freitag',
		saturday: 'Samstag',
		sunday: 'Sonntag'
	} satisfies Record<Weekday, string>
} as const;
