<script lang="ts">
	import { weekdays, type Plan } from '#lib/data/types.ts';
	import { strings } from '#lib/i18n/de-CH.ts';

	let { templateName, schedule, needs }: { templateName: string; schedule: Plan; needs: string[] } =
		$props();
</script>

<!-- Shown only when printing; see the print rules in app.css. -->
<div class="print-sheet">
	<h1>{strings.print.title(templateName)}</h1>

	<section class="plan">
		{#each weekdays as weekday (weekday)}
			<div class="day">
				<h2>{strings.weekdays[weekday]}</h2>
				<ul>
					{#each schedule[weekday] as meal, index (index)}
						<li>
							{#if meal.label}<span class="label">{meal.label}:</span>{/if}
							{#if meal.type === 'auto'}
								<span class="blank" aria-hidden="true"></span>
							{:else}
								{meal.name}
							{/if}
						</li>
					{/each}
				</ul>
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
		columns: 2;
		column-gap: 10mm;
	}

	/* A day never splits across columns or pages. */
	.day {
		break-inside: avoid;
		margin-block-end: 4mm;
	}

	.plan li {
		break-inside: avoid;
	}

	.label {
		font-weight: 600;
		margin-inline-end: 1.5mm;
	}

	/* Unfilled cells print empty: a short line to write on by hand. */
	.blank {
		display: inline-block;
		inline-size: 35mm;
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
