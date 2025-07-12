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
		...restProps
	}: WithoutChildrenOrChild<Switch.RootProps> & {
		labelText: string;
	} = $props();
</script>

<Label.Root for={id}>{labelText}</Label.Root>
<Switch.Root
	bind:checked
	bind:ref
	{id}
	class="h-full aspect-ratio-video focus-visible:ring-white focus-visible:ring-offset data-[state=checked]:bg-lime-700 data-[state=unchecked]:bg-neutral-700 data-[state=unchecked]:shadow-inner dark:data-[state=checked]:bg-white focus-visible:outline-hidden peer inline-flex cursor-pointer items-center rounded-full px-[3px] transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
	{...restProps}
>
	<Switch.Thumb
		class="bg-neutral-500 data-[state=unchecked]:shadow-xs pointer-events-none block rounded-full transition-transform data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-0 dark:border dark:data-[state=unchecked]:border"
	/>
</Switch.Root>
