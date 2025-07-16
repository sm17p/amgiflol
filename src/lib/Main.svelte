<script lang="ts">
	import SvgManager from "@/lib/modules/SvgManager/index.svelte";
	import {
		MetaDataStore,
		TrackersStore,
		UIStore,
	} from "@/lib/store/index.svelte";
	import { Tooltip } from "bits-ui";
	import SelectorManager from "./components/SelectorManager.svelte";
	import DebugToolbar from "./modules/DebugToolbar/index.svelte";
	import EventsManager from "./modules/EventsManager/index.svelte";
	import SidePanel from "./modules/SidePanel/index.svelte";
	import Toolbar from "./modules/Toolbar/index.svelte";

	const metadataStore = new MetaDataStore();
	const trackersStore = new TrackersStore();
	const uiStore = new UIStore();

	setContext("metadataStore", metadataStore);
	setContext("trackersStore", trackersStore);
	setContext("uiStore", uiStore);
</script>

<EventsManager />

<main
	class={["amg-root relative prose prose-zinc max-w-screen", {
		active: uiStore.isActive,
	}]}
>
	<Tooltip.Provider delayDuration={0} disableHoverableContent={false}>
		{#if uiStore.isActive}
			<SvgManager style="z-index: 1000000004;" />
			<SelectorManager
				enabled={uiStore.isActive}
				maxTrackers={10}
				autoCleanup={true}
			/>
			<DebugToolbar
				showPerformance={true}
				showMemory={true}
				showMessages={true}
			/>
			<SidePanel />
			<Toolbar />
		{/if}
	</Tooltip.Provider>
</main>

<style>
	/* :global(html) {
		all: initial;
	} */

	:global(html:has(main.active)) {
		pointer-events: none;
		font-size: 16px !important;

		:global(body) {
			position: fixed;
			inset: 0;
			z-index: 1000000000;
			backdrop-filter: brightness(0.85);
		}

		:global(button) {
			cursor: pointer;
		}

		:global(.amg-root svg) {
			pointer-events: none;
		}

		:global(.amg-root [data-interactive="true"]) {
			pointer-events: auto;
		}

		:global(.amg-root:where(.debug-toolbar, .measurement-controls, button, select, input, textarea)) {
			pointer-events: all;
		}

		:global(.amgiflol-no-select) {
			user-select: none;
			-webkit-user-select: none;
			-moz-user-select: none;
			-ms-user-select: none;
		}

		:global(.amgiflol-measuring) {
			cursor: crosshair !important;
		}
	}
</style>
