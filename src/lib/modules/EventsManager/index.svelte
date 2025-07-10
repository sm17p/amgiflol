<script lang="ts">
	import { elementInspector } from "@/lib/core/ElementInspector";
	import {
		createMessageHandler,
		sendMessage,
	} from "@/lib/core/MessageBus";
	import { MetaDataStore, UIStore } from "@/lib/store/index.svelte";
	import { onMount } from "svelte";

	const metadataStore = getContext<MetaDataStore>("metadataStore");
	const uiStore = getContext<UIStore>("uiStore");

	let isInitialized = $state(false);
	let unsubscribers: Array<() => void> = [];

	function handleMouseMove(event: MouseEvent) {
		if (!uiStore.isActive) return;

		metadataStore.updateMousePosition(event.clientX, event.clientY);
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (!uiStore.isActive) return;

		metadataStore.updateModifiers({
			ctrl: event.ctrlKey,
			shift: event.shiftKey,
			alt: event.altKey,
		});

		if (
			event?.currentTarget instanceof Document &&
				event?.currentTarget?.body === event.target ||
			(event.target instanceof HTMLElement &&
				elementInspector.isExtensionElement(event.target))
		) {
			sendMessage("KEYDOWN", event, "content");
		}
	}

	function handleKeyUp(event: KeyboardEvent) {
		if (!uiStore.isActive) return;

		metadataStore.updateModifiers({
			ctrl: event.ctrlKey,
			shift: event.shiftKey,
			alt: event.altKey,
		});
	}

	function handleWindowResize() {
		if (uiStore.isActive) {
			sendMessage("VIEWPORT_RESIZE", {
				width: window.innerWidth,
				height: window.innerHeight,
			}, "content");
		}
	}

	function handleMouseOver(event: MouseEvent) {
		sendMessage("ELEMENT_HOVER", event, "content");
	}

	function setupMessageHandlers() {
		const toggleHandler = createMessageHandler(
			"EXTENSION_TOGGLE",
			(payload: any, message) => {
				if (
					payload.isActive !== uiStore.isActive &&
					message.source !== "content"
				) {
					uiStore.toggleActive(message.source);
				}
			},
		);

		const zoomHandler = createMessageHandler(
			"ZOOM_CHANGE",
			(payload: any) => {
				if (payload.zoomLevel) {
					uiStore.setZoomLevel(payload.zoomLevel);
					elementInspector.setZoomLevel(payload.zoomLevel);
				}
			},
		);

		unsubscribers.push(
			toggleHandler,
			zoomHandler,
		);
	}

	async function initialize() {
		if (isInitialized) return;

		setupMessageHandlers();

		await uiStore.loadFromStorage();

		isInitialized = true;
	}

	function cleanup() {
		unsubscribers.forEach((unsub) => unsub());
		isInitialized = false;
	}

	onMount(() => {
		initialize();
		return cleanup;
	});
</script>

<svelte:document
	onmousemove={handleMouseMove}
	onkeydown={handleKeyDown}
	onkeyup={handleKeyUp}
	onmouseover={handleMouseOver}
/>
<svelte:window
	bind:innerWidth={metadataStore.window.innerWidth}
	bind:innerHeight={metadataStore.window.innerHeight}
	onresize={handleWindowResize}
	bind:scrollX={metadataStore.scroll.scrollX}
	bind:scrollY={metadataStore.scroll.scrollY}
/>
