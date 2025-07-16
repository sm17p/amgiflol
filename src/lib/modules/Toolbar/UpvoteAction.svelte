<script lang="ts">
	import { ArrowBigUp } from "@lucide/svelte";
	import { Label, Toggle, useId } from "bits-ui";
	import { type ToggleRootProps } from "bits-ui";
	import { UpvoteState } from "./upvote-state.svelte";
	interface Props extends ToggleRootProps {
		key: string;
		label: string;
	}

	let {
		id = useId(),
		key,
		label,
		...props
	}: Props = $props();

	let upvoteState = new UpvoteState(key);
</script>

<span
	class="min-w-[250px] flex justify-between items-center gap-3 font-inherit"
>
	<Label.Root class="cursor-inherit flex-1 text-start" for={id}>{
		label
	}</Label.Root>
	<Toggle.Root
		aria-label={label}
		{id}
		bind:pressed={() => upvoteState.pressed, (v) => upvoteState.updatePressed(v)}
		class="outline-none rounded-sm data-[state=off]:not-disabled:hover:bg-lime-200 data-[state=off]:not-disabled:hover:text-lime-500 !active:bg-lime-700 !active:text-lime-500 data-[state=on]:bg-lime-700 data-[state=on]:text-white/80 inline-flex size-8 items-center justify-center transition-all not-disabled:active:rounded-3xl not-disabled:active:scale-[0.85]"
		{...props}
	>
		<ArrowBigUp absoluteStrokeWidth class="size-8" />
	</Toggle.Root>
</span>
