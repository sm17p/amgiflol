<script lang="ts">
	import { Tooltip, type TooltipContentProps } from "bits-ui";
	import { type Snippet } from "svelte";
	import { fade } from "svelte/transition";

	interface Props {
		children: Snippet;
		label?: string;
		side?: TooltipContentProps["side"];
		sideOffset?: number;
	}

	let { children, label, side, sideOffset = -2 }: Props = $props();
</script>

<Tooltip.Root
	disableCloseOnTriggerClick
	disableHoverableContent
>
	<Tooltip.Trigger disabled={label === undefined}>
		{@render children?.()}
	</Tooltip.Trigger>
	<Tooltip.Content {side} sideOffset={sideOffset} forceMount>
		{#snippet child({ wrapperProps, props, open })}
			{#if open}
				<div {...wrapperProps}>
					<p
						{...props}
						class="border-lime-300 max-w-[35ch] bg-white shadow-lime-600 shadow-sm outline-hidden flex items-center p-3 justify-center border-2 rounded-lg font-medium"
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
