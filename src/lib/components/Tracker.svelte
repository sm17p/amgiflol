<script lang="ts">
	import {
		MetaDataStore,
		TrackersStore,
	} from "@/lib/store/index.svelte";

	interface TrackerProps {
		trackerId?: string;
		showParent?: boolean;
		zIndex?: number;
	}

	let {
		trackerId,
		showParent = true,
		zIndex,
	}: TrackerProps = $props();

	const trackersStore = getContext<TrackersStore>("trackersStore");

	if (!trackerId) {
		trackersStore.createCurrentTracker();
	}

	let tracker = $derived(trackersStore.current);

	let isHovered = $state(false);
	let isSelected = $state(false);

	$effect(() => {
		isHovered = trackersStore.hoveredTracker === trackerId;
	});

	$effect(() => {
		isSelected = trackersStore.selectedTracker === trackerId;
	});
</script>

{#if tracker}
	<div
		class="follower origin-top-left inline-block border-1 border-primary-200 top-0 text-accent mix-blend-difference bg-amber-200/10 fixed duration-75"
		style={`${tracker.elementStyles}z-index: ${zIndex};`}
	>
	</div>

	{#if showParent && tracker.parentRect}
		<div
			class="follower-p bg-rose-300/10 origin-top-left inline-block border-1 border-primary-200 top-0 text-accent fixed duration-75"
			style={`${tracker.parentStyles}z-index: ${zIndex};`}
		>
		</div>
	{/if}
{/if}

<style>
	/* .follower-p { */
	/* box-shadow: inset 0 0 0 99999px rgba(0, 0, 0, 0.5); */
	/* outline: 99999px solid rgba(0, 0, 0, 0.25); */
	/* box-shadow: inset 0 0 0 99999px rgba(0, 0, 0, 0.65); */
	/* } */
</style>
