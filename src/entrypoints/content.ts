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
			mode: "open",
			name: "amgif-lol",
			position: "inline",
			onMount: (container) => {
				const rootNode = container.getRootNode();
				if (rootNode instanceof ShadowRoot) {
					rootNode.host.setAttribute("data-amgiflol-root", "true");
					return mount(Main, { target: container, props: { rootNode } });
				}

				return null;
			},
			onRemove: (app) => {
				unmount(app!);
			},
		});

		ui.mount();
	},
});
