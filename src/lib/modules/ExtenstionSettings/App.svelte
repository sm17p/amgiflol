<script lang="ts">
	import { Label, Switch } from "bits-ui";
	import { browser } from "wxt/browser";
	import "./app.css";
	import {
		createMessageHandler,
		sendMessage,
	} from "@/lib/core/MessageBus";

	let isLoading = $state(false);
	let errorMessage = $state("");
	let successMessage = $state("");

	let isActive = $state(false);

	let domain = "";

	function toggleActive() {
		browser.storage?.local.set({
			[domain]: !isActive,
		});

		isActive = !isActive;
	}

	async function mount() {
		try {
			const [tab] = await browser.tabs.query({
				active: true,
				currentWindow: true,
			});

			const url = new URL(tab.url!);
			domain = url.host;

			let result = await browser.storage?.local.get([
				domain,
			]);

			if (result) {
				isActive = result[domain] ?? false;
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
				if (payload.isActive !== isActive && message.source !== "popup") {
					isActive = payload.isActive;
				}
			},
		);

		return unsub;
	})

	$effect.pre(() => {
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
				timestamp: Date.now(),
			}, "content");

			toggleActive();
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
	<div class="grid grid-cols-1 rounded-xl gap-y-6 p-4 border-1 border-zinc-800">
		<h1 class="font-bold text-center mt-0 mb-0">
			Amgif lol
		</h1>
		<hr class="mt-0 mb-0 border-zinc-800" />
		<div class="flex justify-between space-x-3">
			<Label.Root
				for="active"
				class="font-semibold text-2xl"
			>Active:</Label.Root>
			<Switch.Root
				id="active"
				class="focus-visible:ring-white focus-visible:ring-offset-netural-700 data-[state=checked]:bg-white data-[state=unchecked]:bg-neutral-700 data-[state=unchecked]:shadow-mini-inset dark:data-[state=checked]:bg-white focus-visible:outline-hidden peer inline-flex w-[60px] shrink-0 cursor-pointer items-center rounded-full px-[3px] transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
				onclick={toggleActiveContent}
				checked={isActive}
			>
				<Switch.Thumb
					class="bg-neutral-500 data-[state=unchecked]:shadow-mini dark:border-netural-700/30 dark:bg-white dark:shadow-popover pointer-events-none block size-[30px] shrink-0 rounded-full transition-transform data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-0 dark:border dark:data-[state=unchecked]:border"
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
	</div>
</main>
