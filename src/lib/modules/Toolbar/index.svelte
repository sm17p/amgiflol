<script lang="ts">
	import ToolbarAction from "@/lib/components/ToolbarAction.svelte";
	import {
		createMessageHandler,
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
		Rainbow,
		Ruler,
		RulerDimensionLine,
		SquareDashedMousePointer,
		TextCursor,
	} from "@lucide/svelte";
	import { Separator } from "bits-ui";
	import { fly } from "svelte/transition";
	import ToolbarSettings from "./ToolbarSettings.svelte";

	const metadataStore = getContext<MetaDataStore>("metadataStore");
	const trackersStore = getContext<TrackersStore>("trackersStore");
	const uiStore = getContext<UIStore>("uiStore");

	const isMac = $derived(metadataStore.platformInfo.os === "mac");

	const disableForFirefox = !import.meta.env.DEV &&
		import.meta.env.FIREFOX;

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
		sendMessage("SCREENSHOT", undefined, { background: true });
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
		if (event.key === "7") {
			designMode(true);
		} else if (
			(event.key === "9" ||
				event.altKey && event.code === "Digit9")
		) {
			capture(true);
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
		class={[
			"fixed w-full grid place-items-center pointer-events-none",
			{
				"bottom-0": bottom,
				"top-0": !bottom,
			},
		]}
		transition:fly|global={{
			y,
			duration: 150,
		}}
		style="--spacing: 4px; z-index: 1000000006"
	>
		<div
			class={[
				"pointer-events-initial pt-3 pb-1 px-1 sm:px-3 sm:pb-3 flex",
				{
					"flex-col-reverse": bottom,
					"flex-col": !bottom,
				},
			]}
		>
			{#if uiStore.toolbar.isVisible}
				<div
					in:fly|global={{ duration: 300 }}
					class="shadow-lg inline-flex items-center justify-center origin-left gap-x-0.5 bg-white cursor-pointer rounded-lg p-1 mx-auto transition-width duration-300"
				>
					<ToolbarAction
						disabled
						pressed={uiStore.svg.mode === "inspect"}
						label="Inspector Mode"
						shortcut="1"
					>
						<SquareDashedMousePointer
							absoluteStrokeWidth
							class="size-4 sm:size-5"
						/>
					</ToolbarAction>
					{#if trackers.current}
						<ToolbarAction
							class=""
							bind:pressed={trackers.current.isLocked}
							label={`${
								trackers.current.isLocked
									? "Unlock"
									: "Lock"
							} Inspector`}
							shortcut="@"
						>
							{@const 					Icon = trackers.current?.isLocked
						? LockKeyhole
						: LockKeyholeOpen}
							<Icon
								absoluteStrokeWidth
								class="size-4 sm:size-6"
							/>
						</ToolbarAction>
					{/if}
					{#if trackers.current?.isLocked}
						<ToolbarAction
							disabled={true}
							pressed={metadataStore.keyboard.modifiers.alt}
							label={`Hold ${
								isMac ? "option" : "alt"
							} and hover around to measure distance between layers`}
							shortcut={isMac ? "⌥" : "alt"}
						>
							<RulerDimensionLine class="size-4 sm:size-6" />
						</ToolbarAction>
					{/if}
					<ToolbarAction
						bind:pressed={uiStore.svg.showGrid}
						label="Show Grid Lines"
						shortcut="#"
					>
						<Grid3x3 absoluteStrokeWidth class="size-4 sm:size-6" />
					</ToolbarAction>
					<ToolbarAction
						bind:pressed={uiStore.svg.showRuler}
						label="Show Ruler"
						shortcut="$"
					>
						<Ruler absoluteStrokeWidth class="size-4 sm:size-6" />
					</ToolbarAction>
					<ToolbarAction
						bind:pressed={uiStore.svg.showDistances}
						label="Show Distances"
						shortcut="%"
					>
						<ChevronsLeftRightEllipsis
							absoluteStrokeWidth
							class="size-4 sm:size-6"
						/>
					</ToolbarAction>
					<Separator.Root
						class="bg-neutral-200 -my-1 mx-0.5 sm:mx-1 w-0.5 self-stretch"
					/>
					<ToolbarAction
						disabled={disableForFirefox}
						pressed={uiStore.rainbowLayout.enabled}
						onPressedChange={uiStore.toggleRainbowLayout}
						label={disableForFirefox
							? "Chrome only for now!"
							: "Rainbow Layouts"}
						shortcut="6"
					>
						<Rainbow absoluteStrokeWidth class="size-4 sm:size-6" />
					</ToolbarAction>
					<Separator.Root
						class="bg-neutral-200 -my-1 mx-0.5 sm:mx-1 w-0.5 self-stretch"
					/>
					<ToolbarAction
						pressed={designModePressed}
						onPressedChange={designMode}
						label="Design Mode: Edit any text on the document"
						shortcut="7"
					>
						<TextCursor
							absoluteStrokeWidth
							class="size-3 sm:size-4"
						/>
					</ToolbarAction>
					<Separator.Root
						class="bg-neutral-200 -my-1 mx-0.5 sm:mx-1 w-0.5 self-stretch"
					/>
					<ToolbarAction
						bind:pressed={uiStore.sidePanel.isVisible}
						label="Show Side Panel"
						shortcut="8"
					>
						<PanelRightOpen
							absoluteStrokeWidth
							class="size-4 sm:size-6"
						/>
					</ToolbarAction>
					<Separator.Root
						class="bg-neutral-200 -my-1 mx-0.5 sm:mx-1 w-0.5 self-stretch"
					/>
					<ToolbarAction
						pressed={false}
						label="Screenshot"
						onPressedChange={capture}
						shortcut="9"
					>
						<Camera absoluteStrokeWidth class="size-4 sm:size-6" />
					</ToolbarAction>
					<Separator.Root
						class="bg-neutral-200 -my-1 mx-0.5 sm:mx-1 w-0.5 self-stretch"
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
		</div>
	</section>
{/snippet}
