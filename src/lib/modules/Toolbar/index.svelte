<script lang="ts">
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
	import {
		Camera,
		Grid3x3,
		LockKeyhole,
		LockKeyholeOpen,
		Skull,
		SquareDashedMousePointer,
	} from "@lucide/svelte";
	import { Separator, Toolbar } from "bits-ui";
	import { onDestroy, onMount } from "svelte";
	import ToolbarSettings from "./ToolbarSettings.svelte";

	let myValue = $state("select");

	const metadataStore = getContext<MetaDataStore>("metadataStore");
	const trackersStore = getContext<TrackersStore>("trackersStore");
	const uiStore = getContext<UIStore>("uiStore");

	interface ToolbarProps {
		autoMove?: boolean;
		position?:
			| "top-left"
			| "top-right"
			| "bottom-left"
			| "bottom-right";
		offsetX?: number;
		offsetY?: number;
		hideDelay?: number;
	}

	let {
		autoMove = true,
		position = "top-left",
		offsetX = 20,
		offsetY = 20,
		hideDelay = 3000,
	}: ToolbarProps = $props();

	let toolbarElement = $state<HTMLElement>();
	let isVisible = $state(true);
	let isDragging = $state(false);
	let isCollapsed = $state(false);
	let hideTimeout: NodeJS.Timeout | null = null;

	let toolbarPosition = $state({ x: offsetX, y: offsetY });
	let dragOffset = $state({ x: 0, y: 0 });

	const trackers = trackersStore;

	let windowDimensions = $state({ width: 0, height: 0 });

	const tools = $derived([
		{
			id: "inspect",
			icon: "🔍",
			label: "Inspect",
			shortcut: "Ctrl+1",
			active: uiStore.svg.mode === "inspect",
			action: () => uiStore.setMode("inspect"),
		},
		{
			id: "select",
			icon: "👆",
			label: "Select",
			shortcut: "Ctrl+2",
			active: uiStore.svg.mode === "select",
			action: () => uiStore.setMode("select"),
		},
		{
			id: "measure",
			icon: "📏",
			label: "Measure",
			shortcut: "Ctrl+3",
			active: uiStore.svg.mode === "measure",
			action: () => uiStore.setMode("measure"),
		},
	]);

	const features = $derived([
		{
			id: "rulers",
			icon: "📐",
			label: "Rulers",
			shortcut: "Ctrl+R",
			active: uiStore.svg.showRulers,
			action: () => uiStore.toggleRulers(),
		},
		{
			id: "distances",
			icon: "📊",
			label: "Distances",
			shortcut: "Ctrl+D",
			active: uiStore.svg.showDistances,
			action: () => uiStore.toggleDistances(),
		},
		{
			id: "lock",
			icon: "🔒",
			label: "Lock All",
			shortcut: "Ctrl+L",
			active: trackers.activeTrackers.some((t) => t.isLocked),
			// action: () => toggleAllTrackers(),
		},
		{
			id: "clear",
			icon: "🗑️",
			label: "Clear",
			shortcut: "Ctrl+Shift+C",
			active: false,
			action: () => trackers.clearAllTrackers(),
		},
	]);

	function capture(event: MouseEvent) {
		event.stopImmediatePropagation();
		sendMessage("SCREENSHOT", undefined, "background");
	}

	function updatePosition() {
		if (!autoMove || !toolbarElement) return;

		const toolbar = toolbarElement.getBoundingClientRect();
		const mouseBuffer = 80;
		const edgeBuffer = 20;

		let newX = toolbarPosition.x;
		let newY = toolbarPosition.y;

		const mouseDistanceX = Math.abs(
			metadataStore.mouse.x - (toolbar.x + toolbar.width / 2),
		);
		const mouseDistanceY = Math.abs(
			metadataStore.mouse.y - (toolbar.y + toolbar.height / 2),
		);
		const mouseDistance = Math.sqrt(
			mouseDistanceX * mouseDistanceX +
				mouseDistanceY * mouseDistanceY,
		);

		if (mouseDistance < mouseBuffer && uiStore.isActive) {
			const availablePositions = [
				{ x: edgeBuffer, y: edgeBuffer },
				{
					x: windowDimensions.width - toolbar.width -
						edgeBuffer,
					y: edgeBuffer,
				},
				{
					x: edgeBuffer,
					y: windowDimensions.height - toolbar.height -
						edgeBuffer,
				},
				{
					x: windowDimensions.width - toolbar.width -
						edgeBuffer,
					y: windowDimensions.height - toolbar.height -
						edgeBuffer,
				},
			];

			let bestPosition = availablePositions[0];
			let maxDistance = 0;

			availablePositions.forEach((pos) => {
				const distance = Math.sqrt(
					Math.pow(
						metadataStore.mouse.x -
							(pos.x + toolbar.width / 2),
						2,
					) +
						Math.pow(
							metadataStore.mouse.y -
								(pos.y + toolbar.height / 2),
							2,
						),
				);
				if (distance > maxDistance) {
					maxDistance = distance;
					bestPosition = pos;
				}
			});

			newX = bestPosition.x;
			newY = bestPosition.y;
		}

		newX = Math.max(
			edgeBuffer,
			Math.min(
				newX,
				windowDimensions.width - toolbar.width - edgeBuffer,
			),
		);
		newY = Math.max(
			edgeBuffer,
			Math.min(
				newY,
				windowDimensions.height - toolbar.height - edgeBuffer,
			),
		);

		if (newX !== toolbarPosition.x || newY !== toolbarPosition.y) {
			toolbarPosition.x = newX;
			toolbarPosition.y = newY;
		}
	}

	function handleKeyboard(event: KeyboardEvent) {
		if (!uiStore.isActive) return;

		const { ctrlKey, metaKey, shiftKey, key } = event;
		const modifier = ctrlKey || metaKey;

		if (modifier) {
			switch (key) {
				case "1":
					event.preventDefault();
					uiStore.setMode("inspect");
					break;
				case "2":
					event.preventDefault();
					uiStore.setMode("select");
					break;
				case "3":
					event.preventDefault();
					uiStore.setMode("measure");
					break;
				case "r":
				case "R":
					event.preventDefault();
					uiStore.toggleRulers();
					break;
				case "d":
				case "D":
					event.preventDefault();
					uiStore.toggleDistances();
					break;
				case "l":
				case "L":
					event.preventDefault();
					// toggleAllTrackers();
					break;
				case "c":
				case "C":
					if (shiftKey) {
						event.preventDefault();
						trackers.clearAllTrackers();
					}
					break;
			}
		}
	}

	$effect(() => {
		if (autoMove && uiStore.isActive) {
			updatePosition();
		}
	});

	onMount(() => {
		windowDimensions.width = window.innerWidth;
		windowDimensions.height = window.innerHeight;

		const handleResize = () => {
			windowDimensions.width = window.innerWidth;
			windowDimensions.height = window.innerHeight;
			updatePosition();
		};

		const positionInterval = setInterval(updatePosition, 100);

		window.addEventListener("resize", handleResize);
		document.addEventListener("keydown", handleKeyboard);

		return () => {
			window.removeEventListener("resize", handleResize);
			document.removeEventListener("keydown", handleKeyboard);
			clearInterval(positionInterval);
			if (hideTimeout) clearTimeout(hideTimeout);
		};
	});

	onDestroy(() => {
		if (hideTimeout) clearTimeout(hideTimeout);
	});
</script>

{#if uiStore.toolbar.isVisible}
	<Toolbar.Root
		class="bg-white fixed bottom-5 shadow-lg inline-flex h-12 items-center justify-center origin-left cursor-pointer rounded-lg p-1 transition-all duration-300"
		style="transform: translateX(calc(50vw - 50%)); z-index: 100001"
	>
		<Toolbar.Group
			value="select"
			type="single"
			class="flex items-center gap-x-0.5"
		>
			<Toolbar.GroupItem
				aria-label="toggle bold"
				value="select"
				class="rounded-sm text-neutral-900 hover:bg-lime-200 hover:text-lime-500 active:bg-lime-700 data-[state=on]:bg-lime-700 data-[state=on]:text-white/80 inline-flex size-10 items-center justify-center transition-all active:scale-[0.98]"
			>
				<SquareDashedMousePointer class="size-5" />
				<span
					class="text-xs duration-75 absolute translate-y-3 translate-x-3.5"
				>1</span>
			</Toolbar.GroupItem>
			{#if myValue === "select"}
				<Toolbar.Button
					aria-label="align left"
					onclick={trackers.current?.toggleLock}
					class="rounded-sm text-neutral-900 hover:bg-lime-200 hover:text-lime-500 active:bg-lime-700 data-[state=on]:bg-lime-700 data-[state=on]:text-white/80 inline-flex size-10 items-center justify-center transition-all active:scale-[0.98]"
				>
					{@const 				Icon = trackers.current?.isLocked
					? LockKeyhole
					: LockKeyholeOpen}
					<Icon class="size-5" />
					<span
						class="text-xs duration-75 absolute translate-y-3 translate-x-3.5"
					>@</span>
				</Toolbar.Button>
				<Toolbar.Button
					aria-label="align left"
					value="right"
					class="rounded-sm text-neutral-900 hover:bg-lime-200 hover:text-lime-500 active:bg-lime-700 data-[state=on]:bg-lime-700 data-[state=on]:text-white/80 inline-flex size-10 items-center justify-center transition-all active:scale-[0.98]"
				>
					<Grid3x3 class="size-6" />
				</Toolbar.Button>
				<Separator.Root
					class="bg-neutral-200 -my-1 mx-1 w-[1px] self-stretch"
				/>
			{/if}
			<Toolbar.GroupItem
				aria-label="toggle italic"
				value="italic"
				class="rounded-sm text-neutral-900 hover:bg-lime-200 hover:text-lime-500 active:bg-lime-700 data-[state=on]:bg-lime-700 data-[state=on]:text-white/80 inline-flex size-10 items-center justify-center transition-all active:scale-[0.98]"
			>
				<Skull class="size-6" />
			</Toolbar.GroupItem>
		</Toolbar.Group>
		<Separator.Root
			class="bg-neutral-200 -my-1 mx-1 w-[1px] self-stretch"
		/>
		<span onclickcapture={capture}>
			<Toolbar.Button
				aria-label="toggle strikethrough"
				value="strikethrough"
				class="rounded-sm text-neutral-900 hover:bg-lime-200 hover:text-lime-500 active:bg-lime-700 data-[state=on]:bg-lime-700 data-[state=on]:text-white/80 inline-flex size-10 items-center justify-center transition-all active:scale-[0.98]"
			>
				<Camera absoluteStrokeWidth class="size-6" />
				<span
					class="text-xs duration-75 absolute translate-y-3 translate-x-3.5"
				>9</span>
			</Toolbar.Button>
		</span>
		<Separator.Root
			class="bg-neutral-200 -my-1 mx-1 w-[1px] self-stretch"
		/>
		<Toolbar.Button><ToolbarSettings /></Toolbar.Button>
	</Toolbar.Root>
{/if}
