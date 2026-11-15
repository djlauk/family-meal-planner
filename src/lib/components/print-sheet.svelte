<script lang="ts">
	import { printRows, type PrintHalf } from '#lib/core/print-layout.ts';
	import type { Plan } from '#lib/data/types.ts';
	import { strings } from '#lib/i18n/de-CH.ts';

	let { templateName, schedule, needs }: { templateName: string; schedule: Plan; needs: string[] } =
		$props();

	const rows = $derived(printRows(schedule));
</script>

<!-- One half of a row: either two cells (label, dish) or one cell spanning both. -->
{#snippet half(part: PrintHalf, side: 'left' | 'right', startsBlock: boolean)}
	{#if part.kind === 'heading'}
		<h2 class="span {side}" class:block-start={startsBlock}>{strings.weekdays[part.weekday]}</h2>
	{:else if part.kind === 'meal'}
		<span class="label {side}">{part.meal.label ? `${part.meal.label}:` : ''}</span>
		{#if part.meal.type === 'auto'}
			<span class="dish {side}"><span class="blank" aria-hidden="true"></span></span>
		{:else}
			<span class="dish {side}">{part.meal.name}</span>
		{/if}
	{:else}
		<span class="span {side}" class:block-start={startsBlock}></span>
	{/if}
{/snippet}

<!-- Shown only when printing; see the print rules in app.css. -->
<div class="print-sheet">
	<h1>{strings.print.title(templateName)}</h1>

	<!-- Every row renders a left and a right half, so cells never shift rows. -->
	<section class="plan">
		{#each rows as row, rowIndex (rowIndex)}
			{@render half(row.left, 'left', row.startsBlock)}
			{@render half(row.right, 'right', row.startsBlock)}
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

	/* label | dish | gap | label | dish. The gap is its own column so the
	   2 mm label gap and the 10 mm middle gap stay independent. */
	.plan {
		display: grid;
		grid-template-columns: max-content 1fr 10mm max-content 1fr;
		column-gap: 2mm;
		row-gap: 0.5mm;
		/* The plan is at most one page; keep it whole. */
		break-inside: avoid;
	}

	.label.left {
		grid-column: 1;
	}

	.dish.left {
		grid-column: 2;
	}

	.label.right {
		grid-column: 4;
	}

	.dish.right {
		grid-column: 5;
	}

	.span.left {
		grid-column: 1 / 3;
	}

	.span.right {
		grid-column: 4 / 6;
	}

	/* Space between day blocks, except above the first one. */
	.block-start {
		margin-block-start: 3mm;
	}

	.plan > .block-start:nth-child(-n + 2) {
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
