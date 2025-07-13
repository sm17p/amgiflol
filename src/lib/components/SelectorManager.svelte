<script lang="ts">
	import { TrackersStore, UIStore } from "@/lib/store/index.svelte";
	import Tracker from "./Tracker.svelte";

	interface SelectorManagerProps {
		enabled?: boolean;
		maxTrackers?: number;
		autoCleanup?: boolean;
	}

	let {
		enabled = true,
		autoCleanup = true,
	}: SelectorManagerProps = $props();

	const trackersStore = getContext<TrackersStore>("trackersStore");
	const uiStore = getContext<UIStore>("uiStore");
</script>

{#if enabled && uiStore.isActive}
	{#each trackersStore.lockedTrackers as tracker (tracker.id)}
		<Tracker
			trackerId={tracker.id}
			showParent={true}
			zIndex={1000000002}
		/>
	{/each}
	<Tracker
		showParent={true}
		zIndex={1000000003}
	/>
{/if}
