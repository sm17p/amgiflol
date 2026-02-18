import { test, expect } from "../fixtures";
import { openPopup } from "../pages/popup";

test("popup opens and shows active element", async ({ page, extensionId }) => {
	const popup = await openPopup(page, extensionId);
	await expect(page.locator("#active")).toBeVisible();
});
