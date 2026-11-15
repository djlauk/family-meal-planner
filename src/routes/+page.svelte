<script lang="ts">
	import DishList from '#lib/components/dish-list.svelte';
	import FamilyList from '#lib/components/family-list.svelte';
	import ScheduleView from '#lib/components/schedule-view.svelte';
	import { loadDataSet } from '#lib/data/loader.ts';
	import { strings } from '#lib/i18n/de-CH.ts';

	const dataSet = loadDataSet();
</script>

<svelte:head>
	<title>{strings.pageTitle}</title>
</svelte:head>

<main>
	<h1>{strings.pageTitle}</h1>

	<section>
		<h2>{strings.sections.family}</h2>
		<FamilyList family={dataSet.family} />
	</section>

	<section>
		<h2>{strings.sections.dishes}</h2>
		<DishList dishes={dataSet.dishes} family={dataSet.family} />
	</section>

	<section>
		<h2>{strings.sections.templates}</h2>
		{#each Object.entries(dataSet.templates) as [templateName, schedule] (templateName)}
			<h3 class="template-name">{templateName}</h3>
			<ScheduleView {schedule} family={dataSet.family} />
		{/each}
	</section>
</main>

<style>
	main {
		display: grid;
		gap: var(--space-8);
		max-width: 72rem;
		margin-inline: auto;
		padding: var(--space-4);
	}

	.template-name {
		margin-block: var(--space-4) var(--space-2);
	}
</style>
