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
		test.setTimeout(15_000);

		await enableStableDomainInStorage(context);
		await openStableTestPage(page);
		await expect(getExtensionRoot(page)).toHaveCount(1);
		await expectSvelteAppLoaded(page);

		await openToolbarSettings(page);

		const featureVoting = page.getByRole("group", { name: "Feature Voting" }).first();
		await expect(featureVoting).toBeVisible();

		const toolbarAutoHideItem = page
			.getByRole("menuitemcheckbox", { name: /Auto-Hide/i })
			.first();
		await expect(toolbarAutoHideItem).toBeVisible();
		await toolbarAutoHideItem.scrollIntoViewIfNeeded();

		const autoHideBefore = await toolbarAutoHideItem.getAttribute("aria-checked");
		await toolbarAutoHideItem.click({ force: true });

		const viewport = page.viewportSize();
		expect(viewport).toBeTruthy();
		if (!viewport) throw new Error("viewport not available");

		await page.mouse.move(viewport.width / 2, viewport.height - 1);
		await openToolbarSettings(page);

		const toolbarAutoHideItemAfter = page
			.getByRole("menuitemcheckbox", { name: /Auto-Hide/i })
			.first();
		await expect(toolbarAutoHideItemAfter).toBeVisible();

		const autoHideAfter = await toolbarAutoHideItemAfter.getAttribute("aria-checked");
		expect(autoHideAfter).not.toBe(autoHideBefore);
	});
});
