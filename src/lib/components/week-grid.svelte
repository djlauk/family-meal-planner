<script lang="ts">
	import { memberNames } from '#lib/core/family.ts';
	import { cellState, type CellRef } from '#lib/core/schedule.ts';
	import { weekdays, type Family, type Plan, type Schedule } from '#lib/data/types.ts';
	import { strings } from '#lib/i18n/de-CH.ts';
	import MealCell from './meal-cell.svelte';

	let {
		template,
		schedule,
		family,
		dishNames,
		excluded,
		onOverride,
		onClear
	}: {
		template: Schedule;
		schedule: Plan;
		family: Family;
		dishNames: string[];
		excluded: ReadonlySet<string>;
		onOverride: (cell: CellRef, dishName: string) => void;
		onClear: (cell: CellRef) => void;
	} = $props();
</script>

<ol class="week">
	{#each weekdays as weekday (weekday)}
		<li class="day">
			<h3>{strings.weekdays[weekday]}</h3>
			<ol class="meals">
				{#each schedule[weekday] as meal, index (index)}
					{@const cell = { weekday, index }}
					{@const templateMeal = template[weekday][index]}
					<li>
						<MealCell
							{meal}
							state={cellState(template, schedule, cell)}
							place={`${strings.weekdays[weekday]} ${meal.label ?? index + 1}`}
							absentNames={templateMeal?.type === 'auto'
								? memberNames(family, templateMeal.absences)
								: []}
							{dishNames}
							{excluded}
							onOverride={(dishName) => onOverride(cell, dishName)}
							onClear={() => onClear(cell)}
						/>
					</li>
				{/each}
			</ol>
		</li>
	{/each}
</ol>

<style>
	.week {
		display: grid;
		gap: var(--space-3);
		grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
	}

	.day {
		padding: var(--space-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-medium);
		background: var(--color-surface);
	}

	h3 {
		margin-block-end: var(--space-2);
	}

	.meals {
		display: grid;
		gap: var(--space-2);
	}
</style>
