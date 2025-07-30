<script lang="ts">
	import Tooltip from "@/lib/components/Tooltip.svelte";
	import { Toggle } from "bits-ui";
	import { type ToggleRootProps } from "bits-ui";

	interface Props extends ToggleRootProps {
		shortcut?: string;
		label?: string;
	}

	let {
		children,
		disabled = false,
		label,
		onPressedChange,
		pressed = $bindable(false),
		shortcut,
	}: Props = $props();
</script>

<Tooltip {label}>
	<Toggle.Root
		aria-label={disabled ? "Coming soon..." : label ?? ""}
		{disabled}
		bind:pressed
		{onPressedChange}
		class="fade-in size-7 sm:size-10 outline-none rounded-sm data-[state=off]:not-disabled:hover:bg-lime-200 data-[state=off]:not-disabled:hover:text-lime-500 !active:bg-lime-700 !active:text-lime-500 data-[state=on]:bg-lime-700 data-[state=on]:text-white/80 inline-flex items-center justify-center transition-all not-disabled:active:rounded-3xl not-disabled:active:scale-[0.85]"
	>
		{@render children?.({ pressed })}
		{#if shortcut}
			<kbd
				class="text-xs not-prose duration-75 absolute translate-y-2 translate-x-2.5 sm:translate-y-3 sm:translate-x-3.5"
			>
				{shortcut}
			</kbd>
		{/if}
	</Toggle.Root>
</Tooltip>

<style>
</style>
