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
	{#if showParent && tracker.parentRect}
		<div
			class="follower-p bg-rose-300/10 origin-top-left inline-block border-1 border-zinc-700 top-0 fixed duration-75"
			style={`${tracker.parentStyles}z-index: ${zIndex};`}
		>
		</div>
	{/if}

	<div
		class="follower origin-top-left inline-block border-1 border-zinc-700 top-0 mix-blend-difference bg-lime-700/10 fixed duration-75"
		style={`${tracker.elementStyles}z-index: ${zIndex};`}
	>
	</div>
{/if}

<style>
	/* .follower-p { */
	/* box-shadow: inset 0 0 0 99999px rgba(0, 0, 0, 0.5); */
	/* outline: 99999px solid rgba(0, 0, 0, 0.25); */
	/* box-shadow: inset 0 0 0 99999px rgba(0, 0, 0, 0.65); */
	/* } */
</style>
