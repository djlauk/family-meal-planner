<script lang="ts">
	import { weekdays, type Plan } from '#lib/data/types.ts';
	import { strings } from '#lib/i18n/de-CH.ts';

	let { templateName, schedule, needs }: { templateName: string; schedule: Plan; needs: string[] } =
		$props();

	// Fixed split for the two page columns. A grid cannot flow across CSS
	// columns, so each page column is its own grid.
	const pageColumns = [weekdays.slice(0, 4), weekdays.slice(4)];
</script>

<!-- Shown only when printing; see the print rules in app.css. -->
<div class="print-sheet">
	<h1>{strings.print.title(templateName)}</h1>

	<section class="plan">
		{#each pageColumns as columnDays, columnIndex (columnIndex)}
			<!-- One grid: label column sized by the browser, day names span both. -->
			<div class="plan-column">
				{#each columnDays as weekday (weekday)}
					<h2 class="day-name">{strings.weekdays[weekday]}</h2>
					{#each schedule[weekday] as meal, index (index)}
						<!-- Always render the label cell so names stay in the second column. -->
						<span class="label">{meal.label ? `${meal.label}:` : ''}</span>
						{#if meal.type === 'auto'}
							<span class="blank" aria-hidden="true"></span>
						{:else}
							<span>{meal.name}</span>
						{/if}
					{/each}
				{/each}
			</div>
		{/each}
	</section>

	{#if needs.length > 0}
		<section class="needs">
			<h2>{strings.needs.heading}</h2>
			<ul>
				{#each needs as item (item)}
					<li><span class="box" aria-hidden="true"></span>{item}</li>
				{/each}
			</ul>
		</section>
	{/if}
</div>

<style>
	.print-sheet {
		display: none;
		font-size: 10.5pt;
		line-height: 1.35;
	}

	h1 {
		font-size: 16pt;
		margin-block-end: 4mm;
	}

	h2 {
		font-size: 11.5pt;
		margin-block: 0 1mm;
	}

	.plan {
		display: grid;
		grid-template-columns: 1fr 1fr;
		column-gap: 10mm;
		align-items: start;
		/* The plan is at most one page; keep it whole. */
		break-inside: avoid;
	}

	.plan-column {
		display: grid;
		grid-template-columns: max-content 1fr;
		column-gap: 2mm;
		row-gap: 0.5mm;
	}

	.day-name {
		grid-column: 1 / -1;
		margin-block-start: 3mm;
	}

	.day-name:first-child {
		margin-block-start: 0;
	}

	.label {
		font-weight: 600;
	}

	/* Unfilled cells print empty: a short line to write on by hand. */
	.blank {
		display: inline-block;
		inline-size: 35mm;
		block-size: 1em;
		border-block-end: 0.3mm solid currentColor;
		vertical-align: baseline;
	}

	/* If the list does not fit below the plan, it starts on a new page as a
	   whole. A list longer than a page still continues normally. */
	.needs {
		break-inside: avoid-page;
		margin-block-start: 6mm;
	}

	.needs ul {
		columns: 3;
		column-gap: 8mm;
	}

	.needs li {
		display: flex;
		align-items: center;
		gap: 2mm;
		break-inside: avoid;
		padding-block: 0.6mm;
	}

	/* Drawn with CSS, not an input, so nothing in the app can pre-tick it. */
	.box {
		flex: none;
		inline-size: 3.5mm;
		block-size: 3.5mm;
		border: 0.3mm solid currentColor;
	}

	@media print {
		.print-sheet {
			display: block;
		}
	}
</style>
