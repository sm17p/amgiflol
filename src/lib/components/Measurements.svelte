<script lang="ts">
	import { elementInspector } from "@/lib/core/ElementInspector";
	import {
		MetaDataStore,
		TrackersStore,
		UIStore,
	} from "@/lib/store/index.svelte";

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
		<rect
			class="anim"
			width="100%"
			height="100%"
			fill="url(#grid)"
			style={`--x: ${metadataStore.mouse.x}; --y:${metadataStore.mouse.y}`}
		/>
	{/if}

	<!-- {#if showMeasurements}
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
	{/if} -->
{/if}

<style>
	/* .anim {
		--x: 0;
		--y: 0;
		--sin-x: sin(var(--x));
		--cos-y: cos(var(--y)); 
		transition: transform 0.5s cubic-bezier(0.6, -0.28, 0.735, 0.045);
		transform: scale(1) skewX(calc(--cos-y * 180deg)) 
	                      skewY(calc(--sin-x * 3600deg)); */
	/* animation: glitch-loop-1 0.5s infinite cubic-bezier(0.68, -0.55, 0.265, 1.55) alternate-reverse; */
	/* transform-origin: center; */
	/* } */

	@keyframes glitch-loop-1 {
		0% {
			transform: scale(1) skewX(0deg) skewY(60deg);
		}
		25% {
			transform: scale(1) skewX(60deg) skewY(-60deg);
		}
		50% {
			transform: scale(1) skewX(-60deg) skewY(60deg);
		}
		75% {
			transform: scale(1) skewX(60deg) skewY(-60deg);
		}
		100% {
			transform: scale(1) skewX(0deg) skewY(60deg);
		}
	}

	@keyframes glitch-loop-2 {
		0% {
			transform: scale(1) skewX(0deg);
		}
		25% {
			transform: scale(1) skewX(90deg);
		}
		50% {
			transform: scale(1) skewX(-90deg);
		}
		75% {
			transform: scale(1) skewX(90deg);
		}
		100% {
			transform: scale(1) skewX(0deg);
		}
	}

	@keyframes glitch-loop-3 {
		0% {
			transform: scale(1) skewY(0deg);
		}
		25% {
			transform: scale(1) skewY(90deg);
		}
		50% {
			transform: scale(1) skewY(-90deg);
		}
		75% {
			transform: scale(1) skewY(90deg);
		}
		100% {
			transform: scale(1) skewY(0deg);
		}
	}
</style>
