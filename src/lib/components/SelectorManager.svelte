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
	import { onDestroy, onMount } from "svelte";
	import Tracker from "./Tracker.svelte";

	interface SelectorManagerProps {
		enabled?: boolean;
		maxTrackers?: number;
		autoCleanup?: boolean;
	}

	let {
		enabled = true,
		maxTrackers = 10,
		autoCleanup = true,
	}: SelectorManagerProps = $props();

	const metadataStore = getContext<MetaDataStore>("metadataStore");
	const trackersStore = getContext<TrackersStore>("trackersStore");
	const uiStore = getContext<UIStore>("uiStore");

	let isSelecting = $state(false);
	let currentHoveredElement = $state<HTMLElement | null>(null);
	let tempTrackerId = $state<string | null>(null);

	function setupEventListeners() {
		removeEventListeners();

		const mouseMoveHandler: EventListener = (event) => {
			handleMouseMove(event as MouseEvent);
		};

		const mouseOverHandler: EventListener = (event) => {
			handleMouseOver(event as MouseEvent);
		};

		const mouseOutHandler: EventListener = (event) => {
			handleMouseOut(event as MouseEvent);
		};

		const clickHandler: EventListener = (event) => {
			handleClick(event as MouseEvent);
		};

		const keyDownHandler: EventListener = (event) => {
			handleKeyDown(event as KeyboardEvent);
		};

		const keyUpHandler: EventListener = (event) => {
			handleKeyUp(event as KeyboardEvent);
		};

		const scrollHandler: EventListener = (event) => {
			handleScroll(event);
		};

		const resizeHandler: EventListener = (event) => {
			handleResize(event);
		};

		eventListeners = [
			{
				element: document,
				event: "mousemove",
				handler: mouseMoveHandler,
			},
			{
				element: document,
				event: "mouseover",
				handler: mouseOverHandler,
			},
			{
				element: document,
				event: "mouseout",
				handler: mouseOutHandler,
			},
			{
				element: document,
				event: "click",
				handler: clickHandler,
			},
			{
				element: document,
				event: "keydown",
				handler: keyDownHandler,
			},
			{
				element: document,
				event: "keyup",
				handler: keyUpHandler,
			},
			{
				element: document,
				event: "scroll",
				handler: scrollHandler,
			},
			{
				element: window as any,
				event: "resize",
				handler: resizeHandler,
			},
		];

		eventListeners.forEach(({ element, event, handler }) => {
			element.addEventListener(event, handler, true);
		});
	}

	function handleMouseMove(event: MouseEvent) {
		if (!enabled || !uiStore.isActive) return;

		metadataStore.updatePosition(event.clientX, event.clientY);

		if (uiStore.svg.mode === "select" && isSelecting) {
			updateTempTracker(event);
		}
	}

	function handleMouseOver(event: MouseEvent) {
		if (!enabled || !uiStore.isActive) return;
		if (isExtensionElement(event.target as HTMLElement)) return;

		const element = getTargetElement(event);
		if (!element) return;

		currentHoveredElement = element;

		if (uiStore.svg.mode === "inspect") {
			// createOrUpdateHoverTracker(element);
		}
	}

	function handleMouseOut(event: MouseEvent) {
		if (!enabled || !uiStore.isActive) return;
		if (isExtensionElement(event.target as HTMLElement)) return;

		if (uiStore.svg.mode === "inspect" && tempTrackerId) {
			trackersStore.deleteTracker(tempTrackerId);
			tempTrackerId = null;
		}

		currentHoveredElement = null;
	}

	function handleClick(event: MouseEvent) {
		if (!enabled || !uiStore.isActive) return;
		if (isExtensionElement(event.target as HTMLElement)) return;

		event.preventDefault();
		event.stopPropagation();

		const element = getTargetElement(event);
		if (!element) return;

		switch (uiStore.svg.mode) {
			case "inspect":
				createPermanentTracker(element);
				break;
			case "select":
				if (isSelecting) {
					finishSelection(element);
				} else {
					startSelection(element);
				}
				break;
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (!enabled || !uiStore.isActive) return;

		metadataStore.updateModifiers({
			ctrl: event.ctrlKey,
			shift: event.shiftKey,
			alt: event.altKey,
		});

		switch (event.key) {
			case "Escape":
				if (isSelecting) {
					cancelSelection();
				} else {
					trackersStore.selectTracker(null);
				}
				break;
			case "Delete":
			case "Backspace":
				deleteSelectedTracker();
				break;
			case "a":
			case "A":
				if (event.ctrlKey || event.metaKey) {
					event.preventDefault();
					selectAllTrackers();
				}
				break;
			case "c":
			case "C":
				if (event.ctrlKey || event.metaKey) {
					event.preventDefault();
					copySelectedTracker();
				}
				break;
			case "v":
			case "V":
				if (event.ctrlKey || event.metaKey) {
					event.preventDefault();
					pasteTracker();
				}
				break;
			case "n":
			case "N":
				if (event.ctrlKey || event.metaKey) {
					event.preventDefault();
					createNewTracker();
				}
				break;
		}
	}

	function handleKeyUp(event: KeyboardEvent) {
		if (!enabled || !uiStore.isActive) return;

		metadataStore.updateModifiers({
			ctrl: event.ctrlKey,
			shift: event.shiftKey,
			alt: event.altKey,
		});
	}

	function handleScroll(event: Event) {
		if (!enabled || !uiStore.isActive) return;

		if (autoCleanup) {
			updateAllTrackers();
		}
	}

	function handleResize(event: Event) {
		if (!enabled || !uiStore.isActive) return;

		updateAllTrackers();
	}

	function getTargetElement(event: MouseEvent): HTMLElement | null {
		const target = event.target as HTMLElement;
		if (!target) return null;

		if (
			metadataStore.mouse.modifiers.ctrl ||
			metadataStore.mouse.modifiers.shift
		) {
			return elementInspector.findParentElement(target);
		}

		return target;
	}

	function createOrUpdateHoverTracker(element: HTMLElement) {
		if (tempTrackerId) {
			trackersStore.deleteTracker(tempTrackerId);
		}

		const elementInfo = elementInspector.getElementInfo(element);
		tempTrackerId = trackersStore.createTracker(
			element,
			elementInfo,
		);
	}

	function createPermanentTracker(element: HTMLElement) {
		if (
			trackersStore.activetracker.boundingRect.heightlength >=
				maxTrackers
		) {
			const oldestTracker = trackersStore.activeTrackers[0];
			if (oldestTracker && !oldestTracker.isLocked) {
				trackersStore.deleteTracker(oldestTracker.id);
			}
		}

		const elementInfo = elementInspector.getElementInfo(element);
		const trackerId = trackersStore.createTracker(
			element,
			elementInfo,
		);
		trackersStore.lockTracker(trackerId);
		trackersStore.selectTracker(trackerId);

		if (tempTrackerId) {
			trackersStore.deleteTracker(tempTrackerId);
			tempTrackerId = null;
		}

		sendMessage("TRACKER_CREATE", {
			trackerId,
			elementInfo,
			timestamp: Date.now(),
		}, "content");
	}

	function updateTempTracker(event: MouseEvent) {
		if (!currentHoveredElement) return;

		const element = elementInspector.getElementAtPoint(
			event.clientX,
			event.clientY,
		);
		if (!element || isExtensionElement(element)) return;

		if (tempTrackerId) {
			const elementInfo = elementInspector.getElementInfo(
				element,
			);
			trackersStore.updateTracker(tempTrackerId, {
				element,
				boundingRect: element.getBoundingClientRect(),
				elementInfo,
			});
		}
	}

	function startSelection(element: HTMLElement) {
		isSelecting = true;
		// createOrUpdateHoverTracker(element);
	}

	function finishSelection(element: HTMLElement) {
		isSelecting = false;
		createPermanentTracker(element);
	}

	function cancelSelection() {
		isSelecting = false;
		if (tempTrackerId) {
			trackersStore.deleteTracker(tempTrackerId);
			tempTrackerId = null;
		}
	}

	function deleteSelectedTracker() {
		const selectedId = trackersStore.selectedTracker;
		if (selectedId) {
			trackersStore.deleteTracker(selectedId);
		}
	}

	function selectAllTrackers() {
		// Implementation for selecting all trackers
		console.log("Select all trackers");
	}

	function copySelectedTracker() {
		const selectedId = trackersStore.selectedTracker;
		if (selectedId) {
			const tracker = trackersStore.trackers.get(selectedId);
			if (tracker) {
				const data = {
					elementInfo: tracker.elementInfo,
					position: tracker.boundingRect,
				};
				navigator.clipboard.writeText(
					JSON.stringify(data, null, 2),
				);
			}
		}
	}

	function pasteTracker() {
		// Implementation for pasting tracker
		console.log("Paste tracker");
	}

	function createNewTracker() {
		if (currentHoveredElement) {
			createPermanentTracker(currentHoveredElement);
		}
	}

	function updateAllTrackers() {
		const trackers = trackersStore.activeTrackers;
		trackers.forEach((tracker) => {
			if (tracker.element && document.contains(tracker.element)) {
				const newRect = tracker.element.getBoundingClientRect();
				const parentRect = elementInspector
					.findParentElement(tracker.element)
					?.getBoundingClientRect();

				trackersStore.updateTracker(tracker.id, {
					boundingRect: newRect,
					parentRect,
				});
			} else {
				trackersStore.deleteTracker(tracker.id);
			}
		});
	}

	onMount(() => {
		const unsubscribeModeChange = createMessageHandler(
			"MODE_CHANGE",
			() => {
				if (tempTrackerId) {
					trackersStore.deleteTracker(tempTrackerId);
					tempTrackerId = null;
				}
				isSelecting = false;
			},
		);

		return () => {
			unsubscribeModeChange();
		};
	});

	onDestroy(() => {
		if (tempTrackerId) {
			trackersStore.deleteTracker(tempTrackerId);
		}
	});
</script>

{#if enabled && uiStore.isActive}
	{#each trackersStore.lockedTrackers as tracker (tracker.id)}
		<Tracker
			trackerId={tracker.id}
			showParent={true}
			zIndex={9999}
		/>
	{/each}
	<Tracker
		showParent={true}
		zIndex={9999}
	/>
{/if}
