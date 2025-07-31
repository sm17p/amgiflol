<script lang="ts">
	import { useId } from "@/lib/utils/useId";
	import { Tooltip } from "@ark-ui/svelte/tooltip";
	import { type Snippet } from "svelte";
	import type { ComponentProps } from "svelte";
	import { fade } from "svelte/transition";

	interface Props {
		children: Snippet;
		label?: string;
		side?: "top" | "bottom" | "left" | "right";
		sideOffset?: number;
	}

	let { children, label, side = "top", sideOffset = -2 }: Props =
		$props();

	const tooltipId = useId("tooltip");
</script>

<Tooltip.Root
	id={tooltipId}
	closeOnClick={false}
	interactive={false}
	openDelay={1000}
	closeDelay={500}
	positioning={{
		placement: side,
		offset: { mainAxis: sideOffset },
	}}
>
	<Tooltip.Trigger disabled={label === undefined}>
		{@render children?.()}
	</Tooltip.Trigger>
	<Tooltip.Positioner>
		<Tooltip.Content>
			{#if label}
				<p
					class="border-lime-300 max-w-[35ch] bg-white shadow-lime-600 shadow-sm outline-hidden flex items-center p-3 justify-center border-2 rounded-lg font-medium"
					transition:fade={{ duration: 75 }}
				>
					{label}
				</p>
			{/if}
			<Tooltip.Arrow>
				<Tooltip.ArrowTip />
			</Tooltip.Arrow>
		</Tooltip.Content>
	</Tooltip.Positioner>
</Tooltip.Root>
