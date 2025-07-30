<script lang="ts">
	import { MetaDataStore } from "@/lib/store/MetaDataStore.svelte";
	import { TrackersStore } from "@/lib/store/TrackersStore.svelte";
	import { TrackerState } from "@/lib/store/TrackerState.svelte";
	import { UIStore } from "@/lib/store/UIStore.svelte";
	import { fly } from "svelte/transition";

	const metadataStore = getContext<MetaDataStore>("metadataStore");
	const uiStore = getContext<UIStore>("uiStore");
	const trackersStore = getContext<TrackersStore>("trackersStore");

	let panelInLeftHalfState = $state(false);

	$effect.pre(() => {
		if (
			trackersStore?.current && !trackersStore.current.isLocked &&
			uiStore.sidePanel.isVisible &&
			uiStore.sidePanel.autoMove &&
			trackersStore.current.target?.bounds
		) {
			const { left, right } = trackersStore.current.target.bounds;

			let boxSize = right - left;

			const meanX = (left + right) / 2;
			const halfPointX = metadataStore.window.innerWidth / 2;

			if (boxSize > halfPointX) {
				panelInLeftHalfState =
					metadataStore.mouse.x > halfPointX;
			} else {
				panelInLeftHalfState = meanX >= halfPointX;
			}
		}
	});

	function copyToClipboard(text: string) {
		navigator.clipboard
			.writeText(text)
			.then(() => {
				console.log("Copied to clipboard:", text);
			})
			.catch((err) => {
				console.error("Failed to copy: ", err);
			});
	}
</script>

{#if trackersStore?.current?.target && uiStore.sidePanel.isVisible}
	{#if panelInLeftHalfState}
		{@render SidePanel(trackersStore.current.target, true, -200)}
	{:else}
		{@render SidePanel(trackersStore.current.target, false, 200)}
	{/if}
{/if}

{#snippet SidePanel(
	tracker: App.TrackerTargetMetaData,
	left: boolean,
	x: number,
)}
	<aside
		class={[
			"fixed top-0 bg-white border border-zinc-200 rounded-lg shadow-xl translate-y-1/10 h-[80vh] overflow-auto pointer-events-initial",
			{
				"left-2": left,
				"right-2": !left,
			},
		]}
		transition:fly|global={{
			x,
			duration: 150,
		}}
		style={`width:${uiStore.sidePanel.width}px; z-index: 1000000005;`}
	>
		<div class="px-4 pb-4 space-y-4">
			<header class="border-b bg-white border-zinc-200 pb-3 sticky pt-4">
				<h2 class="text-lg font-semibold text-zinc-800 m-0">
					Element Inspector
				</h2>
			</header>

			<!-- Element Info -->
			<section class="space-y-2">
				<h3 class="text-sm font-medium text-zinc-600 uppercase tracking-wide m-0">
					Element
				</h3>
				<div class="space-y-1">
					<div class="flex items-center justify-between">
						<span class="text-xs text-zinc-600">Tag:</span>
						<button
							class="text-sm text-zinc-800 hover:text-white transition-colors cursor-pointer font-mono bg-lime-400 hover:bg-lime-500 px-2 py-1 rounded"
							onclick={() =>
								copyToClipboard(
									tracker.properties
										?.tagName || "",
								)}
						>
							{
								tracker.properties
									?.tagName || "N/A"
							}
						</button>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-xs text-zinc-600">ID:</span>
						<button
							class="text-sm text-zinc-800 hover:text-white transition-colors cursor-pointer font-mono bg-lime-400 hover:bg-lime-500 px-2 py-1 rounded"
							onclick={() =>
								copyToClipboard(
									tracker.properties?.id ||
										"",
								)}
						>
							{
								tracker.properties
									?.id || "N/A"
							}
						</button>
					</div>
					<div class="flex items-start justify-between">
						<span class="text-xs text-zinc-600">Classes:</span>
						<div class="flex flex-wrap gap-1 justify-end max-w-[200px]">
							{#each 							tracker.properties
								?.classes ?? [] as
								className
							}
								<button
									class="text-xs text-zinc-800 hover:text-white transition-colors cursor-pointer font-mono bg-lime-400 hover:bg-lime-500 px-1 py-0.5 rounded"
									onclick={() =>
										copyToClipboard(
											className,
										)}
								>
									{className}
								</button>
							{/each}
						</div>
					</div>
				</div>
			</section>

			<!-- Dimensions -->
			<section class="space-y-2">
				<h3 class="text-sm font-medium text-zinc-600 uppercase tracking-wide m-0">
					Dimensions
				</h3>
				<div class="grid grid-cols-2 gap-2">
					<div class="flex items-center justify-between col-span-2">
						<span class="text-xs text-zinc-600">Aspect Ratio:</span>
						<button
							class="text-sm text-zinc-800 hover:text-white transition-colors cursor-pointer font-mono bg-lime-400 hover:bg-lime-500 px-2 py-1 rounded"
							onclick={() =>
								copyToClipboard(
									tracker.properties
										?.dimensions
										.aspectRatio || "",
								)}
						>
							{
								tracker.properties
									?.dimensions
									.aspectRatio
							}
						</button>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-xs text-zinc-600">Width:</span>
						<button
							class="text-sm text-zinc-800 hover:text-white transition-colors cursor-pointer font-mono bg-lime-400 hover:bg-lime-500 px-2 py-1 rounded"
							onclick={() =>
								copyToClipboard(
									tracker.properties
										?.dimensions.width
										.toString() ||
										"",
								)}
						>
							{
								tracker.properties
									?.dimensions.width
							}px
						</button>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-xs text-zinc-600">Height:</span>
						<button
							class="text-sm text-zinc-800 hover:text-white transition-colors cursor-pointer font-mono bg-lime-400 hover:bg-lime-500 px-2 py-1 rounded"
							onclick={() =>
								copyToClipboard(
									tracker.properties
										?.dimensions.height
										.toString() ||
										"",
								)}
						>
							{
								tracker.properties
									?.dimensions.height
							}px
						</button>
					</div>

					<div class="flex items-center justify-between">
						<span class="text-xs text-zinc-600">X:</span>
						<button
							class="text-sm text-zinc-800 hover:text-white transition-colors cursor-pointer font-mono bg-lime-400 hover:bg-lime-500 px-2 py-1 rounded"
							onclick={() =>
								copyToClipboard(
									tracker.properties
										?.dimensions.x
										.toString() ||
										"",
								)}
						>
							{
								tracker.properties
									?.dimensions.x
							}px
						</button>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-xs text-zinc-600">Y:</span>
						<button
							class="text-sm text-zinc-800 hover:text-white transition-colors cursor-pointer font-mono bg-lime-400 hover:bg-lime-500 px-2 py-1 rounded"
							onclick={() =>
								copyToClipboard(
									tracker.properties
										?.dimensions.y
										.toString() ||
										"",
								)}
						>
							{
								tracker.properties
									?.dimensions.y
							}px
						</button>
					</div>
				</div>
			</section>

			<!-- Computed Styles -->
			<section class="space-y-2">
				<h3 class="text-sm font-medium text-zinc-600 uppercase tracking-wide m-0">
					Computed Styles
				</h3>
				<div class="space-y-1">
					{#each 					Object.entries(
						tracker.properties?.computedStyles ||
							{},
					).sort(([a], [b]) => a.localeCompare(b)) as
						[key, value]
					}
						<div class="flex items-center justify-between">
							<span class="text-xs text-zinc-600 capitalize">{
									key.replace(
										/([A-Z])/g,
										" $1",
									).trim()
								}:</span>
							<button
								class="text-sm text-zinc-800 hover:text-white transition-colors cursor-pointer font-mono bg-lime-400 hover:bg-lime-500 px-2 py-1 rounded max-w-[200px] truncate"
								onclick={() => copyToClipboard(value)}
								title={value}
							>
								{value}
							</button>
						</div>
					{/each}
				</div>
			</section>

			<!-- Attributes -->
			{#if 			tracker.properties?.attributes &&
				Object.keys(tracker.properties.attributes).length >
					0}
				<section class="space-y-2">
					<h3 class="text-sm font-medium text-zinc-600 uppercase tracking-wide m-0">
						Attributes
					</h3>
					<div class="space-y-1">
						{#each 					Object.entries(
						tracker.properties.attributes,
					).sort(([a], [b]) => a.localeCompare(b)) as
							[key, value]
						}
							<div class="flex items-center justify-between">
								<span class="text-xs text-zinc-600">{
										key
									}:</span>
								<button
									class="text-sm text-zinc-800 hover:text-white transition-colors cursor-pointer font-mono bg-lime-400 hover:bg-lime-500 px-2 py-1 rounded max-w-[200px] truncate"
									onclick={() => copyToClipboard(value)}
									title={value}
								>
									{value}
								</button>
							</div>
						{/each}
					</div>
				</section>
			{/if}
		</div>
	</aside>
{/snippet}
