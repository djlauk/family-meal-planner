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

export type FullDataSet = {
	family: Family;
	dishes: Dish[];
	templates: Record<string, Schedule>;
};
