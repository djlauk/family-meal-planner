<script lang="ts">
	import type { Family } from '#lib/data/types.ts';

	let { family }: { family: Family } = $props();
</script>

<ul class="family">
	{#each family as member (member.id)}
		<li>{member.name}</li>
	{/each}
</ul>

<style>
	.family {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	li {
		padding: var(--space-1) var(--space-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-medium);
		background: var(--color-surface);
	}
</style>
