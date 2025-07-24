<script lang="ts">
	import ToolbarAction from "@/lib/components/ToolbarAction.svelte";
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
		TextCursor,
	} from "@lucide/svelte";
	import { Separator } from "bits-ui";
	import { onDestroy, onMount } from "svelte";
	import { fade, fly } from "svelte/transition";
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

	let hideTimeout: NodeJS.Timeout | null = null;

	const trackers = trackersStore;

	let designModePressed = $state(false);

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

	async function capture(pressed: boolean) {
		let isAutoHide = uiStore.toolbar.autoHide;
		if (isAutoHide) {
			uiStore.toggleAutoHide();
		}
		uiStore.makeToolbarVisible(false);
		await new Promise(resolve => setTimeout(resolve, 350));
		sendMessage("SCREENSHOT", undefined, "background");
		await new Promise(resolve => setTimeout(resolve, 100));
		if (isAutoHide) {
			uiStore.toggleAutoHide();
		}
		uiStore.makeToolbarVisible(true);
	}

	function designMode(_pressed: boolean) {
		designModePressed = !designModePressed;
		document.designMode = designModePressed ? "on" : "off";
	}

	function handleKeyDown(
		event: KeyboardEvent,
		message: App.Message<KeyboardEvent>,
	) {
		switch (event.key) {
			case "7":
				designMode(true);
				break;
			case "9":
				capture(true);
				break;
		}
	}

	function onmouseenterToolbar() {
		if (uiStore.toolbar.autoHide) {
			uiStore.toolbar.settings.open = false;
			uiStore.makeToolbarVisible(true);
		}
	}

	function onmouseleaveToolbar() {
		if (uiStore.toolbar.autoHide) {
			uiStore.makeToolbarVisible(false);
		}
	}

	let toolbarInBottomHalf = $state(true);

	$effect.pre(() => {
		if (
			trackersStore?.current && !trackersStore.current.isLocked &&
			uiStore.toolbar.isVisible &&
			uiStore.toolbar.autoMove
		) {
			const halfPointY = metadataStore.window.innerHeight / 2;

			toolbarInBottomHalf = metadataStore.mouse.y <= halfPointY;
		}
	});

	$effect(() => {
		const cleanup = createMessageHandler("KEYDOWN", handleKeyDown);
		return cleanup;
	});
</script>

{#if toolbarInBottomHalf}
	{@render Toolbar(true, 200)}
{:else}
	{@render Toolbar(false, -200)}
{/if}

{#snippet Toolbar(bottom: boolean, y: number)}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<section
		onmouseenter={onmouseenterToolbar}
		onmouseleave={onmouseleaveToolbar}
		class={["fixed p-3 pointer-events-initial h-18 w-full flex", {
			"bottom-0 flex-col-reverse": bottom,
			"top-0 flex-col": !bottom,
		}]}
		transition:fly|global={{
			y,
			duration: 150,
		}}
		style="--spacing: 4px; z-index: 1000000006"
	>
		{#if uiStore.toolbar.isVisible}
			<div
				in:fly|global={{ duration: 300 }}
				class="shadow-lg inline-flex items-center justify-center origin-left gap-x-0.5 bg-white cursor-pointer rounded-lg p-1 mx-auto"
			>
				<ToolbarAction
					disabled
					pressed={uiStore.svg.mode === "inspect"}
					label="Inspector Mode"
					shortcut="1"
				>
					<SquareDashedMousePointer
						absoluteStrokeWidth
						class="size-5"
					/>
				</ToolbarAction>
				{#if trackers.current}
					<ToolbarAction
						bind:pressed={trackers.current.isLocked}
						label={`${
							trackers.current.isLocked
								? "Unlock"
								: "Lock"
						} Inspector`}
						shortcut="@"
					>
						{@const 				Icon = trackers.current?.isLocked
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
					<ChevronsLeftRightEllipsis
						absoluteStrokeWidth
						class="size-6"
					/>
				</ToolbarAction>
				<Separator.Root
					class="bg-neutral-200 -my-1 mx-1 w-0.5 self-stretch"
				/>
				<ToolbarAction
					pressed={designModePressed}
					onPressedChange={designMode}
					label="Design Mode: Edit any text on the document"
					shortcut="7"
				>
					<TextCursor absoluteStrokeWidth class="size-4" />
				</ToolbarAction>
				<Separator.Root
					class="bg-neutral-200 -my-1 mx-1 w-0.5 self-stretch"
				/>
				<ToolbarAction
					bind:pressed={uiStore.sidePanel.isVisible}
					label="Show Side Panel"
					shortcut="8"
				>
					<PanelRightOpen absoluteStrokeWidth class="size-6" />
				</ToolbarAction>
				<Separator.Root
					class="bg-neutral-200 -my-1 mx-1 w-0.5 self-stretch"
				/>
				<ToolbarAction
					pressed={false}
					label="Screenshot"
					onPressedChange={capture}
					shortcut="9"
				>
					<Camera absoluteStrokeWidth class="size-6" />
				</ToolbarAction>
				<Separator.Root
					class="bg-neutral-200 -my-1 mx-1 w-0.5 self-stretch"
				/>
				<ToolbarSettings />
			</div>
		{:else}
			<div
				in:fly|global={{ duration: 300 }}
				class="shadow-lg inline-flex items-center justify-center h-4 bg-lime-500 rounded-lg w-16 mx-auto"
			>
			</div>
		{/if}
	</section>
{/snippet}
