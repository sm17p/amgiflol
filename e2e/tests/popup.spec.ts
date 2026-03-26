import pkg from "../../package.json" assert { type: "json" };
import { expect, test } from "../fixtures";

function toUnknownRecord(value: unknown): Record<string, unknown> {
	if (typeof value !== "object" || value === null) return {};
	const result: Record<string, unknown> = {};
	for (const [key, fieldValue] of Object.entries(value)) {
		result[key] = fieldValue;
	}
	return result;
}

function toBooleanRecord(value: unknown): Record<string, boolean> {
	const unknownRecord = toUnknownRecord(value);
	const result: Record<string, boolean> = {};
	for (const [key, fieldValue] of Object.entries(unknownRecord)) {
		if (typeof fieldValue === "boolean") {
			result[key] = fieldValue;
		}
	}
	return result;
}

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
		expect(Object.hasOwn(storageBefore, "amg-state")).toBeTruthy();
		expect(Object.hasOwn(storageAfter, "amg-state")).toBeTruthy();

		const domain = await page.evaluate(async () => {
			const [tab] = await browser.tabs.query({
				active: true,
				currentWindow: true,
			});
			if (!tab?.url) return "";
			return new URL(tab.url).host;
		});

		const beforeAmgState = toUnknownRecord(storageBefore["amg-state"]);
		const afterAmgState = toUnknownRecord(storageAfter["amg-state"]);
		const beforeDomains = toBooleanRecord(beforeAmgState.domains);
		const afterDomains = toBooleanRecord(afterAmgState.domains);
		const beforeDomainValue = beforeDomains[domain];
		const afterDomainValue = afterDomains[domain];

		expect(beforeDomainValue === undefined || beforeDomainValue === false).toBeTruthy();
		expect(afterDomainValue).toBeTruthy();
	});
});
