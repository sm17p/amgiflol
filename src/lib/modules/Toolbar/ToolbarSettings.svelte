<script lang="ts">
	import Switch from "@/lib/components/Switch.svelte";
	import Tooltip from "@/lib/components/Tooltip.svelte";
	import UpvoteAction from "@/lib/components/UpvoteAction.svelte";
	import { UIStore } from "@/lib/store/index.svelte";
	import { CircleQuestionMark, Cog } from "@lucide/svelte";
	import { DropdownMenu } from "bits-ui";
	import { fly } from "svelte/transition";

	const uiStore = getContext<UIStore>("uiStore");
	// https://github.com/sm17p/amgiflol/issues/5
	// oxlint-disable-next-line no-constant-binary-expression
	const disableForFirefox = false && !import.meta.env.DEV &&
		import.meta.env.FIREFOX;
</script>

<!-- class="rounded-2xl bg-background-alt flex h-10 items-center gap-1" -->
<DropdownMenu.Root bind:open={uiStore.toolbar.settings.open}>
	<DropdownMenu.Trigger
		class="outline-none text-zinc-800 rounded-sm data-[state=closed]:not-disabled:hover:bg-lime-200 data-[state=closed]:not-disabled:hover:text-lime-500 !active:bg-lime-700 !active:text-lime-500 data-[state=open]:bg-lime-700 data-[state=open]:text-white/80 inline-flex size-10 items-center justify-center transition-all not-disabled:active:rounded-3xl not-disabled:active:scale-[0.85]"
	>
		<Cog
			class={[
				"size-6 duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]",
				{ "rotate-[270deg]": uiStore.toolbar.settings.open },
			]}
		/>
		<kbd
			class="text-xs not-prose duration-75 absolute translate-y-3 translate-x-3.5"
		>
			0
		</kbd>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content
		class="bg-white p-1 rounded-lg shadow-lg outline-none"
		align="start"
		sideOffset={12}
		forceMount
		alignOffset={-24}
	>
		{#snippet child({ wrapperProps, props, open })}
			{#if open}
				<div {...wrapperProps}>
					<div {...props} transition:fly={{ y: -10, duration: 200 }}>
						<DropdownMenu.Group
							class="grid grid-cols-1 gap-y-1"
							aria-label="Feature Voting"
						>
							<DropdownMenu.GroupHeading>
								<h4 class="m-0 ml-1 grid grid-cols-[24px_1fr]">
									<span></span>
									<span
										class="min-w-[250px] flex justify-between items-center gap-3 font-inherit"
									>
										<Switch
											bind:checked={uiStore
												.toolbar
												.featureVotingVisible}
											disabled={disableForFirefox}
											labelText="Feature Voting"
										/>
									</span>
								</h4>
							</DropdownMenu.GroupHeading>
							{#if 						uiStore.toolbar
							.featureVotingVisible}
								<DropdownMenu.Separator
									class="-ml-1 -mr-1 block h-px bg-zinc-200"
								/>
								<DropdownMenu.Item
									class="hover:bg-lime-200 hover:text-lime-500 border-1 border-transparent rounded-lg grid grid-cols-[24px_1fr] pl-1 outline-0 hover:data-[disabled]:cursor-not-allowed"
									closeOnSelect={false}
								>
									<Tooltip
										label="Debug on screen css animations, keyframes & transition functions"
										side="left"
										sideOffset={12}
									>
										<CircleQuestionMark class="size-4" />
									</Tooltip>
									<UpvoteAction
										disabled={disableForFirefox}
										key="animation-debugger"
										label="Animation Debugger"
									/>
								</DropdownMenu.Item>
								<DropdownMenu.Item
									class="hover:bg-lime-200 hover:text-lime-500 border-1 border-transparent rounded-lg grid grid-cols-[24px_1fr] pl-1 outline-0 hover:data-[disabled]:cursor-not-allowed"
									closeOnSelect={false}
								>
									<Tooltip
										label="Toolbar will switch position when mouse is in the bottom half of the screen."
										side="left"
										sideOffset={12}
									>
										<CircleQuestionMark class="size-4" />
									</Tooltip>
									<UpvoteAction
										disabled={disableForFirefox}
										key="auto-move-toolbar"
										label="Auto-Move Toolbar"
									/>
								</DropdownMenu.Item>
								<DropdownMenu.Item
									class="hover:bg-lime-200 hover:text-lime-500 border-1 border-transparent rounded-lg grid grid-cols-[24px_1fr] pl-1 outline-0 hover:data-[disabled]:cursor-not-allowed"
									closeOnSelect={false}
								>
									<Tooltip
										label="Side panel will switch position when mouse is in the right half of the screen."
										side="left"
										sideOffset={12}
									>
										<CircleQuestionMark class="size-4" />
									</Tooltip>
									<UpvoteAction
										disabled={disableForFirefox}
										key="auto-move-side-panel"
										label="Auto-Move Side-panel"
									/>
								</DropdownMenu.Item>
								<DropdownMenu.Item
									class="hover:bg-lime-200 hover:text-lime-500 border-1 border-transparent rounded-lg grid grid-cols-[24px_1fr] pl-1 outline-0 hover:data-[disabled]:cursor-not-allowed"
									closeOnSelect={false}
								>
									<Tooltip
										label="Import white-listed colours and highlight blacklisted"
										side="left"
										sideOffset={12}
									>
										<CircleQuestionMark class="size-4" />
									</Tooltip>
									<UpvoteAction
										disabled={disableForFirefox}
										key="color-debugger"
										label="Color Debugger"
									/>
								</DropdownMenu.Item>
								<DropdownMenu.Item
									class="hover:bg-lime-200 hover:text-lime-500 border-1 border-transparent rounded-lg grid grid-cols-[24px_1fr] pl-1 outline-0 hover:data-[disabled]:cursor-not-allowed"
									closeOnSelect={false}
								>
									<Tooltip
										label="Lock a selection and start a new inspector session"
										side="left"
										sideOffset={12}
									>
										<CircleQuestionMark class="size-4" />
									</Tooltip>
									<UpvoteAction
										disabled={disableForFirefox}
										key="multiple-trackers"
										label="Multi Inspect"
									/>
								</DropdownMenu.Item>
								<DropdownMenu.Item
									class="hover:bg-lime-200 hover:text-lime-500 border-1 border-transparent rounded-lg grid grid-cols-[24px_1fr] pl-1 outline-0 hover:data-[disabled]:cursor-not-allowed"
									closeOnSelect={false}
								>
									<Tooltip
										label="Current inspect target will display distances from sibling elements as well."
										side="left"
										sideOffset={12}
									>
										<CircleQuestionMark class="size-4" />
									</Tooltip>
									<UpvoteAction
										disabled={disableForFirefox}
										key="neighbour-distances"
										label="Neighbour Distances"
									/>
								</DropdownMenu.Item>
								<DropdownMenu.Item
									class="hover:bg-lime-200 hover:text-lime-500 border-1 border-transparent rounded-lg grid grid-cols-[24px_1fr] pl-1 outline-0 hover:data-[disabled]:cursor-not-allowed"
									closeOnSelect={false}
								>
									<Tooltip
										label="Draw static lines on screen"
										side="left"
										sideOffset={12}
									>
										<CircleQuestionMark class="size-4" />
									</Tooltip>
									<UpvoteAction
										disabled={disableForFirefox}
										key="on-screen-measurement-lines"
										label="On-screen Measurement Lines"
									/>
								</DropdownMenu.Item>
								<DropdownMenu.Item
									class="hover:bg-lime-200 hover:text-lime-500 border-1 border-transparent rounded-lg grid grid-cols-[24px_1fr] pl-1 outline-0 hover:data-[disabled]:cursor-not-allowed"
									closeOnSelect={false}
								>
									<Tooltip
										label="The inspector displays measurements from the source node to its parent (the target node). This allows the target node to change its position by traversing up and down the source node's layer."
										side="left"
										sideOffset={12}
									>
										<CircleQuestionMark class="size-4" />
									</Tooltip>
									<UpvoteAction
										disabled={disableForFirefox}
										key="parent-traversal"
										label="Parent-Child Traversal"
									/>
								</DropdownMenu.Item>
								<DropdownMenu.Item
									class="hover:bg-lime-200 hover:text-lime-500 border-1 border-transparent rounded-lg grid grid-cols-[24px_1fr] pl-1 outline-0 hover:data-[disabled]:cursor-not-allowed"
									closeOnSelect={false}
								>
									<Tooltip
										label="Resizable window with mobile & desktop size presets"
										side="left"
										sideOffset={12}
									>
										<CircleQuestionMark class="size-4" />
									</Tooltip>
									<UpvoteAction
										disabled={disableForFirefox}
										key="responsive-mode"
										label="Responsive Mode"
									/>
								</DropdownMenu.Item>
								<DropdownMenu.Item
									class="hover:bg-lime-200 hover:text-lime-500 border-1 border-transparent rounded-lg grid grid-cols-[24px_1fr] pl-1 outline-0 hover:data-[disabled]:cursor-not-allowed"
									closeOnSelect={false}
								>
									<Tooltip
										label="The inspector displays measurements from the source node to its parent (the target node). This will allow target node to change adjacent to source element's positioning within the same layer. (Sibling Traversal)"
										side="left"
										sideOffset={12}
									>
										<CircleQuestionMark class="size-4" />
									</Tooltip>
									<UpvoteAction
										disabled={disableForFirefox}
										key="sibling-traversal"
										label="Sibling Traversal"
									/>
								</DropdownMenu.Item>
							{/if}
						</DropdownMenu.Group>
						<DropdownMenu.Separator
							class="my-1 -ml-1 -mr-1 block h-px bg-zinc-200"
						/>
						<DropdownMenu.Group
							class="grid grid-cols-1 gap-y-1"
							aria-label="Toolbar Behaviour"
						>
							<DropdownMenu.GroupHeading>
								<h4 class="m-0 ml-5">Toolbar Behaviour</h4>
							</DropdownMenu.GroupHeading>
							<DropdownMenu.Separator
								class="-ml-1 -mr-1 block h-px bg-zinc-200"
							/>
							<DropdownMenu.CheckboxItem
								class="hover:not-data-[disabled]:bg-lime-200 hover:not-data-[disabled]:text-lime-500 border-1 border-transparent rounded-lg grid grid-cols-[24px_1fr] pl-1 outline-0 hover:data-[disabled]:cursor-not-allowed"
								bind:checked={uiStore.toolbar.autoMove}
								disabled
								closeOnSelect={false}
							>
								{#snippet children(
							{ checked },
						)}
									<span></span>
									<span
										class="min-w-[250px] flex justify-between items-center gap-3"
									>
										<Switch
											{checked}
											disabled
											labelText="Auto-Move"
										/>
									</span>
								{/snippet}
							</DropdownMenu.CheckboxItem>
							<DropdownMenu.CheckboxItem
								class="hover:not-data-[disabled]:bg-lime-200 hover:not-data-[disabled]:text-lime-500 border-1 border-transparent rounded-lg grid grid-cols-[24px_1fr] pl-1 outline-0 hover:data-[disabled]:cursor-not-allowed"
								bind:checked={uiStore.toolbar.autoHide}
								closeOnSelect={false}
							>
								{#snippet children(
							{ checked },
						)}
									<span></span>
									<span
										class="min-w-[250px] flex justify-between items-center gap-3"
									>
										<Switch
											{checked}
											labelText="Auto-Hide"
										/>
									</span>
								{/snippet}
							</DropdownMenu.CheckboxItem>
							<!-- {#if 						false &&
							!uiStore.toolbar.autoHide}
								<DropdownMenu.Item
									class="rounded-button data-highlighted:bg-muted flex select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none"
									closeOnSelect={false}
								>
									<div class="flex-1">
										<label class="text-sm font-medium">
											Hide delay: {
												localSettings
													.hideDelay
											}ms
										</label>
										<input
											type="range"
											min="0"
											max="10000"
											step="500"
											bind:value={localSettings
												.hideDelay}
											class="bg-muted mt-2 h-2 w-full appearance-none rounded-lg"
										/>
										<div class="mt-1 flex justify-between text-xs text-foreground-alt">
											<span>Instant</span>
											<span>10s</span>
										</div>
									</div>
								</DropdownMenu.Item>
							{/if} -->
						</DropdownMenu.Group>
						<DropdownMenu.Separator
							class="my-1 -ml-1 -mr-1 block h-px"
						/>
					</div>
				</div>
			{/if}
		{/snippet}
	</DropdownMenu.Content>
</DropdownMenu.Root>

<style>
</style>
