<script lang="ts">
	import {
		createMessageHandler,
		messageBus,
	} from "@/lib/core/MessageBus";
	import { onDestroy, onMount } from "svelte";

	import {
		MetaDataStore,
		TrackersStore,
		UIStore,
	} from "@/lib/store/index.svelte";

	const metadataStore = getContext<MetaDataStore>("metadataStore");
	const trackersStore = getContext<TrackersStore>("trackersStore");
	const uiStore = getContext<UIStore>("uiStore");

	const mouse = $derived(metadataStore.mouse);
	const windowState = $derived(metadataStore.window);

	interface DebugToolbarProps {
		expanded?: boolean;
		showPerformance?: boolean;
		showMemory?: boolean;
		showMessages?: boolean;
	}

	let {
		expanded = false,
		showPerformance = true,
		showMemory = true,
		showMessages = true,
	}: DebugToolbarProps = $props();

	let isCollapsed = $state(!expanded);
	let activeTab = $state("overview");
	let performanceData = $state({
		fps: 0,
		memory: 0,
		trackers: 0,
		elements: 0,
		lastUpdate: 0,
	});

	let messageHistory = $state<any[]>([]);
	let currentElement = $state<HTMLElement | null>(null);

	let performanceInterval: NodeJS.Timeout;
	let memoryInterval: NodeJS.Timeout;

	function getPositionStyles() {
		const baseStyles =
			"position: fixed; z-index: 10001; font-family: Inter, system-ui, sans-serif;";

		return `${baseStyles} top: 10px; right: 10px;`;
	}

	function toggleCollapse() {
		isCollapsed = !isCollapsed;
	}

	function setActiveTab(tab: string) {
		activeTab = tab;
	}

	function clearMessageHistory() {
		messageHistory = [];
		messageBus.clearHistory();
	}

	function updatePerformanceData() {
		const now = performance.now();
		const deltaTime = now - performanceData.lastUpdate;

		if (deltaTime > 0) {
			performanceData.fps = Math.round(1000 / deltaTime);
		}

		performanceData.trackers = trackersStore.activeTrackers.length;
		performanceData.elements =
			document.querySelectorAll("*").length;
		performanceData.lastUpdate = now;
	}

	function updateMemoryData() {
		if ("memory" in performance) {
			const memInfo = (performance as any).memory;
			performanceData.memory = Math.round(
				(memInfo.usedJSHeapSize / 1024 / 1024) * 100,
			) / 100;
		}
	}

	function updateCurrentElement() {
		if (mouse.x && mouse.y) {
			const element = document.elementFromPoint(mouse.x, mouse.y);
			if (element instanceof HTMLElement) {
				currentElement = element;
			}
		}
	}

	function formatBytes(bytes: number): string {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " +
			sizes[i];
	}

	function formatTime(timestamp: number): string {
		return new Date(timestamp).toLocaleTimeString();
	}

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text);
	}

	function exportDebugData() {
		const debugData = {
			timestamp: Date.now(),
			performance: performanceData,
			mouse: mouse,
			inspector: uiStore.svg,
			trackers: Array.from(trackersStore.trackers.values()),
			messages: messageHistory.slice(-50),
			viewport: {
				width: window.innerWidth,
				height: window.innerHeight,
				scroll: {
					x: window.scrollX,
					y: window.scrollY,
				},
			},
			userAgent: navigator.userAgent,
		};

		const blob = new Blob([JSON.stringify(debugData, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `amgiflol-debug-${Date.now()}.json`;
		a.click();
		URL.revokeObjectURL(url);
	}

	onMount(() => {
		if (showPerformance) {
			performanceInterval = setInterval(
				updatePerformanceData,
				1000,
			);
		}

		if (showMemory) {
			memoryInterval = setInterval(updateMemoryData, 2000);
		}

		const messageTypes: Array<
			App.MessageType
		> = [
			"EXTENSION_TOGGLE",
			"INSPECTOR_STATE_CHANGE",
			"ELEMENT_SELECT",
			"ELEMENT_HOVER",
			"TRACKER_CREATE",
			"TRACKER_UPDATE",
			"TRACKER_DELETE",
			"TRACKER_LOCK",
			"UI_UPDATE",
			"SETTINGS_CHANGE",
			"ZOOM_CHANGE",
			"MODE_CHANGE",
			"VIEWPORT_RESIZE",
			"VIEWPORT_SCROLL",
		];

		const messageUnsubscribers = messageTypes.map((type) =>
			createMessageHandler(type, (payload, message) => {
				messageHistory.push(message);
				if (messageHistory.length > 100) {
					messageHistory.shift();
				}
			})
		);

		const mouseUpdateInterval = setInterval(
			updateCurrentElement,
			100,
		);

		return () => {
			if (performanceInterval) clearInterval(performanceInterval);
			if (memoryInterval) clearInterval(memoryInterval);
			if (mouseUpdateInterval) clearInterval(mouseUpdateInterval);
			messageUnsubscribers.forEach((unsub) => unsub());
		};
	});

	onDestroy(() => {
		if (performanceInterval) clearInterval(performanceInterval);
		if (memoryInterval) clearInterval(memoryInterval);
	});
</script>

{#if import.meta.env.DEV && uiStore.debugToolbar.isVisible}
	<div class="relative z-10 text-white">
		<div class="flex justify-between text-lg px-6 py-3">
			<span class="bg-neutral-800 rounded-lg p-2">{mouse.x} x {
					mouse.y
				}</span>
			<span class="bg-neutral-800 rounded-lg p-2">{windowState.innerWidth}
				x {windowState.innerHeight}
			</span>
		</div>
	</div>
{/if}
