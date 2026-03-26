import { BrowserContext, Page } from "@playwright/test";
import path from "path";

declare const chrome: {
	storage: {
		local: {
			get: (keys: string[]) => Promise<Record<string, unknown>>;
			set: (items: Record<string, unknown>) => void | Promise<void>;
		};
	};
};

export async function openStableTestPage(page: Page) {
	await page.goto("/inspector-playground.html");
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
		const toBooleanRecord = (value: unknown): Record<string, boolean> => {
			if (typeof value !== "object" || value === null) return {};
			const result: Record<string, boolean> = {};
			for (const [key, fieldValue] of Object.entries(value)) {
				if (typeof fieldValue === "boolean") {
					result[key] = fieldValue;
				}
			}
			return result;
		};
		const toUnknownRecord = (value: unknown): Record<string, unknown> => {
			if (typeof value !== "object" || value === null) return {};
			const result: Record<string, unknown> = {};
			for (const [key, fieldValue] of Object.entries(value)) {
				result[key] = fieldValue;
			}
			return result;
		};
		return chrome.storage.local.get(["amg-state"]).then((result) => {
			const currentState = result["amg-state"];
			const stateRecord = toUnknownRecord(currentState);
			const baseState = {
				analytics: toUnknownRecord(stateRecord.analytics),
				domains: toBooleanRecord(stateRecord.domains),
				votes: toBooleanRecord(stateRecord.votes),
			};
			return chrome.storage.local.set({
				"amg-state": {
					...baseState,
					domains: {
						...baseState.domains,
						[d]: true,
					},
				},
			});
		});
	};
	await worker.evaluate(setStorage, domain);
}

export async function enableStableDomainInStorage(context: BrowserContext) {
	const domain = "localhost:51234";
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
	const timeoutMs = process.env.CI ? 24_000 : 12_000;
	const pollMs = 250;
	const startTime = Date.now();
	const root = getExtensionRoot(page).first();
	await root.waitFor({ state: "attached", timeout: timeoutMs });

	while (Date.now() - startTime < timeoutMs) {
		if (page.isClosed()) {
			throw new Error("Page closed while waiting for extension app to activate.");
		}
		const activeMainCount = await getInspectorActiveMain(page).count();
		if (activeMainCount > 0) return;
		await page.waitForTimeout(pollMs);
	}

	const rootCount = await getExtensionRoot(page).count();
	const mainCount = await getSvelteAppMain(page).count();
	throw new Error(
		`Extension app did not activate within ${timeoutMs}ms (rootCount=${rootCount}, mainCount=${mainCount}).`,
	);
}
