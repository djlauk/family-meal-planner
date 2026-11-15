import type { z } from 'zod';
import type {
	autoMealSchema,
	dishSchema,
	familyMemberSchema,
	mealSchema,
	plannedMealSchema,
	scheduleSchema,
	weekdays
} from './schemas';

export { weekdays } from './schemas';

export type FamilyMember = z.infer<typeof familyMemberSchema>;
export type Family = FamilyMember[];
export type Dish = z.infer<typeof dishSchema>;
export type AutoMeal = z.infer<typeof autoMealSchema>;
export type PlannedMeal = z.infer<typeof plannedMealSchema>;
export type Meal = z.infer<typeof mealSchema>;
export type Weekday = (typeof weekdays)[number];
export type Schedule = z.infer<typeof scheduleSchema>;

/**
 * Runtime only: a cell the user set by hand. Never appears in JSON, so the
 * schemas do not know it. `Plan` is the working copy of a template.
 */
export type ManualMeal = { type: 'manual'; label?: string; name: string };
export type PlanMeal = Meal | ManualMeal;
export type Plan = Record<Weekday, PlanMeal[]>;

export type FullDataSet = {
	family: Family;
	dishes: Dish[];
	templates: Record<string, Schedule>;
};
