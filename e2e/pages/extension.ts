import { Locator, Page } from "@playwright/test";

import { openPopup } from "./popup";

export async function openExtensionPopup(page: Page, extensionId: string) {
	return openPopup(page, extensionId);
}

const extensionRootSelector = "[data-amgiflol-root]";
const toolbarRegionSelector = `${extensionRootSelector} [data-testid="amgiflol-toolbar-region"]`;

export function getExtensionToolbar(page: Page): Locator {
	return page.locator(`${toolbarRegionSelector} >> div.shadow-lg.inline-flex`).first();
}

export function getToolbarSettingsButton(page: Page): Locator {
	return getExtensionToolbar(page).locator("button").filter({ hasText: "0" }).first();
}

export async function openToolbarSettings(page: Page): Promise<void> {
	await getToolbarSettingsButton(page).click();
}

export function getToolbarButtonByLabel(page: Page, label: string): Locator {
	return getExtensionToolbar(page)
		.locator(`button[data-scope="toggle"][aria-label="${label}"]`)
		.first();
}
