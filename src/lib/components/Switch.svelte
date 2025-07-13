<script lang="ts">
	import {
		Label,
		Switch,
		useId,
		type WithoutChildrenOrChild,
	} from "bits-ui";

	let {
		id = useId(),
		checked = $bindable(false),
		ref = $bindable(null),
		labelText,
		class: classes,
		style = "",
		...restProps
	}: WithoutChildrenOrChild<Switch.RootProps> & {
		labelText: string;
	} = $props();
</script>

<Label.Root class="cursor-inherit" for={id}>{labelText}</Label.Root>
<Switch.Root
	bind:checked
	bind:ref
	{id}
	class="parent h-full p-0.5 aspect-ratio-video focus-visible:ring-white focus-visible:ring-offset data-[state=checked]:bg-lime-700 data-[state=unchecked]:bg-neutral-700 data-[state=unchecked]:shadow-inner dark:data-[state=checked]:bg-white focus-visible:outline-hidden inline-flex cursor-pointer items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
	style={`container-type: size;${style}`}
	{...restProps}
>
	<Switch.Thumb
		class="parent-active:scale-[0.85] bg-white h-full aspect-1 data-[state=unchecked]:shadow-md pointer-events-none block rounded-full transition-transform data-[state=checked]:translate-x-[calc(100cqw-100%)] data-[state=unchecked]:-translate-x-0 dark:border dark:data-[state=unchecked]:border"
	/>
</Switch.Root>
