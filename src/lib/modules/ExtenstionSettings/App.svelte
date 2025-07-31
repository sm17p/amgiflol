<script lang="ts">
	import { useAppConfig } from "#imports";
	import IconOff from "@/assets/icon-off.png";
	import IconOn from "@/assets/icon.png";
	import {
		createMessageHandler,
		sendMessage,
	} from "@/lib/core/MessageBus";
	import { Label, Switch } from "bits-ui";
	import { browser } from "wxt/browser";
	import "./app.css";
	import { fade } from "svelte/transition";

	const appConfig = useAppConfig();

	let isLoading = $state(false);
	let errorMessage = $state("");
	let successMessage = $state("");

	let isActive = $state<boolean>();

	let domain = "";

	async function mount() {
		try {
			analytics.page(location.href);

			const [tab] = await browser.tabs.query({
				active: true,
				currentWindow: true,
				status: "complete",
			});

			if (tab.url) {
				const url = new URL(tab.url);
				domain = url.host;

				let result = await browser.storage?.local.get([
					domain,
				]);

				console.log("🚀 ~ mount ~ result:", result);

				if (result) {
					isActive = result[domain] ?? false;
				}
			}
		} catch (error) {
			errorMessage = "Failed to load inspector state";
			console.error("Error loading inspector state:", error);
		}
	}

	$effect.pre(() => {
		const unsub = createMessageHandler(
			"EXTENSION_TOGGLE",
			(payload: any, message) => {
				isActive = payload.isActive;
			},
		);

		return unsub;
	});

	$effect(() => {
		mount();
	});

	async function toggleActiveContent() {
		if (isLoading) return;

		isLoading = true;
		errorMessage = "";
		successMessage = "";

		try {
			await sendMessage("EXTENSION_TOGGLE", {
				isActive: !isActive,
				domain,
				timestamp: Date.now(),
			});
		} catch (error) {
			errorMessage = "Failed to toggle inspector";
			console.error("Error toggling inspector:", error);
		} finally {
			isLoading = false;
			setTimeout(() => {
				successMessage = "";
				errorMessage = "";
			}, 2000);
		}
	}
</script>

<main class="prose prose-zinc bg-lime-300 p-1">
	<div class="grid grid-cols-1 rounded-xl gap-y-6 p-4 border-1 border-zinc-800 min-h-36">
		<h1 class="font-bold text-center mt-0 mb-0 text-4xl">
			Amgif
		</h1>
		{#if isActive !== undefined}
			<div class="grid grid-row-1 grid-col-1">
				{#if isActive}
					<img
						transition:fade|global={{ duration: 150 }}
						class="justify-self-center-safe col-span-full row-span-full"
						src={IconOn}
						alt="amgiflol on icon"
						width={156}
					/>
				{:else}
					<img
						transition:fade|global={{ duration: 150 }}
						class="justify-self-center-safe col-span-full row-span-full"
						src={IconOff}
						alt="amgiflol off icon"
						width={156}
					/>
				{/if}
			</div>
			<hr class="mt-0 mb-0 border-zinc-800" />
			<div class="flex justify-between space-x-3">
				<Label.Root
					for="active"
					class="font-semibold text-xl flex-1 cursor-pointer"
				>Active:</Label.Root>
				<Switch.Root
					id="active"
					class="focus-visible:ring-white focus-visible:ring-offset-netural-700 data-[state=checked]:bg-white data-[state=unchecked]:bg-neutral-700 data-[state=unchecked]:shadow-mini-inset dark:data-[state=checked]:bg-white focus-visible:outline-hidden peer inline-flex w-[60px] shrink-0 cursor-pointer items-center rounded-full px-[3px] py-1 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					onclick={toggleActiveContent}
					checked={isActive}
				>
					<Switch.Thumb
						class="bg-neutral-500 data-[state=unchecked]:shadow-sm dark:border-netural-700/30 dark:bg-white dark:shadow-popover pointer-events-none block size-[26px] shrink-0 rounded-full transition-transform data-[state=checked]:translate-x-6.5 data-[state=unchecked]:translate-x-0 dark:border dark:data-[state=unchecked]:border"
					/>
				</Switch.Root>
			</div>

			{#if errorMessage}
				<div class="w-full p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
					{errorMessage}
				</div>
			{/if}

			{#if successMessage}
				<div class="w-full p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
					{successMessage}
				</div>
			{/if}
		{/if}

		<footer class="text-end">v{appConfig.version}</footer>
	</div>
</main>
