import { expect, test } from "../fixtures";
import { getToolbarButtonByLabel } from "../pages/extension";
import {
	enableStableDomainInStorage,
	expectSvelteAppLoaded,
	getExtensionRoot,
	openStableTestPage,
} from "../pages/web";

test.describe("Side panel", () => {
	test("side panel can be shown from toolbar", async ({ context, extensionId: _extensionId, page }) => {
		await enableStableDomainInStorage(context);
		await openStableTestPage(page);
		await expect(getExtensionRoot(page)).toHaveCount(1);
		await expectSvelteAppLoaded(page);

		await getToolbarButtonByLabel(page, "Show Side Panel").click();

		await page.locator('[data-testid="editable-paragraph"]').dispatchEvent("mouseover");
		await expect(page.getByRole("heading", { name: "Element Inspector" })).toBeVisible();
	});
});

