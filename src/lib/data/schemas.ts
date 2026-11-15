import { z } from 'zod';

// Day order is defined here once. Never derive it from object key order.
export const weekdays = [
	'monday',
	'tuesday',
	'wednesday',
	'thursday',
	'friday',
	'saturday',
	'sunday'
] as const;

const nonBlankString = z.string().refine((value) => value.trim() !== '', 'must not be blank');

// Strict objects reject unknown keys, so a typo like "absent" fails loudly
// instead of being silently ignored.
export const familyMemberSchema = z.strictObject({
	id: nonBlankString,
	name: nonBlankString
});

export const familySchema = z.array(familyMemberSchema);

export const dishSchema = z.strictObject({
	name: nonBlankString,
	ingredients: z.array(nonBlankString).optional(),
	nogos: z.array(nonBlankString).optional()
});

export const dishesSchema = z.array(dishSchema);

export const autoMealSchema = z.strictObject({
	type: z.literal('auto'),
	label: nonBlankString.optional(),
	absences: z.array(nonBlankString).optional()
});

export const plannedMealSchema = z.strictObject({
	type: z.literal('planned'),
	label: nonBlankString.optional(),
	name: nonBlankString
});

export const mealSchema = z.discriminatedUnion('type', [autoMealSchema, plannedMealSchema]);

const mealListSchema = z.array(mealSchema, {
	error: (issue) => (issue.input === undefined ? 'missing weekday' : undefined)
});

export const scheduleSchema = z.strictObject({
	monday: mealListSchema,
	tuesday: mealListSchema,
	wednesday: mealListSchema,
	thursday: mealListSchema,
	friday: mealListSchema,
	saturday: mealListSchema,
	sunday: mealListSchema
});

export const templatesSchema = z.record(z.string(), scheduleSchema);
