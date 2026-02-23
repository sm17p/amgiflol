import { Page } from "@playwright/test";

const POPUP_ACTIVE_TIMEOUT = 15_000;
export async function openPopup(page: Page, extensionId: string) {
	await page.goto(`chrome-extension://${extensionId}/popup.html`);
	await page.waitForLoadState("domcontentloaded");

	await page.waitForSelector("#active", { state: "visible", timeout: POPUP_ACTIVE_TIMEOUT });

	const popup = {
		getToggle: () => page.waitForSelector("#active"),
		clickToggle: async () => {
			const toggle = await popup.getToggle();
			await toggle.click();
		},
	};
	return popup;
}
