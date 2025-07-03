<script lang="ts">
	import { elementInspector } from "@/lib/core/ElementInspector";
	import {
		createMessageHandler,
		messageBus,
		sendMessage,
	} from "@/lib/core/MessageBus";
	import {
		MetaDataStore,
		TrackersStore,
		UIStore,
	} from "@/lib/store/index.svelte";
	import { onMount } from "svelte";

	const metadataStore = getContext<MetaDataStore>("metadataStore");
	const trackersStore = getContext<TrackersStore>("trackersStore");
	const uiStore = getContext<UIStore>("uiStore");

	let isInitialized = $state(false);
	let unsubscribers: Array<() => void> = [];

	function handleMouseMove(event: MouseEvent) {
		if (!uiStore.isActive) return;

		metadataStore.updateMousePosition(event.clientX, event.clientY);
	}

	function handleKeyDown(event: KeyboardEvent) {
		console.log("🚀 ~ handleKeyDown ~ event:", event);
		if (!uiStore.isActive) return;

		metadataStore.updateModifiers({
			ctrl: event.ctrlKey,
			shift: event.shiftKey,
			alt: event.altKey,
		});

		switch (event.key) {
			case "Escape":
				if (uiStore.isActive) {
					uiStore.toggleActive("content");
				}
				break;
			case "i":
			case "I":
				if (event.ctrlKey || event.metaKey) {
					event.preventDefault();
					uiStore.toggleActive("content");
				}
				break;
			case "1":
				if (event.ctrlKey || event.metaKey) {
					event.preventDefault();
					uiStore.setMode("inspect");
				}
				break;
			case "2":
				if (event.ctrlKey || event.metaKey) {
					event.preventDefault();
					uiStore.setMode("select");
				}
				break;
			case "3":
				if (event.ctrlKey || event.metaKey) {
					event.preventDefault();
					uiStore.setMode("measure");
				}
				break;
			case "r":
			case "R":
				if (event.ctrlKey || event.metaKey) {
					event.preventDefault();
					uiStore.toggleRulers();
				}
				break;
			case "d":
			case "D":
				if (event.ctrlKey || event.metaKey) {
					event.preventDefault();
					uiStore.toggleDistances();
				}
				break;
			case "c":
			case "C":
				if (
					event.ctrlKey || (event.metaKey && event.shiftKey)
				) {
					event.preventDefault();
					trackersStore.clearAllTrackers();
				}
				break;
			case "l":
			case "L":
				if (
					event.ctrlKey || (event.metaKey && event.shiftKey)
				) {
					event.preventDefault();
					if (trackersStore.current) {
						trackersStore.current.isLocked = !trackersStore
							.current.isLocked;
					}
				}
				break;
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

	function handleScroll(event: UIEvent) {
		if (uiStore.isActive) {
			sendMessage("VIEWPORT_SCROLL", {
				x: window.scrollX,
				y: window.scrollY,
			}, "content");
		}
	}

	function handleMouseOver(event: MouseEvent) {
		sendMessage("ELEMENT_HOVER", event, "content");
	}

	function setupMessageHandlers() {
		const toggleHandler = createMessageHandler(
			"EXTENSION_TOGGLE",
			(payload: any) => {
				console.log(
					"🚀 ~ setupMessageHandlers ~ payload:",
					payload,
				);
				if (payload.isActive !== uiStore.isActive) {
					uiStore.toggleActive();
				}
			},
		);

		const stateChangeHandler = createMessageHandler(
			"INSPECTOR_STATE_CHANGE",
			(payload: any) => {
				if (payload.state) {
					Object.assign(uiStore.svg, payload.state);
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
			stateChangeHandler,
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
	onscroll={handleScroll}
/>
