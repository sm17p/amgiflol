<script lang="ts">
	import Switch from "@/lib/components/Switch.svelte";
	import Tooltip from "@/lib/components/Tooltip.svelte";
	import UpvoteAction from "@/lib/components/UpvoteAction.svelte";
	import { UIStore } from "@/lib/store/index.svelte";
	import { Menu } from "@ark-ui/svelte/menu";
	import { CircleQuestionMark, Cog } from "@lucide/svelte";
	import { getContext } from "svelte";
	import { fly } from "svelte/transition";

	const uiStore = getContext<UIStore>("uiStore");
	// https://github.com/sm17p/amgiflol/issues/5
	// oxlint-disable-next-line no-constant-binary-expression
	const disableForFirefox = false && !import.meta.env.DEV &&
		import.meta.env.FIREFOX;
</script>

<Menu.Root
	open={uiStore.toolbar.settings.open}
	onOpenChange={(details) => {
		uiStore.toolbar.settings.open = details.open;
	}}
>
	<Menu.Trigger
		class="size-7 sm:size-10 outline-none text-zinc-800 rounded-sm data-[state=closed]:not-disabled:hover:bg-lime-200 data-[state=closed]:not-disabled:hover:text-lime-500 !active:bg-lime-700 !active:text-lime-500 data-[state=open]:bg-lime-700 data-[state=open]:text-white/80 inline-flex items-center justify-center transition-all not-disabled:active:rounded-3xl not-disabled:active:scale-[0.85]"
	>
		<Cog
			class={[
				"size-4 sm:size-6 duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]",
				{ "rotate-[270deg]": uiStore.toolbar.settings.open },
			]}
		/>
		<kbd
			class="text-xs not-prose duration-75 absolute translate-y-2 translate-x-2.5 sm:translate-y-3 sm:translate-x-3.5"
		>
			0
		</kbd>
	</Menu.Trigger>
	<Menu.Positioner>
		<Menu.Content class="bg-white p-1 rounded-lg shadow-lg outline-none">
			<div transition:fly={{ y: -10, duration: 200 }}>
				<Menu.ItemGroup
					class="grid grid-cols-1 gap-y-1"
					aria-label="Feature Voting"
				>
					<Menu.ItemGroupLabel>
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
					</Menu.ItemGroupLabel>
					{#if 						uiStore.toolbar
							.featureVotingVisible}
						<Menu.Separator
							class="-ml-1 -mr-1 block h-px bg-zinc-200"
						/>
						<Menu.Item
							value="animation-debugger"
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
						</Menu.Item>
						<Menu.Item
							value="color-debugger"
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
						</Menu.Item>
						<Menu.Item
							value="multiple-trackers"
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
						</Menu.Item>
						<Menu.Item
							value="neighbour-distances"
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
						</Menu.Item>
						<Menu.Item
							value="on-screen-measurement-lines"
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
						</Menu.Item>
						<Menu.Item
							value="parent-traversal"
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
						</Menu.Item>
						<Menu.Item
							value="responsive-mode"
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
						</Menu.Item>
						<Menu.Item
							value="sibling-traversal"
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
						</Menu.Item>
					{/if}
				</Menu.ItemGroup>
				<Menu.Separator
					class="my-1 -ml-1 -mr-1 block h-px bg-zinc-200"
				/>
				<Menu.ItemGroup
					class="grid grid-cols-1 gap-y-1"
					aria-label="Toolbar Behaviour"
				>
					<Menu.ItemGroupLabel>
						<h4 class="m-0 ml-7">Side-panel</h4>
					</Menu.ItemGroupLabel>
					<Menu.Separator
						class="-ml-1 -mr-1 block h-px bg-zinc-200"
					/>
					<Menu.CheckboxItem
						value="sidepanel-auto-move"
						class="hover:not-data-[disabled]:bg-lime-200 hover:not-data-[disabled]:text-lime-500 border-1 border-transparent rounded-lg grid grid-cols-[24px_1fr] pl-1 outline-0 hover:data-[disabled]:cursor-not-allowed"
						bind:checked={uiStore.sidePanel.autoMove}
						closeOnSelect={false}
					>
						<Tooltip
							label="Disabled on lock"
							side="left"
							sideOffset={12}
						>
							<CircleQuestionMark class="size-4" />
						</Tooltip>
						<span
							class="min-w-[250px] flex justify-between items-center gap-3"
						>
							<Switch
								checked={uiStore.sidePanel
									.autoMove}
								labelText="Auto-Move"
							/>
						</span>
					</Menu.CheckboxItem>
				</Menu.ItemGroup>
				<Menu.Separator
					class="my-1 -ml-1 -mr-1 block h-px bg-zinc-200"
				/>
				<Menu.ItemGroup
					class="grid grid-cols-1 gap-y-1"
					aria-label="Toolbar Behaviour"
				>
					<Menu.ItemGroupLabel>
						<h4 class="m-0 ml-7">Toolbar</h4>
					</Menu.ItemGroupLabel>
					<Menu.Separator
						class="-ml-1 -mr-1 block h-px bg-zinc-200"
					/>
					<Menu.CheckboxItem
						value="toolbar-auto-move"
						class="hover:not-data-[disabled]:bg-lime-200 hover:not-data-[disabled]:text-lime-500 border-1 border-transparent rounded-lg grid grid-cols-[24px_1fr] pl-1 outline-0 hover:data-[disabled]:cursor-not-allowed"
						bind:checked={uiStore.toolbar.autoMove}
						closeOnSelect={false}
					>
						<Tooltip
							label="Disabled on lock"
							side="left"
							sideOffset={12}
						>
							<CircleQuestionMark class="size-4" />
						</Tooltip>
						<span
							class="min-w-[250px] flex justify-between items-center gap-3"
						>
							<Switch
								checked={uiStore.toolbar
									.autoMove}
								labelText="Auto-Move"
							/>
						</span>
					</Menu.CheckboxItem>
					<Menu.CheckboxItem
						value="toolbar-auto-hide"
						class="hover:not-data-[disabled]:bg-lime-200 hover:not-data-[disabled]:text-lime-500 border-1 border-transparent rounded-lg grid grid-cols-[24px_1fr] pl-1 outline-0 hover:data-[disabled]:cursor-not-allowed"
						bind:checked={uiStore.toolbar.autoHide}
						closeOnSelect={false}
					>
						<span></span>
						<span
							class="min-w-[250px] flex justify-between items-center gap-3"
						>
							<Switch
								checked={uiStore.toolbar
									.autoHide}
								labelText="Auto-Hide"
							/>
						</span>
					</Menu.CheckboxItem>
				</Menu.ItemGroup>
				<Menu.Separator class="my-1 -ml-1 -mr-1 block h-px" />
			</div>
		</Menu.Content>
	</Menu.Positioner>
</Menu.Root>
