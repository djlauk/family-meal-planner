<script lang="ts">
	import { needsListText } from '#lib/core/needs-list.ts';
	import { strings } from '#lib/i18n/de-CH.ts';

	let { items }: { items: string[] } = $props();

	const text = $derived(needsListText(items));

	// Which text was last copied. Comparing with the current text means the
	// "copied" note disappears by itself when the plan changes.
	let copiedText = $state<string | undefined>(undefined);
	let showManualCopy = $state(false);

	// Deprecated, but the only copy path left on plain HTTP, where
	// navigator.clipboard does not exist. Returns false if the browser refuses.
	function copyWithSelection(value: string): boolean {
		const area = document.createElement('textarea');
		area.value = value;
		area.setAttribute('readonly', '');
		area.style.position = 'fixed';
		area.style.opacity = '0';
		document.body.append(area);
		area.select();
		try {
			return document.execCommand('copy');
		} catch {
			return false;
		} finally {
			area.remove();
		}
	}

	async function copy() {
		const value = text;
		let copied = false;
		if (window.isSecureContext && navigator.clipboard) {
			try {
				await navigator.clipboard.writeText(value);
				copied = true;
			} catch {
				copied = false;
			}
		}
		if (!copied) copied = copyWithSelection(value);
		copiedText = copied ? value : undefined;
		showManualCopy = !copied;
	}

	function selectAll(node: HTMLTextAreaElement) {
		node.focus();
		node.select();
	}
</script>

{#if items.length === 0}
	<p class="muted">{strings.needs.empty}</p>
{:else}
	<div class="toolbar">
		<button type="button" onclick={copy}>{strings.needs.copy}</button>
		<span class="note" role="status">
			{#if copiedText === text}{strings.needs.copied}{/if}
		</span>
	</div>

	{#if showManualCopy}
		<p class="muted">{strings.needs.copyManually}</p>
		<textarea readonly rows={Math.min(items.length, 12)} value={text} {@attach selectAll}
		></textarea>
	{/if}

	<ul class="items">
		{#each items as item (item)}
			<li>{item}</li>
		{/each}
	</ul>
{/if}

<style>
	.toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2);
		margin-block-end: var(--space-3);
	}

	.note {
		font-size: var(--font-size-small);
		color: var(--color-accent);
		font-weight: 600;
	}

	textarea {
		width: 100%;
		margin-block: var(--space-2) var(--space-3);
		padding: var(--space-2);
		font: inherit;
		color: var(--color-text);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-small);
	}

	.items {
		display: grid;
		gap: var(--space-1);
		padding: var(--space-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-medium);
		background: var(--color-surface);
	}

	.muted {
		font-size: var(--font-size-small);
		color: var(--color-text-muted);
	}
</style>
