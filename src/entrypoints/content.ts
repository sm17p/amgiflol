import { mount, unmount } from "svelte";

import Main from "@/lib/Main.svelte";
import "virtual:uno.css";

export default defineContentScript({
	matches: ["https://*/*", "http://*/*"],
	cssInjectionMode: "ui",
	async main(ctx) {
		const ui = await createShadowRootUi(ctx, {
			anchor: "body",
			append: "after",
			mode: "closed",
			name: "amgif-lol",
			position: "inline",
			onMount: (container) => {
				const root = container.getRootNode();
				if (root instanceof ShadowRoot) {
					root.host.setAttribute("data-amgiflol-root", "true");
				}
				return mount(Main, { target: container });
			},
			onRemove: (app) => {
				unmount(app!);
			},
		});

		ui.mount();
	},
});
