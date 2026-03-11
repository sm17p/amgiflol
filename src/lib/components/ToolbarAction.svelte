<script lang="ts">
	import Tooltip from "@/lib/components/Tooltip.svelte";
	import { Toggle } from "@ark-ui/svelte/toggle";
	import type { ComponentProps } from "svelte";

	interface Props {
		children: import("svelte").Snippet<[{ pressed: boolean }]>;
		disabled?: boolean;
		label?: string;
		onPressedChange?: (pressed: boolean) => void;
		pressed?: boolean;
		shortcut?: string;
		class?: string;
	}

	let {
		children,
		disabled = false,
		label,
		onPressedChange,
		pressed = $bindable(false),
		shortcut,
		class: className = "",
		...restProps
	}: Props = $props();

	function handlePressedChange(newPressed: boolean) {
		pressed = newPressed;
		onPressedChange?.(newPressed);
	}
</script>

<Tooltip {label}>
	<Toggle.Root
		aria-label={disabled ? "Coming soon..." : (label ?? "")}
		{disabled}
		{pressed}
		onPressedChange={handlePressedChange}
		class="fade-in size-7 sm:size-10 outline-none rounded-sm data-[state=off]:not-disabled:hover:bg-lime-200 data-[state=off]:not-disabled:hover:text-lime-500 !active:bg-lime-700 !active:text-lime-500 data-[state=on]:bg-lime-700 data-[state=on]:text-white/80 inline-flex items-center justify-center transition-all not-disabled:active:rounded-3xl not-disabled:active:scale-[0.85] {className}"
		{...restProps}
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
