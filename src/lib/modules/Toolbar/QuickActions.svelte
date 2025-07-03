<script lang="ts">
	import { messageBus } from "@/lib/core/MessageBus";
	import { UIStore } from "@/lib/store/index.svelte";
	import { onDestroy, onMount } from "svelte";

	interface QuickActionsProps {
		position?: "floating" | "sidebar" | "bottom";
		showLabels?: boolean;
		size?: "small" | "medium" | "large";
	}

	let {
		position = "floating",
		showLabels = true,
		size = "medium",
	}: QuickActionsProps = $props();

	let isVisible = $state(false);
	let isExpanded = $state(false);
	let lastActivity = $state(Date.now());
	let hideTimeout: NodeJS.Timeout | null = null;

	const trackers = trackersStore;
	const mouse = metadataStore.mouse;

	const quickActions = [
		{
			id: "new-tracker",
			icon: "➕",
			label: "New Tracker",
			shortcut: "Ctrl+N",
			action: () => createNewTracker(),
			condition: () => uiStore.isActive,
		},
		{
			id: "copy-selection",
			icon: "📋",
			label: "Copy Info",
			shortcut: "Ctrl+C",
			action: () => copySelectedInfo(),
			condition: () => trackers.selectedTracker !== null,
		},
		{
			id: "jump-parent",
			icon: "⬆️",
			label: "Jump to Parent",
			shortcut: "Shift+↑",
			action: () => jumpToParent(),
			condition: () => trackers.selectedTracker !== null,
		},
		{
			id: "jump-child",
			icon: "⬇️",
			label: "Jump to Child",
			shortcut: "Shift+↓",
			action: () => jumpToChild(),
			condition: () => trackers.selectedTracker !== null,
		},
		{
			id: "lock-toggle",
			icon: "🔒",
			label: "Toggle Lock",
			shortcut: "Ctrl+L",
			action: () => toggleSelectedLock(),
			condition: () => trackers.selectedTracker !== null,
		},
		{
			id: "delete-tracker",
			icon: "🗑️",
			label: "Delete",
			shortcut: "Delete",
			action: () => deleteSelected(),
			condition: () => trackers.selectedTracker !== null,
		},
		{
			id: "clear-all",
			icon: "🧹",
			label: "Clear All",
			shortcut: "Ctrl+Shift+C",
			action: () => clearAllTrackers(),
			condition: () => trackers.activeTrackers.length > 0,
		},
		{
			id: "screenshot",
			icon: "📸",
			label: "Screenshot",
			shortcut: "Ctrl+Shift+S",
			action: () => takeScreenshot(),
			condition: () => uiStore.isActive,
		},
	];

	let availableActions = $derived(
		quickActions.filter((action) => action.condition()),
	);

	function createNewTracker() {
		const elementAtMouse = document.elementFromPoint(
			mouse.x,
			mouse.y,
		);
		if (
			elementAtMouse instanceof HTMLElement &&
			!isExtensionElement(elementAtMouse)
		) {
			const elementInfo = {
				tagName: elementAtMouse.tagName.toLowerCase(),
				id: elementAtMouse.id || "",
				classes: Array.from(elementAtMouse.classList),
				dimensions: {
					width: elementAtMouse.offsetWidth,
					height: elementAtMouse.offsetHeight,
					aspectRatio: "1:1",
					x: elementAtMouse.offsetLeft,
					y: elementAtMouse.offsetTop,
				},
				computedStyles: {
					fontSize: "",
					lineHeight: "",
					fontFamily: "",
					color: "",
					backgroundColor: "",
					margin: "",
					padding: "",
					border: "",
					display: "",
					position: "",
					zIndex: "",
					lineHeightToFontSizeRatio: "",
				},
				attributes: {},
			};
			const trackerId = trackers.createTracker(
				elementAtMouse,
				elementInfo,
			);
			trackers.lockTracker(trackerId);
			trackers.selectTracker(trackerId);
		}
	}

	function copySelectedInfo() {
		const selectedId = trackers.selectedTracker;
		if (selectedId) {
			const tracker = trackers.trackers.get(selectedId);
			if (tracker) {
				const info = {
					element: tracker.elementInfo.tagName,
					id: tracker.elementInfo.id,
					classes: tracker.elementInfo.classes,
					dimensions: tracker.elementInfo.dimensions,
					styles: tracker.elementInfo.computedStyles,
				};
				navigator.clipboard.writeText(
					JSON.stringify(info, null, 2),
				);
				showFeedback("Copied to clipboard");
			}
		}
	}

	function jumpToParent() {
		const selectedId = trackers.selectedTracker;
		if (selectedId) {
			const tracker = trackers.trackers.get(selectedId);
			if (tracker?.element.parentElement) {
				const parent = tracker.element.parentElement;
				const elementInfo = {
					tagName: parent.tagName.toLowerCase(),
					id: parent.id || "",
					classes: Array.from(parent.classList),
					dimensions: {
						width: parent.offsetWidth,
						height: parent.offsetHeight,
						aspectRatio: "1:1",
						x: parent.offsetLeft,
						y: parent.offsetTop,
					},
					computedStyles: {
						fontSize: "",
						lineHeight: "",
						fontFamily: "",
						color: "",
						backgroundColor: "",
						margin: "",
						padding: "",
						border: "",
						display: "",
						position: "",
						zIndex: "",
						lineHeightToFontSizeRatio: "",
					},
					attributes: {},
				};
				const newTrackerId = trackers.createTracker(
					parent,
					elementInfo,
				);
				trackers.lockTracker(newTrackerId);
				trackers.selectTracker(newTrackerId);
			}
		}
	}

	function jumpToChild() {
		const selectedId = trackers.selectedTracker;
		if (selectedId) {
			const tracker = trackers.trackers.get(selectedId);
			if (tracker?.element.firstElementChild) {
				const child = tracker.element
					.firstElementChild as HTMLElement;
				const elementInfo = {
					tagName: child.tagName.toLowerCase(),
					id: child.id || "",
					classes: Array.from(child.classList),
					dimensions: {
						width: child.offsetWidth,
						height: child.offsetHeight,
						aspectRatio: "1:1",
						x: child.offsetLeft,
						y: child.offsetTop,
					},
					computedStyles: {
						fontSize: "",
						lineHeight: "",
						fontFamily: "",
						color: "",
						backgroundColor: "",
						margin: "",
						padding: "",
						border: "",
						display: "",
						position: "",
						zIndex: "",
						lineHeightToFontSizeRatio: "",
					},
					attributes: {},
				};
				const newTrackerId = trackers.createTracker(
					child,
					elementInfo,
				);
				trackers.lockTracker(newTrackerId);
				trackers.selectTracker(newTrackerId);
			}
		}
	}

	function toggleSelectedLock() {
		const selectedId = trackers.selectedTracker;
		if (selectedId) {
			const tracker = trackers.trackers.get(selectedId);
			if (tracker) {
				if (tracker.isLocked) {
					trackers.unlockTracker(selectedId);
				} else {
					trackers.lockTracker(selectedId);
				}
			}
		}
	}

	function deleteSelected() {
		const selectedId = trackers.selectedTracker;
		if (selectedId) {
			trackers.deleteTracker(selectedId);
			showFeedback("Tracker deleted");
		}
	}

	function clearAllTrackers() {
		const count = trackers.activeTrackers.length;
		trackers.clearAllTrackers();
		showFeedback(`Cleared ${count} trackers`);
	}

	function takeScreenshot() {
		showFeedback("Screenshot feature coming soon");
	}

	function showFeedback(message: string) {
		messageBus.broadcast("UI_UPDATE", {
			type: "notification",
			message,
			duration: 2000,
		});
	}

	function handleActivity() {
		lastActivity = Date.now();
		if (!isVisible && uiStore.isActive) {
			isVisible = true;
		}
		resetHideTimer();
	}

	function resetHideTimer() {
		if (hideTimeout) {
			clearTimeout(hideTimeout);
		}
		hideTimeout = setTimeout(() => {
			if (!isExpanded && uiStore.isActive) {
				isVisible = false;
			}
		}, 5000);
	}

	function handleMouseEnter() {
		isExpanded = true;
		if (hideTimeout) {
			clearTimeout(hideTimeout);
		}
	}

	function handleMouseLeave() {
		isExpanded = false;
		resetHideTimer();
	}

	function handleKeyboard(event: KeyboardEvent) {
		if (!uiStore.isActive) return;

		const { ctrlKey, metaKey, shiftKey, key } = event;
		const modifier = ctrlKey || metaKey;

		if (modifier && shiftKey) {
			switch (key.toLowerCase()) {
				case "c":
					event.preventDefault();
					clearAllTrackers();
					break;
				case "s":
					event.preventDefault();
					takeScreenshot();
					break;
			}
		} else if (modifier) {
			switch (key.toLowerCase()) {
				case "n":
					event.preventDefault();
					createNewTracker();
					break;
				case "c":
					event.preventDefault();
					copySelectedInfo();
					break;
				case "l":
					event.preventDefault();
					toggleSelectedLock();
					break;
			}
		} else if (shiftKey) {
			switch (key) {
				case "ArrowUp":
					event.preventDefault();
					jumpToParent();
					break;
				case "ArrowDown":
					event.preventDefault();
					jumpToChild();
					break;
			}
		} else {
			switch (key) {
				case "Delete":
				case "Backspace":
					event.preventDefault();
					deleteSelected();
					break;
			}
		}

		handleActivity();
	}

	$effect(() => {
		if (uiStore.isActive && trackers.activeTrackers.length > 0) {
			handleActivity();
		}
	});

	onMount(() => {
		document.addEventListener("mousemove", handleActivity);
		document.addEventListener("keydown", handleKeyboard);
		document.addEventListener("click", handleActivity);

		return () => {
			document.removeEventListener("mousemove", handleActivity);
			document.removeEventListener("keydown", handleKeyboard);
			document.removeEventListener("click", handleActivity);
			if (hideTimeout) clearTimeout(hideTimeout);
		};
	});

	onDestroy(() => {
		if (hideTimeout) clearTimeout(hideTimeout);
	});
</script>

{#if uiStore.isActive && isVisible}
	<div
		class="
			fixed z-[9999] font-[Inter,system-ui,sans-serif] pointer-events-auto transition-all duration-300 ease-in-out select-none {position ===
			'floating'
			? 'bottom-5 right-5'
			: position === 'sidebar'
			? 'top-1/2 right-5 -translate-y-1/2'
			: 'bottom-5 left-1/2 -translate-x-1/2'}
		"
		onmouseenter={handleMouseEnter}
		onmouseleave={handleMouseLeave}
	>
		<div
			class="
				bg-white bg-opacity-95 backdrop-blur-xl border border-black border-opacity-10 rounded-xl p-2 flex gap-1 shadow-[0_8px_32px_rgba(0,0,0,0.15)] max-h-96 overflow-y-auto {position ===
				'floating' || position === 'sidebar'
				? 'flex-col'
				: 'flex-row'} {!isExpanded ? 'max-w-48 overflow-hidden' : ''}
			"
		>
			{#if availableActions.length > 0}
				{#each availableActions as action}
					<button
						class="
							flex items-center gap-2 px-2 py-2 border-0 rounded-lg bg-transparent cursor-pointer transition-all duration-200 ease-in-out text-sm font-medium text-gray-700 min-h-9 whitespace-nowrap hover:bg-blue-500 hover:bg-opacity-10 hover:text-blue-700 hover:-translate-y-px hover:shadow-[0_2px_8px_rgba(59,130,246,0.15)] active:translate-y-0 {size ===
							'small'
							? 'px-1.5 min-h-7'
							: size === 'large'
							? 'px-3 min-h-11'
							: ''}
						"
						onclick={action.action}
						title="{action.label} ({action.shortcut})"
						aria-label={action.label}
						data-action={action.id}
					>
						<span
							class="
								text-sm leading-none flex-shrink-0 {size === 'small'
								? 'text-xs'
								: size === 'large'
								? 'text-base'
								: ''}
							"
						>{action.icon}</span>
						{#if showLabels && isExpanded}
							<span
								class="
									text-xs font-medium flex-shrink-0 {size === 'small'
									? 'text-[10px]'
									: size === 'large'
									? 'text-xs'
									: ''}
								"
							>{action.label}</span>
						{/if}
					</button>
				{/each}
			{:else}
				<div class="flex items-center gap-2 px-3 py-3 text-gray-500 text-xs italic">
					<span class="text-sm opacity-70">💡</span>
					{#if showLabels}
						<span>Select an element to see actions</span>
					{/if}
				</div>
			{/if}
		</div>

		{#if !isExpanded && availableActions.length > 3}
			<div class="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[9px] font-semibold leading-none shadow-[0_2px_8px_rgba(59,130,246,0.3)]">
				<span>+{availableActions.length - 3}</span>
			</div>
		{/if}
	</div>
{/if}

<style>
	@media (prefers-color-scheme: dark) {
		.quick-actions {
			background: rgba(31, 41, 55, 0.95);
			border-color: rgba(255, 255, 255, 0.1);
		}

		.action-btn {
			color: #f3f4f6;
		}

		.action-btn:hover {
			background: rgba(59, 130, 246, 0.2);
			color: #60a5fa;
		}

		.no-actions {
			color: #9ca3af;
		}
	}

	@media (max-width: 640px) {
		.quick-actions.floating,
		.quick-actions.sidebar {
			bottom: 80px;
			right: 10px;
		}

		.quick-actions.bottom {
			bottom: 10px;
			left: 10px;
			right: 10px;
			transform: none;
		}

		.bottom .actions-container {
			flex-wrap: wrap;
			justify-content: center;
		}

		.action-label {
			display: none;
		}
	}
</style>
