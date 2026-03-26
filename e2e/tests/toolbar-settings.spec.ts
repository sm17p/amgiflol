import { expect, test } from "../fixtures";
import { openToolbarSettings } from "../pages/extension";
import {
	enableStableDomainInStorage,
	expectSvelteAppLoaded,
	getExtensionRoot,
	openStableTestPage,
} from "../pages/web";

test.describe("Toolbar settings menu", () => {
	test("feature voting and behaviour toggles are visible and interactive", async ({
		context,
		extensionId: _extensionId,
		page,
	}) => {
		await enableStableDomainInStorage(context);
		await openStableTestPage(page);
		await expect(getExtensionRoot(page)).toHaveCount(1);
		await expectSvelteAppLoaded(page);

		await openToolbarSettings(page);

		const featureVoting = page.getByRole("group", { name: "Feature Voting" }).first();
		await expect(featureVoting).toBeVisible();

		const toolbarAutoHideItem = page.locator('[id*="toolbar-auto-hide"]').first();
		await expect(toolbarAutoHideItem).toBeVisible();

		const toolbarAutoHideCheckbox = toolbarAutoHideItem.getByRole("checkbox").first();
		await expect(toolbarAutoHideCheckbox).toBeVisible();

		const autoHideBefore = await toolbarAutoHideCheckbox.isChecked();
		await toolbarAutoHideCheckbox.click({ force: true });

		if (autoHideBefore) {
			await expect(toolbarAutoHideCheckbox).not.toBeChecked();
		} else {
			await expect(toolbarAutoHideCheckbox).toBeChecked();
		}
	});
});
