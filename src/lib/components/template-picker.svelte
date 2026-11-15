<script lang="ts">
	import { strings } from '#lib/i18n/de-CH.ts';

	let {
		templateNames,
		selected,
		onSelect
	}: { templateNames: string[]; selected: string; onSelect: (name: string) => void } = $props();
</script>

<label class="picker">
	<span>{strings.plan.template}</span>
	<select value={selected} onchange={(event) => onSelect(event.currentTarget.value)}>
		{#each templateNames as name (name)}
			<option value={name}>{name}</option>
		{/each}
	</select>
</label>

<style>
	.picker {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-weight: 600;
	}
</style>
