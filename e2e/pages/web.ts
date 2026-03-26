import { BrowserContext, Page } from "@playwright/test";
import path from "path";

import { STABLE_TEST_PAGE_URL } from "../constants";

declare const chrome: {
	storage: {
		local: {
			set: (items: Record<string, boolean>) => void | Promise<void>;
		};
	};
};

export async function openStableTestPage(page: Page) {
	await page.goto(STABLE_TEST_PAGE_URL);
	await page.waitForLoadState("domcontentloaded");
	await page.waitForSelector('[data-testid="playground-main"]');
}

export async function openInspectorPlaygroundPage(page: Page) {
	const filePath = path.resolve("e2e/fixtures-pages/inspector-playground.html");
	await page.goto(`file://${filePath}`);
	await page.waitForLoadState("domcontentloaded");
}

export async function enableDomainInStorage(context: BrowserContext, domain: string) {
	let [worker] = context.serviceWorkers();
	if (!worker) {
		worker = await context.waitForEvent("serviceworker");
	}
	const setStorage = (d: string) => {
		return chrome.storage.local.set({ [d]: true });
	};
	await worker.evaluate(setStorage, domain);
}

export async function enableStableDomainInStorage(context: BrowserContext) {
	const domain = "127.0.0.1:51234";
	await enableDomainInStorage(context, domain);
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
	await page.locator("[data-amgiflol-root] >> main.active").waitFor({ state: "attached" });
}
