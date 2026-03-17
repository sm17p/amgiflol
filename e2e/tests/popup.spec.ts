import pkg from "../../package.json" assert { type: "json" };
import { expect, test } from "../fixtures";

test.describe("Popup", () => {
	test("popup shows correct UI and updates storage when toggled", async ({
		page,
		extensionId,
	}) => {
		await page.goto(`chrome-extension://${extensionId}/popup.html`);

		await expect(page.getByRole("heading", { name: "Amgif" })).toBeVisible();
		const offIcon = page.getByRole("img", { name: "amgiflol off icon" });
		await expect(offIcon).toBeVisible();
		await expect(offIcon).toHaveAttribute("src", /icon-off/i);

		await expect(page.getByText(`v${pkg.version}`)).toBeVisible();

		const storageBefore = await page.evaluate(async () => {
			return browser.storage.local.get(null);
		});

		const toggle = page.getByLabel("Active:");
		await expect(toggle).not.toBeChecked();

		await page.getByText("Active:").click();
		await expect(toggle).toBeChecked();

		const logoAfter = page.getByRole("img", { name: "amgiflol on icon" });
		await expect(logoAfter).toBeVisible();

		const storageAfter = await page.evaluate(async () => {
			return browser.storage.local.get(null);
		});
		const changedKeys = Object.keys(storageAfter).filter(
			(key) => storageAfter[key] !== storageBefore[key],
		);

		expect(changedKeys.length).toBeGreaterThan(0);
		expect(changedKeys.some((key) => storageAfter[key] === true)).toBeTruthy();
	});
});
