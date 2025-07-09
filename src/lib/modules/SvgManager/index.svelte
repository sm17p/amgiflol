<script lang="ts">
	import Measurements from "@/lib/components/Measurements.svelte";
	import Ruler from "@/lib/components/Ruler.svelte";
	import { TrackersStore, UIStore } from "@/lib/store/index.svelte";
	import { type SvelteHTMLElements } from "svelte/elements";

	type SVGElement = SvelteHTMLElements["svg"];

	interface Props extends SVGElement {
	}

	const trackersStore = getContext<TrackersStore>("trackersStore");
	const uiStore = getContext<UIStore>("uiStore");

	let tracker = $derived(trackersStore.current);

	let props: Props = $props();
</script>

<svg class="hidden">
	<defs>
		<filter
			id="invertedOutline"
			x="-50%"
			y="-50%"
			width="200%"
			height="200%"
			color-interpolation-filters="sRGB"
			filterUnits="objectBoundingBox"
			primitiveUnits="userSpaceOnUse"
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

		<filter
			id="colorInversion"
			color-interpolation-filters="sRGB"
			filterUnits="objectBoundingBox"
			primitiveUnits="userSpaceOnUse"
		>
			<feColorMatrix
				type="matrix"
				values="0.2126 0.7152 0.0722 0 0
								0.2126 0.7152 0.0722 0 0
								0.2126 0.7152 0.0722 0 0
								0 0 0 1 0"
				x="0%"
				y="0%"
				width="100%"
				height="100%"
				in="dropShadow"
				result="colormatrix"
			/>
			<feMorphology
				operator="dilate"
				radius="2 2"
				x="0%"
				y="0%"
				width="100%"
				height="100%"
				in="colormatrix"
				result="morphology1"
			/>
			<feComponentTransfer
				x="0%"
				y="0%"
				width="100%"
				height="100%"
				in="morphology1"
				result="componentTransfer"
			>
				<feFuncR type="linear" slope="-255" intercept="128" />
				<feFuncG type="linear" slope="-255" intercept="128" />
				<feFuncB type="linear" slope="-255" intercept="128" />
				<feFuncA type="linear" slope="1" intercept="0" />
			</feComponentTransfer>
			<feComposite
				in="componentTransfer"
				in2="SourceGraphic"
				operator="in"
				x="0%"
				y="0%"
				width="100%"
				height="100%"
				result="composite"
			/>
		</filter>

		<filter
			id="outline"
			color-interpolation-filters="linearRGB"
			filterUnits="objectBoundingBox"
			primitiveUnits="userSpaceOnUse"
		>
			<feMorphology
				operator="dilate"
				radius="1.5 1.5"
				in="SourceAlpha"
				result="morphology"
			/>
			<feFlood flood-color="#ffffff" flood-opacity="1" result="flood" />
			<feComposite
				in="flood"
				in2="morphology"
				operator="in"
				result="composite"
			/>
			<feMerge result="merge">
				<feMergeNode in="composite" result="mergeNode" />
				<feMergeNode in="SourceGraphic" result="mergeNode1" />
			</feMerge>
		</filter>
	</defs>
</svg>

<svg
	class="fixed inset-0 w-screen h-screen pointer-events-none"
	{...props}
>
	<Ruler />

	<Measurements
		gridSize={8}
		color="#3b82f6"
		zIndex={1}
	/>

	{#if uiStore.svg.showDistances && tracker?.parentRect &&
			tracker.lines}
		<g filter="url(#outline)">
			{#each [...tracker.lockedLines, ...tracker.lines] as line}
				<line
					class="avgLine text-lime-300"
					x1={line.x1}
					y1={line.y1}
					x2={line.x2}
					y2={line.y2}
					stroke-dasharray={line.distance < 0 ? "4,4" : "none"}
					stroke={line.color}
					stroke-width={line.distance < 0 ? 0.5 : 2}
				/>
				{#if line.type}
					<text
						class="font-bold tracking-wide"
						x={line.type === "top" || line.type === "bottom"
							? line.x1 + 15
							: (line.x1 + line.x2) / 2}
						y={line.type === "left" || line.type === "right"
							? line.y1 - 15
							: (line.y1 + line.y2) / 2}
						font-family="Inter, system-ui, sans-serif"
						dominant-baseline="middle"
						fill={line.color}
						font-size="12"
					>
						{Math.abs(line.distance)} px
					</text>
				{/if}
			{/each}
		</g>
	{/if}
</svg>

<style>
</style>
