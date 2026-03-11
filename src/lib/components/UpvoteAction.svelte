<script lang="ts">
	import { UpvoteState } from "@/lib/store/UpvoteState.svelte";
	import { useId } from "@/lib/utils/useId";
	import { Toggle } from "@ark-ui/svelte/toggle";
	import { ArrowBigUp } from "@lucide/svelte";
	import type { ComponentProps } from "svelte";

	interface Props {
		id?: string;
		key: string;
		label: string;
		disabled?: boolean;
		class?: string;
	}

	let {
		id = useId(),
		key,
		label,
		disabled = false,
		class: className = "",
		...restProps
	}: Props = $props();

	let upvoteState = new UpvoteState(key);

	function handlePressedChange(pressed: boolean) {
		upvoteState.updatePressed(pressed);
	}
</script>

<span
	class="min-w-[250px] flex justify-between items-center gap-3 font-inherit"
>
	<Toggle.Root
		{id}
		aria-label={label}
		pressed={upvoteState.pressed}
		onPressedChange={handlePressedChange}
		{disabled}
		class="w-full flex justify-between items-center gap-3 {className}"
		{...restProps}
	>
		<label for={id} class="cursor-inherit flex-1 text-start font-inherit">
			{label}
		</label>
		<div class="outline-none rounded-sm data-[state=off]:not-disabled:hover:bg-lime-200 data-[state=off]:not-disabled:hover:text-lime-500 !active:bg-lime-700 !active:text-lime-500 data-[state=on]:bg-lime-700 data-[state=on]:text-white/80 inline-flex size-8 items-center justify-center transition-all not-disabled:active:rounded-3xl not-disabled:active:scale-[0.85]">
			<ArrowBigUp absoluteStrokeWidth class="size-8" />
		</div>
	</Toggle.Root>
</span>
