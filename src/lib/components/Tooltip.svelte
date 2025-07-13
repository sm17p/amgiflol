<script lang="ts">
	import { Tooltip } from "bits-ui";
	import { type Snippet } from "svelte";
	import { fade } from "svelte/transition";

	interface Props {
		children: Snippet;
		label?: string;
	}

	let { children, label }: Props = $props();
</script>

<Tooltip.Root
	disableCloseOnTriggerClick
	disableHoverableContent
>
	<Tooltip.Trigger disabled={label === undefined}>
		{@render children?.()}
	</Tooltip.Trigger>
	<Tooltip.Content sideOffset={-2} forceMount>
		{#snippet child({ wrapperProps, props, open })}
			{#if open}
				<div {...wrapperProps}>
					<p
						{...props}
						class="border-lime-300 bg-white shadow-lime-600 shadow-sm outline-hidden flex items-center p-3 justify-center border-2 rounded-lg font-medium"
						transition:fade={{ duration: 75 }}
					>
						{label}
					</p>
				</div>
			{/if}
		{/snippet}
		<Tooltip.Arrow>toto</Tooltip.Arrow>
	</Tooltip.Content>
</Tooltip.Root>
