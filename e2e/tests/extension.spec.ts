import { expect, test } from "../fixtures";
import {
	enableStableDomainInStorage,
	expectSvelteAppLoaded,
	getExtensionRoot,
	getInspectorActiveMain,
	openStableTestPage,
} from "../pages/web";

test.describe("Content injection", () => {
	test.setTimeout(15_000);

	test("inspector root and app load on supported page", async ({ page }) => {
		await openStableTestPage(page);
		await expect(getExtensionRoot(page)).toHaveCount(1);
	});
});

test.describe("Per-domain activation", () => {
	test("when domain is enabled in storage, inspector is active on page load", async ({
		context,
		extensionId: _extensionId,
		page,
	}) => {
		await enableStableDomainInStorage(context);
		await openStableTestPage(page);
		await expectSvelteAppLoaded(page);
		await expect(getInspectorActiveMain(page)).toHaveCount(1);
	});
});
