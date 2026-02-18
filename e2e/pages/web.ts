import { Page } from "@playwright/test";

import { STABLE_TEST_PAGE_URL } from "../constants";

export async function openStableTestPage(page: Page) {
	await page.goto(STABLE_TEST_PAGE_URL);
	await page.waitForLoadState("domcontentloaded");
}

export function getExtensionRoot(page: Page) {
	return page.locator("[data-amgiflol-root]");
}

export function getSvelteAppMain(page: Page) {
	return page.locator("[data-amgiflol-root] >> main");
}

export function getInspectorActiveMain(page: Page) {
	return page.locator("[data-amgiflol-root] >> main.active");
}

export async function expectSvelteAppLoaded(page: Page) {
	await page.locator("[data-amgiflol-root] >> main").waitFor({ state: "visible" });
}
