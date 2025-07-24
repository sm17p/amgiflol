import { defineConfig, type UserManifest } from "wxt";
import packageJson from "./package.json";

// See https://wxt.dev/api/config.html
export default defineConfig({
	manifest({ browser }) {
		const [author, email] = packageJson.author.split(" ");

		let manifest: UserManifest = {
			name: packageJson.name,
			description: packageJson.description,
			homepage_url: packageJson.homepage,
			permissions: [
				"activeTab",
				"clipboardWrite",
				"downloads",
				"storage",
			],
		};

		if (browser === "firefox") {
			manifest.browser_specific_settings = {
				gecko: {
					"id": "amgiflol@sm17p.me",
					"strict_min_version": "132.0",
				},
			};
			manifest.developer = {
				name: author,
				url: packageJson.repository,
			};
			// @ts-ignore
			manifest.author = author;
		} else {
			manifest.author = { email };
			manifest.offline_enabled = true;
			manifest.minimum_chrome_version = "130.0";
		}

		return manifest;
	},
	modules: [
		"@wxt-dev/module-svelte",
		"@wxt-dev/unocss",
		"@wxt-dev/analytics/module",
		"@wxt-dev/auto-icons",
	],
	outDir: "dist",
	srcDir: "src",
	svelte: {
		vite: {
			compilerOptions: {
				runes: true,
			},
		},
	},
	vite: (_env) => ({
		build: {
			sourcemap: "inline",
		},
	}),
	webExt: {
		openConsole: true,
		openDevtools: true,
		chromiumPort: 57540,
		chromiumArgs: ["--user-data-dir=./.wxt/chrome-data"],
		keepProfileChanges: true,
		// firefoxArgs: ["--user-data-dir=./.wxt/firefox-data"],
		startUrls: [
			"https://wxt.dev/guide/essentials/entrypoints.html",
		],
	},
	zip: {
		excludeSources: [
			"tmp/*",
			"*.env*",
		],
	},
});
