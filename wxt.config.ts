import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
	manifest: {
		permissions: ["activeTab", "downloads", "storage"],
	},
	modules: ["@wxt-dev/module-svelte", "@wxt-dev/unocss"],
	outDir: "dist",
	srcDir: "src",
	svelte: {
		vite: {
			compilerOptions: {
				runes: true,
			},
		},
	},
	webExt: {
		openConsole: true,
		openDevtools: true,
		chromiumPort: 57540,
		chromiumArgs: ["--user-data-dir=./.wxt/chrome-data"],
		keepProfileChanges: true,
		startUrls: [
			"https://wxt.dev/guide/essentials/entrypoints.html",
			"https://wxt.dev/examples.html",
			"https://wxt.dev/guide/resources/community.html",
		],
	},
	zip: {
		excludeSources: [
			"ARCHITECTURE.md",
			"DESIGN.md",
		],
	},
});
