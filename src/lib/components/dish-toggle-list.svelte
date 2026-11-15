<script lang="ts">
	import { memberNames } from '#lib/core/family.ts';
	import type { Dish, Family } from '#lib/data/types.ts';
	import { strings } from '#lib/i18n/de-CH.ts';

	let {
		dishes,
		family,
		excluded,
		onToggle,
		onIncludeAll
	}: {
		dishes: Dish[];
		family: Family;
		excluded: ReadonlySet<string>;
		onToggle: (dishName: string, included: boolean) => void;
		onIncludeAll: () => void;
	} = $props();
</script>

<div class="toolbar">
	<p class="muted">{strings.dishes.hint}</p>
	<button type="button" onclick={onIncludeAll} disabled={excluded.size === 0}>
		{strings.dishes.includeAll}
	</button>
</div>

<ul class="dishes">
	{#each dishes as dish (dish.name)}
		{@const isExcluded = excluded.has(dish.name)}
		{@const nogoNames = memberNames(family, dish.nogos)}
		<li class:excluded={isExcluded}>
			<label>
				<input
					type="checkbox"
					checked={!isExcluded}
					onchange={(event) => onToggle(dish.name, event.currentTarget.checked)}
				/>
				<span class="name">{dish.name}</span>
				{#if isExcluded}<span class="tag">{strings.dishes.excluded}</span>{/if}
			</label>
			{#if nogoNames.length > 0}
				<p class="muted">{strings.dishes.nogos}: {nogoNames.join(', ')}</p>
			{/if}
		</li>
	{/each}
</ul>

<style>
	.toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
		margin-block-end: var(--space-3);
	}

	.dishes {
		display: grid;
		gap: var(--space-2);
	}

	li {
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-small);
		background: var(--color-surface);
	}

	label {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		cursor: pointer;
	}

	.excluded .name {
		text-decoration: line-through;
		color: var(--color-text-muted);
	}

	.tag {
		font-size: var(--font-size-small);
		color: var(--color-text-muted);
	}

	.muted {
		font-size: var(--font-size-small);
		color: var(--color-text-muted);
	}
</style>
