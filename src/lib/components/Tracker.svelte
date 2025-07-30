<script lang="ts">
	import {
		MetaDataStore,
		TrackersStore,
	} from "@/lib/store/index.svelte";

	interface TrackerProps {
		trackerId?: string;
		zIndex?: number;
	}

	let {
		trackerId,
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
	{#if tracker.parentOfTarget}
		<div
			class="follower-p bg-rose-300/10 origin-top-left inline-block border-1 border-zinc-700 top-0 fixed duration-75"
			style={`${tracker.parentOfTarget.overlayStyles}z-index: ${zIndex};`}
		>
		</div>
	{/if}

	<div
		class="follower origin-top-left inline-block border-1 border-zinc-700 top-0 mix-blend-difference bg-lime-700/10 fixed duration-75"
		style={`${tracker.target?.overlayStyles}z-index: ${zIndex};`}
	>
	</div>

	{#if tracker.hoveredAltTarget}
		<div
			class="follower-p bg-indigo-500/10 origin-top-left inline-block border-1 border-zinc-700 top-0 fixed duration-75"
			style={`${tracker.hoveredAltTarget.overlayStyles}z-index: ${zIndex};`}
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
