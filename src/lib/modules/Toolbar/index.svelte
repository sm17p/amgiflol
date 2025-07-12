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
		ChevronsLeftRightEllipsis,
		Grid3x3,
		LockKeyhole,
		LockKeyholeOpen,
		PanelRightOpen,
		Ruler,
		SquareDashedMousePointer,
	} from "@lucide/svelte";
	import { Separator } from "bits-ui";
	import { onDestroy, onMount } from "svelte";
	import ToolbarAction from "./ToolbarAction.svelte";
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
		offsetX = 20,
		offsetY = 20,
	}: ToolbarProps = $props();

	let toolbarElement = $state<HTMLElement>();
	let hideTimeout: NodeJS.Timeout | null = null;

	let toolbarPosition = $state({ x: offsetX, y: offsetY });

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
			active: uiStore.svg.showRuler,
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

	async function capture(pressed: boolean) {
		// event?.stopImmediatePropagation();
		uiStore.toggleToolbar();
		setTimeout(() => {
			sendMessage("SCREENSHOT", undefined, "background");
		}, 1);
		setTimeout(() => {
			uiStore.toggleToolbar();
		}, 400);
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
					x: metadataStore.window.innerWidth - toolbar.width -
						edgeBuffer,
					y: edgeBuffer,
				},
				{
					x: edgeBuffer,
					y: metadataStore.window.innerHeight -
						toolbar.height -
						edgeBuffer,
				},
				{
					x: metadataStore.window.innerWidth - toolbar.width -
						edgeBuffer,
					y: metadataStore.window.innerHeight -
						toolbar.height -
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
				metadataStore.window.innerWidth - toolbar.width -
					edgeBuffer,
			),
		);
		newY = Math.max(
			edgeBuffer,
			Math.min(
				newY,
				metadataStore.window.innerHeight - toolbar.height -
					edgeBuffer,
			),
		);

		if (newX !== toolbarPosition.x || newY !== toolbarPosition.y) {
			toolbarPosition.x = newX;
			toolbarPosition.y = newY;
		}
	}

	function handleKeyDown(
		event: KeyboardEvent,
		message: App.Message<KeyboardEvent>,
	) {
		switch (event.key) {
			case "9":
				capture(true);
				break;
		}
	}

	$effect(() => {
		const cleanup = createMessageHandler("KEYDOWN", handleKeyDown);
		return cleanup;
	});

	onMount(() => {
		const handleResize = () => {
			updatePosition();
		};

		const positionInterval = setInterval(updatePosition, 100);

		return () => {
			clearInterval(positionInterval);
			if (hideTimeout) clearTimeout(hideTimeout);
		};
	});

	onDestroy(() => {
		if (hideTimeout) clearTimeout(hideTimeout);
	});
</script>

{#if uiStore.toolbar.isVisible}
	<div
		class="fixed shadow-lg bottom-3 inline-flex h-12 items-center justify-center origin-left gap-x-0.5 bg-white cursor-pointer rounded-lg p-1 transition-all duration-150 pointer-events-initial"
		style="--spacing: 4px; z-index: 10000000003; transform: translateX(calc(50vw - 50%))"
	>
		<ToolbarAction
			disabled
			pressed={uiStore.svg.mode === "inspect"}
			label="Inspector Mode"
			shortcut="1"
		>
			<SquareDashedMousePointer absoluteStrokeWidth class="size-5" />
		</ToolbarAction>
		{#if trackers.current}
			<ToolbarAction
				bind:pressed={trackers.current.isLocked}
				label="Lock Inspector"
				shortcut="@"
			>
				{@const 			Icon = trackers.current?.isLocked
				? LockKeyhole
				: LockKeyholeOpen}
				<Icon absoluteStrokeWidth class="size-6" />
			</ToolbarAction>
		{/if}
		<ToolbarAction
			bind:pressed={uiStore.svg.showGrid}
			label="Show Grid Lines"
			shortcut="#"
		>
			<Grid3x3 absoluteStrokeWidth class="size-6" />
		</ToolbarAction>
		<ToolbarAction
			bind:pressed={uiStore.svg.showRuler}
			label="Show Ruler"
			shortcut="$"
		>
			<Ruler absoluteStrokeWidth class="size-6" />
		</ToolbarAction>
		<ToolbarAction
			bind:pressed={uiStore.svg.showDistances}
			label="Show Distances"
			shortcut="%"
		>
			<ChevronsLeftRightEllipsis absoluteStrokeWidth class="size-6" />
		</ToolbarAction>
		<Separator.Root class="bg-neutral-200 -my-1 mx-1 w-0.5 self-stretch" />
		<ToolbarAction
			bind:pressed={uiStore.sidePanel.isVisible}
			label="Show Side Panel"
			shortcut="8"
		>
			<PanelRightOpen absoluteStrokeWidth class="size-6" />
		</ToolbarAction>
		<Separator.Root class="bg-neutral-200 -my-1 mx-1 w-0.5 self-stretch" />
		<ToolbarAction
			pressed={false}
			label="Screenshot"
			onPressedChange={capture}
			shortcut="9"
		>
			<Camera absoluteStrokeWidth class="size-6" />
		</ToolbarAction>
		<Separator.Root class="bg-neutral-200 -my-1 mx-1 w-0.5 self-stretch" />
		<ToolbarSettings />
	</div>
{/if}
