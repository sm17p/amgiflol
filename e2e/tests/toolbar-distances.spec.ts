import { expect, test } from "../fixtures";
import { getToolbarButtonByLabel } from "../pages/extension";
import {
	enableStableDomainInStorage,
	expectSvelteAppLoaded,
	getExtensionRoot,
	openStableTestPage,
} from "../pages/web";

test.describe("Toolbar distances", () => {
	test("distance lines appear after hover when enabled", async ({
		context,
		extensionId: _extensionId,
		page,
	}) => {
		await enableStableDomainInStorage(context);
		await openStableTestPage(page);
		await expect(getExtensionRoot(page)).toHaveCount(1);
		await expectSvelteAppLoaded(page);

		const distancesToggle = getToolbarButtonByLabel(page, "Show Distances");
		const distancesPressed = await distancesToggle.getAttribute("aria-pressed");
		if (distancesPressed !== "true") {
			await distancesToggle.click();
		}

		await page.locator('[data-testid="editable-paragraph"]').dispatchEvent("mouseover");

		const distanceLines = page
			.locator("[data-amgiflol-root]")
			.locator("svg.fixed")
			.locator("line.text-lime-300");
		await expect(distanceLines.first()).toBeAttached();
		await expect(distanceLines.first()).toHaveAttribute("stroke", "#bbf451");
		await expect(distanceLines.first()).toHaveAttribute("stroke-dasharray", "none");
	});
});

