import Main from "@/lib/Main.svelte";
import "@/assets/tailwind.css";
import { mount, unmount } from "svelte";

export default defineContentScript({
	matches: ["<all_urls>"],
	cssInjectionMode: "ui",
	async main(ctx) {
		const ui = await createShadowRootUi(ctx, {
			name: "amgif-lol",
			position: "inline",
			anchor: "body",

			onMount: (container) => {
				// Create the Svelte app inside the UI container
				return mount(Main, { target: container });
			},
			onRemove: (app) => {
				// Destroy the app when the UI is removed
				unmount(app!);
			},
		});

		ui.mount();
	},
});
