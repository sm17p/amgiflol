import { expect, test } from "../fixtures";
import { getToolbarButtonByLabel } from "../pages/extension";
import {
	enableStableDomainInStorage,
	expectSvelteAppLoaded,
	getExtensionRoot,
	openStableTestPage,
} from "../pages/web";

test.describe("Toolbar overlays", () => {
	test("grid overlay can be toggled", async ({ context, extensionId: _extensionId, page }) => {
		await enableStableDomainInStorage(context);
		await openStableTestPage(page);
		await expect(getExtensionRoot(page)).toHaveCount(1);
		await expectSvelteAppLoaded(page);

		await getToolbarButtonByLabel(page, "Show Grid Lines").click();

		const grid = page
			.locator("[data-amgiflol-root]")
			.locator("svg.fixed")
			.locator("rect[fill='url(#grid)']");
		await expect(grid).toBeVisible();
	});

	test("ruler overlay can be toggled", async ({ context, extensionId: _extensionId, page }) => {
		await enableStableDomainInStorage(context);
		await openStableTestPage(page);
		await expect(getExtensionRoot(page)).toHaveCount(1);
		await expectSvelteAppLoaded(page);

		await page.mouse.move(200, 200);
		await getToolbarButtonByLabel(page, "Show Ruler").click();

		const rulerGroup = page
			.locator("[data-amgiflol-root]")
			.locator("svg.fixed")
			.locator("g[filter='url(#invertedOutline)']");
		await expect(rulerGroup).toBeVisible();
	});
});
