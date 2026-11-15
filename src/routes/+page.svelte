<script lang="ts">
	import DishToggleList from '#lib/components/dish-toggle-list.svelte';
	import TemplatePicker from '#lib/components/template-picker.svelte';
	import WeekGrid from '#lib/components/week-grid.svelte';
	import { sortedDishNames } from '#lib/core/dishes.ts';
	import NeedsList from '#lib/components/needs-list.svelte';
	import PrintSheet from '#lib/components/print-sheet.svelte';
	import { includeAllDishes, setDishIncluded } from '#lib/core/inclusion.ts';
	import { needsList } from '#lib/core/needs-list.ts';
	import { runPlanner } from '#lib/core/planner.ts';
	import {
		clearCellAndExclude,
		createPlan,
		overrideCell,
		type CellRef
	} from '#lib/core/schedule.ts';
	import { loadDataSet } from '#lib/data/loader.ts';
	import type { Plan } from '#lib/data/types.ts';
	import { strings } from '#lib/i18n/de-CH.ts';

	const dataSet = loadDataSet();
	const templateNames = Object.keys(dataSet.templates);
	const dishNames = sortedDishNames(dataSet.dishes);

	function templateFor(name: string) {
		const template = dataSet.templates[name];
		if (template === undefined) throw new Error(`unknown template "${name}"`);
		return template;
	}

	// All state lives here, in memory. A reload starts over by design.
	const initialTemplateName = templateNames[0] ?? '';
	let templateName = $state(initialTemplateName);
	// $state.raw: the value is replaced as a whole, never mutated, so Svelte
	// need not track it deeply. Core functions return new values anyway.
	let schedule = $state.raw<Plan>(createPlan(templateFor(initialTemplateName)));
	let excluded = $state.raw<ReadonlySet<string>>(includeAllDishes());
	// Count from the last Run; cleared by any later change so it never goes stale.
	let unfilledCount = $state<number | undefined>(undefined);

	const template = $derived(templateFor(templateName));
	const needs = $derived(needsList(schedule, dataSet.dishes));

	// The seed is created here, in the UI layer, so core/ stays deterministic.
	function createSeed(): number {
		return crypto.getRandomValues(new Uint32Array(1))[0] ?? 0;
	}

	function selectTemplate(name: string) {
		templateName = name;
		schedule = createPlan(templateFor(name));
		unfilledCount = undefined;
	}

	// Same as re-selecting the current template: plan back to the template, toggles kept.
	function reset() {
		selectTemplate(templateName);
	}

	function run() {
		const result = runPlanner(dataSet.dishes, excluded, schedule, createSeed());
		schedule = result.schedule;
		unfilledCount = result.unfilledCount;
	}

	function override(cell: CellRef, dishName: string) {
		schedule = overrideCell(schedule, template, cell, dishName);
		unfilledCount = undefined;
	}

	function clear(cell: CellRef) {
		const result = clearCellAndExclude(schedule, template, cell, excluded);
		schedule = result.schedule;
		excluded = result.excluded;
		unfilledCount = undefined;
	}
</script>

<svelte:head>
	<title>{strings.pageTitle}</title>
</svelte:head>

<main class="screen-only">
	<header>
		<h1>{strings.pageTitle}</h1>
		<div class="controls">
			<TemplatePicker {templateNames} selected={templateName} onSelect={selectTemplate} />
			<div class="buttons">
				<button type="button" class="primary" onclick={run}>{strings.plan.run}</button>
				<button type="button" onclick={reset}>{strings.plan.reset}</button>
				<button type="button" onclick={() => window.print()}>{strings.plan.print}</button>
			</div>
		</div>
		<p class="status" role="status">
			{#if unfilledCount !== undefined}
				{unfilledCount > 0 ? strings.plan.unfilled(unfilledCount) : strings.plan.allFilled}
			{/if}
		</p>
	</header>

	<div class="layout">
		<section class="plan">
			<h2>{strings.plan.heading}</h2>
			<WeekGrid
				{template}
				{schedule}
				family={dataSet.family}
				{dishNames}
				{excluded}
				onOverride={override}
				onClear={clear}
			/>
		</section>

		<div class="side">
			<section>
				<h2>{strings.needs.heading}</h2>
				<NeedsList items={needs} />
			</section>

			<section>
				<h2>{strings.dishes.heading}</h2>
				<DishToggleList
					dishes={dataSet.dishes}
					family={dataSet.family}
					{excluded}
					onToggle={(dishName, included) => {
						excluded = setDishIncluded(excluded, dishName, included);
					}}
					onIncludeAll={() => {
						excluded = includeAllDishes();
					}}
				/>
			</section>
		</div>
	</div>
</main>

<PrintSheet {templateName} {schedule} {needs} />

<style>
	main {
		display: grid;
		gap: var(--space-6);
		max-width: 90rem;
		margin-inline: auto;
		padding: var(--space-4);
	}

	header {
		display: grid;
		gap: var(--space-3);
	}

	.controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-3);
	}

	.buttons {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.status {
		min-height: calc(var(--line-height) * 1em);
		font-weight: 600;
	}

	/* minmax(0, …): grid tracks otherwise refuse to shrink below their
	   widest content (the selects), which made boxes overlap on phones. */
	.layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--space-6);
	}

	.layout > *,
	.side > section {
		min-width: 0;
	}

	.side {
		display: grid;
		gap: var(--space-6);
	}

	@media (min-width: 64rem) {
		.layout {
			grid-template-columns: minmax(0, 1fr) 20rem;
			align-items: start;
		}
	}
</style>
