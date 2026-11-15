<script lang="ts">
	import { memberNames } from '#lib/core/family.ts';
	import { weekdays, type Family, type Schedule } from '#lib/data/types.ts';
	import { strings } from '#lib/i18n/de-CH.ts';

	let { schedule, family }: { schedule: Schedule; family: Family } = $props();
</script>

<ol class="week">
	{#each weekdays as weekday (weekday)}
		<li class="day">
			<h4>{strings.weekdays[weekday]}</h4>
			{#if schedule[weekday].length === 0}
				<p class="muted">{strings.meal.noMeals}</p>
			{:else}
				<ol class="meals">
					{#each schedule[weekday] as meal, index (index)}
						<li class={meal.type}>
							{#if meal.label}<span class="label">{meal.label}</span>{/if}
							{#if meal.type === 'planned'}
								<span>{meal.name}</span>
								<span class="tag">{strings.meal.fixed}</span>
							{:else}
								<span class="tag">{strings.meal.auto}</span>
								{#if meal.absences?.length}
									<span class="muted">
										{strings.meal.absent}: {memberNames(family, meal.absences).join(', ')}
									</span>
								{/if}
							{/if}
						</li>
					{/each}
				</ol>
			{/if}
		</li>
	{/each}
</ol>

<style>
	.week {
		display: grid;
		gap: var(--space-3);
		grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
	}

	.day {
		padding: var(--space-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-medium);
		background: var(--color-surface);
	}

	h4 {
		margin-block-end: var(--space-2);
	}

	.meals {
		display: grid;
		gap: var(--space-2);
	}

	.meals li {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1) var(--space-2);
		padding: var(--space-2);
		border-radius: var(--radius-small);
		font-size: var(--font-size-small);
	}

	.planned {
		background: var(--color-fixed-soft);
	}

	.auto {
		background: var(--color-accent-soft);
	}

	.label {
		font-weight: 600;
	}

	.tag {
		color: var(--color-accent);
		font-weight: 600;
	}

	.muted {
		color: var(--color-text-muted);
	}
</style>
