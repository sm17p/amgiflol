<script lang="ts">
	import { UIStore } from "@/lib/store/index.svelte";
	import { Cog } from "@lucide/svelte";
	import { Menubar } from "bits-ui";
	import { onMount } from "svelte";
	import { fly } from "svelte/transition";

	interface ToolbarSettingsProps {
		isOpen?: boolean;
		onClose?: () => void;
	}

	let { isOpen = false, onClose = () => {} }: ToolbarSettingsProps =
		$props();

	let settingsElement = $state<HTMLElement>();
	let localSettings = $state({
		autoMove: true,
		hideDelay: 3000,
		position: "top-left" as
			| "top-left"
			| "top-right"
			| "bottom-left"
			| "bottom-right",
		offsetX: 20,
		offsetY: 20,
		showLabels: true,
		compactMode: false,
		alwaysVisible: false,
	});

	const uiStore = getContext<UIStore>("uiStore");

	let value = $derived(isOpen ? "settings" : "");
</script>

<Menubar.Root
	class="rounded-2xl bg-background-alt flex h-10 items-center gap-1"
	{value}
>
	<Menubar.Menu>
		<Menubar.Trigger
			class="rounded-xl data-highlighted:bg-muted data-[state=open]:bg-muted inline-flex h-10 cursor-default items-center justify-center px-3 text-sm font-medium focus-visible:outline-none"
		>
			<Cog class={["size-6 duration-75", { "rotate-90": isOpen }]} />
		</Menubar.Trigger>
		<Menubar.Content
			class="focus-override border-muted bg-white shadow-xl focus-visible:outline-hidden z-50 w-80 rounded-xl border px-1 py-1.5"
			align="start"
			sideOffset={3}
		>
			<div transition:fly={{ y: -10, duration: 200 }}>
				<Menubar.Group>
					<Menubar.GroupHeading
						class="text-foreground-alt px-3 py-2 text-xs font-semibold uppercase tracking-wider"
					>
						Behaviour
					</Menubar.GroupHeading>

					<Menubar.CheckboxItem
						class="rounded-button data-highlighted:bg-muted flex min-h-[60px] select-none items-start gap-3 py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none"
						bind:checked={localSettings.autoMove}
						closeOnSelect={false}
					>
						{#snippet children(
							{ checked },
						)}
							<div class="flex-1">
								<div class="flex items-center gap-3">
									<div class="flex items-center">
										{#if 										checked}
											{@render 										SwitchOn()}
										{:else}
											{@render 										SwitchOff()}
										{/if}
									</div>
									<span>Auto-move away from cursor</span>
								</div>
								<p class="text-foreground-alt mt-1 text-xs">
									Automatically repositions toolbar when
									cursor approaches
								</p>
							</div>
						{/snippet}
					</Menubar.CheckboxItem>

					<Menubar.CheckboxItem
						class="rounded-button data-highlighted:bg-muted flex min-h-[60px] select-none items-start gap-3 py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none"
						bind:checked={localSettings.alwaysVisible}
						closeOnSelect={false}
					>
						{#snippet children(
							{ checked },
						)}
							<div class="flex-1">
								<div class="flex items-center gap-3">
									<div class="flex items-center">
										{#if 										checked}
											{@render 										SwitchOn()}
										{:else}
											{@render 										SwitchOff()}
										{/if}
									</div>
									<span>Always visible</span>
								</div>
								<p class="text-foreground-alt mt-1 text-xs">
									Keep toolbar visible at all times
								</p>
							</div>
						{/snippet}
					</Menubar.CheckboxItem>

					{#if !localSettings.alwaysVisible}
						<Menubar.Item
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
						</Menubar.Item>
					{/if}
				</Menubar.Group>

				<Menubar.Separator class="my-1 -ml-1 -mr-1 block h-px" />
			</div>
		</Menubar.Content>
	</Menubar.Menu>
</Menubar.Root>

{#snippet SwitchOn()}
	<div class="bg-dark-10 peer inline-flex h-[15.6px] min-h-[15.6px] w-[26px] shrink-0 items-center rounded-full px-[1.5px]">
		<span
			class="bg-background dark:border-border-input dark:shadow-mini pointer-events-none block size-[13px] shrink-0 translate-x-[10px] rounded-full"
		></span>
	</div>
{/snippet}

{#snippet SwitchOff()}
	<div class="bg-dark-10 shadow-mini-inset peer inline-flex h-[15.6px] w-[26px] shrink-0 items-center rounded-full px-[3px] transition-colors">
		<span
			class="bg-background shadow-mini dark:border-border-input dark:shadow-mini pointer-events-none block size-[13px] shrink-0 translate-x-0 rounded-full transition-transform dark:border"
		></span>
	</div>
{/snippet}

<style>
</style>
