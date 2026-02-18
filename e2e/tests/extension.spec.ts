import { test, expect } from "../fixtures";
import { openPopup } from "../pages/popup";
import {
	openStableTestPage,
	expectSvelteAppLoaded,
	getExtensionRoot,
	getInspectorActiveMain,
} from "../pages/web";

test.describe("Popup", () => {
	test("popup opens and shows active toggle", async ({ page, extensionId }) => {
		await openPopup(page, extensionId);
		await expect(page.locator("#active")).toBeVisible();
	});
});

test.describe("Content injection", () => {
	test("inspector root and app load on supported page", async ({
		page,
		context,
		extensionId,
	}) => {
		await openStableTestPage(page);
		await expect(getExtensionRoot(page)).toBeVisible();
		await expectSvelteAppLoaded(page);
	});
});

test.describe("Per-domain activation", () => {
	test("when domain is enabled in storage, inspector is active on page load", async ({
		page,
		context,
		extensionId,
	}) => {
		const [worker] = context.serviceWorkers();
		const setStorage = (domain: string) => {
			const w = globalThis as unknown as {
				chrome: { storage: { local: { set: (o: Record<string, boolean>) => void } } };
			};
			w.chrome.storage.local.set({ [domain]: true });
		};
		await worker.evaluate(setStorage, "example.com");
		await openStableTestPage(page);
		await expectSvelteAppLoaded(page);
		await expect(getInspectorActiveMain(page)).toBeVisible({ timeout: 5000 });
	});
});
