<script lang="ts">
	import { MetaDataStore, UIStore } from "@/lib/store/index.svelte";
	import { Spring } from "svelte/motion";

	let coords = new Spring({ x: 0, y: 0 }, {
		stiffness: 0.125,
		damping: 0.675,
	});

	let step = $state(50);
	let minorStep = $state(10);

	const metadataStore = getContext<MetaDataStore>("metadataStore");
	const uiStore = getContext<UIStore>("uiStore");

	$effect.pre(() => {
		coords.target = {
			x: metadataStore.mouse.x,
			y: metadataStore.mouse.y,
		};
	});

	let mouseX = $derived(coords.current.x);
	let mouseY = $derived(coords.current.y);
	let xAxisLength = $derived(metadataStore.window.innerWidth);
	let yAxisLength = $derived(metadataStore.window.innerHeight);
</script>

<!-- Dynamic coordinate axes from mouse position -->
{#if uiStore.svg.showRuler}
	<g filter="url(#invertedOutline)">
		<!-- Main axes -->
		<g stroke="#fff" stroke-width="2">
			<!-- X-axis (horizontal) - extends left and right from mouse -->
			<line
				x1={0}
				y1={mouseY}
				x2={xAxisLength}
				y2={mouseY}
			/>
			<!-- Y-axis (vertical) - extends up and down from mouse -->
			<line
				x1={mouseX}
				y1={0}
				x2={mouseX}
				y2={yAxisLength}
			/>
		</g>

		<!-- X-axis ticks and labels -->
		<g>
			<!-- Positive X-axis ticks -->
			<g stroke="#fff" stroke-width="1">
				{#each Array(Math.floor(xAxisLength / step) + 1) as _, i}
					{#if i > 0}
						{@const x = mouseX + i * step}
						{#if x <= xAxisLength}
							<line
								x1={x}
								y1={mouseY - 5}
								x2={x}
								y2={mouseY + 5}
							/>
						{/if}
					{/if}
				{/each}
			</g>

			<!-- Negative X-axis ticks -->
			<g stroke="#fff" stroke-width="1">
				{#each Array(Math.floor(xAxisLength / step) + 1) as _, i}
					{#if i > 0}
						{@const x = mouseX - i * step}
						{#if x >= 0}
							<line
								x1={x}
								y1={mouseY - 5}
								x2={x}
								y2={mouseY + 5}
							/>
						{/if}
					{/if}
				{/each}
			</g>

			<!-- X-axis minor ticks -->
			<g stroke="#fff" stroke-width="0.5">
				{#each Array(Math.floor(xAxisLength / minorStep) + 1) as _, i}
					{#if i > 0 && (i * minorStep) % step !== 0}
						{@const xPos = mouseX + i * minorStep}
						{@const xNeg = mouseX - i * minorStep}
						{#if xPos <= xAxisLength}
							<line
								x1={xPos}
								y1={mouseY - 3}
								x2={xPos}
								y2={mouseY + 3}
							/>
						{/if}
						{#if xNeg >= 0}
							<line
								x1={xNeg}
								y1={mouseY - 3}
								x2={xNeg}
								y2={mouseY + 3}
							/>
						{/if}
					{/if}
				{/each}
			</g>

			<!-- X-axis labels -->
			<g
				font-family="Inter, sans-serif"
				font-size="10"
				fill="#fff"
				text-anchor="middle"
			>
				{#each Array(Math.floor(xAxisLength / step) + 1) as _, i}
					{#if i > 0}
						{@const xPos = mouseX + i * step}
						{@const xNeg = mouseX - i * step}
						{@const value = i * step}
						{#if 				xPos <= xAxisLength &&
					mouseY + 15 <= yAxisLength}
							<text x={xPos} y={mouseY + 15}>{value}</text>
						{/if}
						{#if xNeg >= 0 && mouseY + 15 <= yAxisLength}
							<text x={xNeg} y={mouseY + 15}>-{value}</text>
						{/if}
					{/if}
				{/each}
				<!-- Origin label -->
				{#if mouseY + 15 <= yAxisLength}
					<text x={mouseX} y={mouseY + 15}>0</text>
				{/if}
			</g>
		</g>

		<!-- Y-axis ticks and labels -->
		<g>
			<!-- Positive Y-axis ticks (upward) -->
			<g stroke="#fff" stroke-width="1">
				{#each Array(Math.floor(yAxisLength / step) + 1) as _, i}
					{#if i > 0}
						{@const y = mouseY - i * step}
						{#if y >= 0}
							<line
								x1={mouseX - 5}
								y1={y}
								x2={mouseX + 5}
								y2={y}
							/>
						{/if}
					{/if}
				{/each}
			</g>

			<!-- Negative Y-axis ticks (downward) -->
			<g stroke="#fff" stroke-width="1">
				{#each Array(Math.floor(yAxisLength / step) + 1) as _, i}
					{#if i > 0}
						{@const y = mouseY + i * step}
						{#if y <= yAxisLength}
							<line
								x1={mouseX - 5}
								y1={y}
								x2={mouseX + 5}
								y2={y}
							/>
						{/if}
					{/if}
				{/each}
			</g>

			<!-- Y-axis minor ticks -->
			<g stroke="#fff" stroke-width="0.5">
				{#each Array(Math.floor(yAxisLength / minorStep) + 1) as _, i}
					{#if i > 0 && (i * minorStep) % step !== 0}
						{@const yPos = mouseY - i * minorStep}
						{@const yNeg = mouseY + i * minorStep}
						{#if yPos >= 0}
							<line
								x1={mouseX - 3}
								y1={yPos}
								x2={mouseX + 3}
								y2={yPos}
							/>
						{/if}
						{#if yNeg <= yAxisLength}
							<line
								x1={mouseX - 3}
								y1={yNeg}
								x2={mouseX + 3}
								y2={yNeg}
							/>
						{/if}
					{/if}
				{/each}
			</g>

			<!-- Y-axis labels -->
			<g
				font-family="Inter, sans-serif"
				font-size="10"
				fill="#fff"
				text-anchor="end"
			>
				{#each Array(Math.floor(yAxisLength / step) + 1) as _, i}
					{#if i > 0}
						{@const yPos = mouseY - i * step}
						{@const yNeg = mouseY + i * step}
						{@const value = i * step}
						{#if yPos >= 0 && mouseX - 10 >= 0}
							<text x={mouseX - 10} y={yPos + 4}>{value}</text>
						{/if}
						{#if yNeg <= yAxisLength && mouseX - 10 >= 0}
							<text x={mouseX - 10} y={yNeg + 4}>-{value}</text>
						{/if}
					{/if}
				{/each}
			</g>
		</g>

		<!-- Axis labels -->
		<g
			font-family="Inter, sans-serif"
			font-size="12"
			font-weight="bold"
			fill="#fff"
		>
			{#if true}
				{@const 			rightLabelX = Math.min(
				xAxisLength - 20,
				mouseX + xAxisLength - 10,
			)}
				{@const upLabelY = Math.max(15, mouseY - yAxisLength + 10)}
				{#if rightLabelX > mouseX + 20}
					<text x={rightLabelX} y={mouseY - 8} text-anchor="middle">
						X
					</text>
				{/if}
				{#if upLabelY < mouseY - 20}
					<text x={mouseX + 12} y={upLabelY} text-anchor="middle">
						Y
					</text>
				{/if}
			{/if}
		</g>
	</g>
{/if}
