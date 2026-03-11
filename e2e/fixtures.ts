import { test as base, type BrowserContext, chromium } from "@playwright/test";
import os from "os";
import path from "path";

const pathToExtension = path.resolve("dist/chrome-mv3");
const userDataDir = path.join(os.tmpdir(), "playwright-amgiflol-extension");

export const test = base.extend<{
	context: BrowserContext;
	extensionId: string;
}>({
	context: async ({ browserName: _browserName }, use) => {
		const context = await chromium.launchPersistentContext(userDataDir, {
			headless: !!process.env.CI,
			args: [
				`--disable-extensions-except=${pathToExtension}`,
				`--load-extension=${pathToExtension}`,
			],
		});
		await context.addInitScript(() => {
			const orig = Element.prototype.attachShadow;
			Element.prototype.attachShadow = function (init) {
				return orig.call(this, { ...init, mode: "open" });
			};
		});
		await use(context);
		await context.close();
	},
	extensionId: async ({ context }, use) => {
		let [background] = context.serviceWorkers();
		if (!background) {
			background = await context.waitForEvent("serviceworker");
		}
		const extensionId = background.url().split("/")[2];
		await use(extensionId);
	},
});
export const expect = test.expect;
