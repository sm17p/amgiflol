<script lang="ts">
	import { TrackersStore, UIStore } from "@/lib/store/index.svelte";

	import Measurements from "@/lib/components/Measurements.svelte";
	import Ruler from "@/lib/components/Ruler.svelte";
	import { type SvelteHTMLElements } from "svelte/elements";
	type SVGElement = SvelteHTMLElements["svg"];

	interface Props extends SVGElement {
	}

	const trackersStore = getContext<TrackersStore>("trackersStore");
	const uiStore = getContext<UIStore>("uiStore");

	let tracker = $derived(trackersStore.current);

	let props = $props();
</script>
<svg
	class="fixed top-0 left-0 w-screen h-screen pointer-events-none"
	{...props}
>
	<defs>
		<filter
			id="contrastInvertBackground"
			x="-50%"
			y="-50%"
			width="200%"
			height="200%"
		>
			<feImage xlink:href="#svgBgRect" result="bgLayer" />
			<feComponentTransfer>
				<feFuncR type="linear" slope="0.5" intercept="0.1" />
				<feFuncG type="linear" slope="0.5" intercept="0.1" />
				<feFuncB type="linear" slope="0.5" intercept="0.1" />
				<feFuncA type="linear" slope="1" intercept="0" />
			</feComponentTransfer>
			<feGaussianBlur stdDeviation="3" />
		</filter>

		<filter
			id="invertedOutline"
			x="-50%"
			y="-50%"
			width="200%"
			height="200%"
		>
			<feColorMatrix
				in="SourceGraphic"
				type="matrix"
				values="
					-1 0 0 0 1
						0 -1 0 0 1
						0 0 -1 0 1
						0 0 0 1 0
				"
				result="invertedColor"
			/>

			<feMorphology
				in="invertedColor"
				operator="dilate"
				radius="2"
				result="outline"
			/>

			<feBlend in="SourceGraphic" in2="outline" mode="normal" />
		</filter>

		<filter id="bwFilter" color-interpolation-filters="sRGB">
			<!-- Convert to grayscale based on luminance -->
			<feColorMatrix
				type="matrix"
				values="0.2126 0.7152 0.0722 0 0
                        0.2126 0.7152 0.0722 0 0
                        0.2126 0.7152 0.0722 0 0
                        0 0 0 1 0"
			/>
			<!-- Expand edges slightly to clean up any fringing -->
			<feMorphology operator="dilate" radius="2" />
			<!-- Apply the threshold to determine if the color should be black or white -->
			<feComponentTransfer>
				<feFuncR type="linear" slope="-255" intercept="128" />
				<feFuncG type="linear" slope="-255" intercept="128" />
				<feFuncB type="linear" slope="-255" intercept="128" />
			</feComponentTransfer>
			<!-- Composite step to clean up the result -->
			<feComposite operator="in" in2="SourceGraphic" />
		</filter>
	</defs>
	<Ruler
		color="#3b82f6"
		zIndex={1}
	/>
	<Measurements
		gridSize={8}
		color="#3b82f6"
		zIndex={1}
	/>
	{#if 		uiStore.svg.showDistances && tracker?.parentRect &&
			tracker.lines}
		{#each tracker.lines as line}
			<line
				class="avgLine"
				x1={line.x1}
				y1={line.y1}
				x2={line.x2}
				y2={line.y2}
				stroke-dasharray={line.distance < 0 ? "4,4" : "none"}
				stroke={line.color}
				stroke-width="2"
			/>
			<text
				class="avgText"
				x={line.type === "top" || line.type === "bottom"
					? line.x1 + 5
					: (line.x1 + line.x2) / 2}
				y={line.type === "left" || line.type === "right"
					? line.y1 - 15
					: (line.y1 + line.y2) / 2}
				font-family="Inter, system-ui, sans-serif"
				dominant-baseline="middle"
				fill={line.color}
				font-size="12"
			>
				{Math.abs(line.distance)}px
			</text>
		{/each}
	{/if}
</svg>

<style>
	/* Now your line and text can be a consistent color (e.g., white or black) */
	.avgLine {
		stroke: white; /* Choose a color that will contrast well with the *processed* background */
		stroke-width: 3;
		vector-effect: non-scaling-stroke;
		/* filter: url(#bwFilter); */
	}

	.avgText {
		fill: white; /* Choose a color that will contrast well with the *processed* background */
		font-size: 12px;
		font-weight: bold;
		text-anchor: start;
		pointer-events: auto; /* Allow text to be clickable */
		/* filter: url(#bwFilter); */
	}
</style>
