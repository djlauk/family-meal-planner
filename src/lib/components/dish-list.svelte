<script lang="ts">
	import { memberNames } from '#lib/core/family.ts';
	import type { Dish, Family } from '#lib/data/types.ts';
	import { strings } from '#lib/i18n/de-CH.ts';

	let { dishes, family }: { dishes: Dish[]; family: Family } = $props();
</script>

<ul class="dishes">
	{#each dishes as dish (dish.name)}
		{@const nogoNames = memberNames(family, dish.nogos)}
		<li>
			<h3>{dish.name}</h3>
			<p>
				<span class="term">{strings.dish.ingredients}:</span>
				{dish.ingredients?.length ? dish.ingredients.join(', ') : strings.dish.noIngredients}
			</p>
			<p class="muted">
				{#if nogoNames.length > 0}
					<span class="term">{strings.dish.nogos}:</span>
					{nogoNames.join(', ')}
				{:else}
					{strings.dish.noNogos}
				{/if}
			</p>
		</li>
	{/each}
</ul>

<style>
	.dishes {
		display: grid;
		gap: var(--space-3);
		grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
	}

	li {
		padding: var(--space-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-medium);
		background: var(--color-surface);
	}

	p {
		font-size: var(--font-size-small);
	}

	.term {
		font-weight: 600;
	}

	.muted {
		color: var(--color-text-muted);
	}
</style>
