import { Locator, Page } from "@playwright/test";

import { openPopup } from "./popup";

export async function openExtensionPopup(page: Page, extensionId: string) {
	return openPopup(page, extensionId);
}

const extensionRootSelector = "[data-amgiflol-root]";

export function getExtensionToolbar(page: Page): Locator {
	return page
		.locator(`${extensionRootSelector} >> main.active >> div.shadow-lg.inline-flex`)
		.first();
}

export function getToolbarSettingsButton(page: Page): Locator {
	return getExtensionToolbar(page).locator("button").last();
}

export async function openToolbarSettings(page: Page): Promise<void> {
	await getToolbarSettingsButton(page).click();
}

export function getToolbarButtonByLabel(page: Page, label: string | RegExp): Locator {
	return page.locator(`${extensionRootSelector}`).getByRole("button", { name: label });
}
