import type { Weekday } from '#lib/data/types.ts';

export const strings = {
	pageTitle: 'Familien-Menüplan',
	sections: {
		family: 'Familie',
		dishes: 'Gerichte',
		templates: 'Vorlagen'
	},
	dish: {
		ingredients: 'Zutaten',
		noIngredients: 'Keine Zutaten erfasst',
		nogos: 'Mag nicht',
		noNogos: 'Für alle'
	},
	meal: {
		fixed: 'fix',
		auto: 'frei',
		absent: 'Abwesend',
		noMeals: 'Keine Mahlzeiten'
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
