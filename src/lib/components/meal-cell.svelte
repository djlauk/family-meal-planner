<script lang="ts">
	import type { CellState } from '#lib/core/schedule.ts';
	import type { PlanMeal } from '#lib/data/types.ts';
	import { strings } from '#lib/i18n/de-CH.ts';

	let {
		meal,
		state,
		place,
		absentNames,
		dishNames,
		excluded,
		onOverride,
		onClear
	}: {
		meal: PlanMeal;
		state: CellState;
		place: string;
		absentNames: string[];
		dishNames: string[];
		excluded: ReadonlySet<string>;
		onOverride: (dishName: string) => void;
		onClear: () => void;
	} = $props();
</script>

<div class="cell {state}">
	<div class="head">
		{#if meal.label}<span class="label">{meal.label}</span>{/if}
		<span class="state">{strings.cell.states[state]}</span>
	</div>

	{#if meal.type !== 'auto'}
		<p class="name">{meal.name}</p>
	{/if}

	{#if absentNames.length > 0}
		<p class="muted">{strings.cell.absent}: {absentNames.join(', ')}</p>
	{/if}

	{#if state !== 'fixed'}
		<div class="actions">
			<select
				aria-label={strings.cell.chooseFor(place)}
				// Shows the current manual choice instead of resetting. Browsers fire
				// `change` on every arrow key in a closed select; a reset would jump
				// back to the top on each step and make keyboard choice impossible.
				value={meal.type === 'manual' ? meal.name : ''}
				onchange={(event) => {
					const dishName = event.currentTarget.value;
					if (dishName !== '') onOverride(dishName);
				}}
			>
				<option value="">{strings.cell.choose}</option>
				{#each dishNames as dishName (dishName)}
					<option value={dishName}>
						{dishName}{excluded.has(dishName) ? ` ${strings.cell.excludedSuffix}` : ''}
					</option>
				{/each}
			</select>
			{#if state === 'planned'}
				<button type="button" onclick={onClear}>{strings.cell.discard}</button>
			{:else if state === 'manual'}
				<button type="button" onclick={onClear}>{strings.cell.remove}</button>
			{/if}
		</div>
	{/if}
</div>

<style>
	.cell {
		min-width: 0;
		display: grid;
		gap: var(--space-1);
		padding: var(--space-2);
		border-radius: var(--radius-small);
		border-inline-start: 4px solid transparent;
		font-size: var(--font-size-small);
	}

	.fixed {
		background: var(--color-fixed-soft);
	}

	.auto {
		background: var(--color-surface);
		border-inline-start-color: var(--color-border);
		border-style: dashed;
	}

	.planned {
		background: var(--color-accent-soft);
		border-inline-start-color: var(--color-accent);
	}

	.manual {
		background: var(--color-manual-soft);
		border-inline-start-color: var(--color-manual);
	}

	.head {
		display: flex;
		justify-content: space-between;
		gap: var(--space-2);
	}

	.label {
		font-weight: 600;
	}

	.state {
		color: var(--color-text-muted);
	}

	.name {
		font-size: var(--font-size-base);
	}

	.muted {
		color: var(--color-text-muted);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	/* A select is as wide as its longest option; let it shrink to the cell. */
	select {
		flex: 1 1 8rem;
		width: 100%;
		min-width: 0;
	}
</style>
