import Main from "@/lib/Main.svelte";
import { mount, unmount } from "svelte";
import "virtual:uno.css";

export default defineContentScript({
	matches: ["<all_urls>"],
	cssInjectionMode: "ui",
	async main(ctx) {
		const ui = await createShadowRootUi(ctx, {
			anchor: "body",
			append: "after",
			mode: "closed",
			name: "amgif-lol",
			position: "inline",
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
