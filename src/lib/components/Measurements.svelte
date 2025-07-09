<script lang="ts">
	import { elementInspector } from "@/lib/core/ElementInspector";
	import {
		MetaDataStore,
		TrackersStore,
		UIStore,
	} from "@/lib/store/index.svelte";
	import { onDestroy, onMount } from "svelte";

	interface RulerProps {
		gridSize?: number;
		color?: string;
		zIndex?: number;
	}

	let {
		gridSize = 8,
		color = "#3b82f6",
		zIndex = 9998,
	}: RulerProps = $props();

	const metadataStore = getContext<MetaDataStore>("metadataStore");
	const trackersStore = getContext<TrackersStore>("trackersStore");
	const uiStore = getContext<UIStore>("uiStore");

	let showMeasurements = true;
	let showCrosshair = true;

	let windowStore = $derived(metadataStore.window);
	let isDragging = $state(false);
	let measurementStart = $state<{ x: number; y: number } | null>(
		null,
	);
	let measurementEnd = $state<{ x: number; y: number } | null>(null);
	let measurements = $state<
		Array<{
			id: string;
			start: { x: number; y: number };
			end: { x: number; y: number };
			distance: number;
			angle: number;
		}>
	>([]);

	const mouse = metadataStore.mouse;
	const svg = uiStore.svg;
	let selectedTrackers = $derived(
		Array.from(trackersStore.trackers.values()).filter((t) =>
			t.isLocked
		),
	);

	function handleMouseDown(event: MouseEvent) {
		if (!uiStore.isActive || svg.mode !== "measure") {
			return;
		}

		if (event.shiftKey) {
			measurementStart = { x: event.clientX, y: event.clientY };
			isDragging = true;
		}
	}

	function handleMouseMove(event: MouseEvent) {
		console.log(
			"🚀 ~ handleMouseMove ~ enabled:",
			uiStore.isActive,
		);
		if (!uiStore.isActive) return;

		if (isDragging && measurementStart) {
			measurementEnd = { x: event.clientX, y: event.clientY };
		}
	}

	function handleMouseUp(event: MouseEvent) {
		if (!uiStore.isActive || !isDragging) return;

		if (measurementStart && measurementEnd) {
			const distance = Math.sqrt(
				Math.pow(measurementEnd.x - measurementStart.x, 2) +
					Math.pow(measurementEnd.y - measurementStart.y, 2),
			);

			const angle = Math.atan2(
				measurementEnd.y - measurementStart.y,
				measurementEnd.x - measurementStart.x,
			) *
				(180 / Math.PI);

			measurements.push({
				id: `measurement-${Date.now()}`,
				start: measurementStart,
				end: measurementEnd,
				distance: Math.round(distance),
				angle: Math.round(angle),
			});

			measurementStart = null;
			measurementEnd = null;
		}

		isDragging = false;
	}

	function removeMeasurement(id: string) {
		measurements = measurements.filter((m) => m.id !== id);
	}

	function getTrackerDistances() {
		const distances = [];

		for (let i = 0; i < selectedTrackers.length; i++) {
			for (let j = i + 1; j < selectedTrackers.length; j++) {
				const tracker1 = selectedTrackers[i];
				const tracker2 = selectedTrackers[j];

				const rect1 = tracker1.boundingRect!;
				const rect2 = tracker2.boundingRect!;

				const center1 = {
					x: rect1.x + rect1.width / 2,
					y: rect1.y + rect1.height / 2,
				};

				const center2 = {
					x: rect2.x + rect2.width / 2,
					y: rect2.y + rect2.height / 2,
				};

				const distance = Math.sqrt(
					Math.pow(center2.x - center1.x, 2) +
						Math.pow(center2.y - center1.y, 2),
				);

				distances.push({
					id: `distance-${i}-${j}`,
					start: center1,
					end: center2,
					distance: Math.round(distance),
					horizontal: Math.abs(center2.x - center1.x),
					vertical: Math.abs(center2.y - center1.y),
				});
			}
		}

		return distances;
	}
</script>

{#if uiStore.isActive}
	<defs>
		<marker
			id="arrowhead"
			markerWidth="10"
			markerHeight="7"
			refX="9"
			refY="3.5"
			orient="auto"
		>
			<polygon points="0 0, 10 3.5, 0 7" fill={color} />
		</marker>

		<pattern
			id="grid"
			width={gridSize}
			height={gridSize}
			patternUnits="userSpaceOnUse"
		>
			<path
				d="M {gridSize} 0 L 0 0 0 {gridSize}"
				fill="none"
				stroke="#e5e7eb"
				stroke-width="0.5"
				opacity="0.3"
			/>
		</pattern>
	</defs>

	{#if uiStore.svg.showGrid}
		<rect width="100%" height="100%" fill="url(#grid)" />
	{/if}

	{#if showMeasurements}
		{#each getTrackerDistances() as distance}
			<g class="tracker-distance">
				<line
					x1={distance.start.x}
					y1={distance.start.y}
					x2={distance.end.x}
					y2={distance.end.y}
					stroke={color}
					stroke-width="2"
					marker-end="url(#arrowhead)"
					marker-start="url(#arrowhead)"
				/>
				<text
					x={(distance.start.x + distance.end.x) / 2}
					y={(distance.start.y + distance.end.y) / 2 - 5}
					fill={color}
					font-size="12"
					font-family="Inter, system-ui, sans-serif"
					font-weight="500"
					text-anchor="middle"
					dominant-baseline="middle"
					class="measurement-text"
				>
					{distance.distance}px
				</text>
			</g>
		{/each}
	{/if}

	{#if isDragging && measurementStart && measurementEnd}
		<g class="temp-measurement">
			<line
				x1={measurementStart.x}
				y1={measurementStart.y}
				x2={measurementEnd.x}
				y2={measurementEnd.y}
				stroke={color}
				stroke-width="2"
				stroke-dasharray="4,4"
				marker-end="url(#arrowhead)"
				marker-start="url(#arrowhead)"
			/>
			<text
				x={(measurementStart.x + measurementEnd.x) / 2}
				y={(measurementStart.y + measurementEnd.y) / 2 - 5}
				fill={color}
				font-size="12"
				font-family="Inter, system-ui, sans-serif"
				font-weight="500"
				text-anchor="middle"
				dominant-baseline="middle"
				class="measurement-text"
			>
				{
					Math.round(
						Math.sqrt(
							Math.pow(
								measurementEnd.x - measurementStart.x,
								2,
							) +
								Math.pow(
									measurementEnd.y - measurementStart.y,
									2,
								),
						),
					)
				}px
			</text>
		</g>
	{/if}

	{#each measurements as measurement}
		<g class="measurement" data-id={measurement.id}>
			<line
				x1={measurement.start.x}
				y1={measurement.start.y}
				x2={measurement.end.x}
				y2={measurement.end.y}
				stroke={color}
				stroke-width="2"
				marker-end="url(#arrowhead)"
				marker-start="url(#arrowhead)"
			/>
			<text
				x={(measurement.start.x + measurement.end.x) / 2}
				y={(measurement.start.y + measurement.end.y) / 2 - 5}
				fill={color}
				font-size="12"
				font-family="Inter, system-ui, sans-serif"
				font-weight="500"
				text-anchor="middle"
				dominant-baseline="middle"
				class="measurement-text"
			>
				{measurement.distance}px
			</text>
			<circle
				cx={measurement.end.x}
				cy={measurement.end.y}
				r="3"
				fill={color}
				class="measurement-handle"
				style="cursor: pointer; pointer-events: auto"
				onclick={() => removeMeasurement(measurement.id)}
				onkeydown={(e) => e.key === "Enter" && removeMeasurement(measurement.id)}
				role="button"
				tabindex="0"
				aria-label="Remove measurement"
			/>
		</g>
	{/each}

	{#if svg.mode === "measure"}
		<text
			x="20"
			y="30"
			fill={color}
			font-size="14"
			font-family="Inter, system-ui, sans-serif"
			font-weight="500"
			class="measurement-hint"
		>
			Hold Shift + Click and drag to measure
		</text>
	{/if}
{/if}

<style>
	.measurement-text {
		background: rgba(255, 255, 255, 0.9);
		padding: 2px 4px;
		border-radius: 2px;
	}

	.measurement-handle:hover {
		r: 4;
		fill: #ef4444;
	}
</style>
