import {
	type BrowserContext,
	chromium,
	firefox,
	test as base,
} from "@playwright/test";
import path from "path";

const pathToExtension = path.resolve("dist/firefox-mv3");

export const test = base.extend<{
	context: BrowserContext;
	extensionId: string;
}>({
	context: async ({}, use) => {
		const context = await firefox.launchPersistentContext("", {
			headless: false,
			args: [
				`--disable-extensions-except=${pathToExtension}`,
				`--load-extension=${pathToExtension}`,
			],
		});
		await use(context);
		await context.close();
	},
	extensionId: async ({ context }, use) => {
		let background: { url(): string };
		if (pathToExtension.endsWith("-mv3")) {
			[background] = context.serviceWorkers();
			if (!background) {
				background = await context.waitForEvent("serviceworker");
			}
		} else {
			[background] = context.backgroundPages();
			if (!background) {
				background = await context.waitForEvent("backgroundpage");
			}
		}

		const extensionId = background.url().split("/")[2];
		await use(extensionId);
	},
});
export const expect = test.expect;
