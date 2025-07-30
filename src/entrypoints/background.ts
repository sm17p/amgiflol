const IconOff = {
	16: "icons/icon-off-16.png",
	32: "icons/icon-off-32.png",
	48: "icons/icon-off-48.png",
	64: "icons/icon-off-64.png",
	128: "icons/icon-off-128.png",
};

const IconOn = {
	16: "icons/16.png",
	32: "icons/32.png",
	48: "icons/48.png",
	128: "icons/128.png",
};

export default defineBackground(() => {
	browser.runtime.onMessage.addListener(async (event, sender) => {
		if (event.type === "SCREENSHOT" && sender.tab) {
			captureHandler(sender.tab);
		} else if (event.type === "EXTENSION_TOGGLE") {
			const { domain, isActive } = event.payload;
			browser.storage?.local.set({
				[domain]: isActive,
			});
			setIcon(isActive);
		}
	});

	browser.runtime.onInstalled.addListener(async ({ reason }) => {
		console.log(
			`Extension installed, reason: ${reason}, browser: ${import.meta.env.BROWSER}`,
		);

		savePlatformInfo();
		analytics.setEnabled(true);
		updateIconForActiveTab();
	});

	browser.runtime.onStartup.addListener(async () => {
		console.log("Extension started");
		updateIconForActiveTab();
	});

	// Update icon when switching tabs
	browser.tabs.onActivated.addListener(async (_activeInfo) => {
		savePlatformInfo();
		updateIconForActiveTab();
	});

	// Update icon when tab URL changes
	browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
		if (changeInfo.status === "complete" && tab.active) {
			updateIconForActiveTab();
		}
	});

	// // Listen for storage changes to update icon
	browser.storage.onChanged.addListener(async (changes, areaName) => {
		if (areaName === "local") {
			updateIconForActiveTab();
		}
	});
});

async function savePlatformInfo() {
	const platformInfo = await browser.runtime.getPlatformInfo();
	browser.storage.local.set({ "platformInfo": platformInfo });
}

/**
 * Get the current active tab's domain
 */
async function getCurrentDomain(tabId?: number): Promise<string | null> {
	try {
		let tab: globalThis.Browser.tabs.Tab;
		if (tabId) {
			tab = await browser.tabs.get(tabId);
		} else {
			[tab] = await browser.tabs.query({
				active: true,
				currentWindow: true,
			});
		}

		if (!tab?.url) return null;

		const url = new URL(tab.url);
		return url.host;
	} catch (error) {
		console.error("Failed to get current domain:", error);
		return null;
	}
}

/**
 * Check if extension is active for a specific domain
 */
async function isDomainActive(domain: string): Promise<boolean> {
	try {
		const result = await browser.storage.local.get([domain]);
		return Boolean(result[domain]);
	} catch (error) {
		console.error("Failed to check domain state:", error);
		return true;
	}
}

async function setIcon(isActive: boolean) {
	await (browser.action ?? browser.browserAction).setIcon({
		path: isActive ? IconOn : IconOff,
	});
}

/**
 * Update extension icon based on current active tab's domain state
 */
async function updateIconForActiveTab(tabId?: number) {
	try {
		const domain = await getCurrentDomain(tabId);

		if (!domain) {
			// No valid domain, show disabled state
			setIcon(false);
			console.log("No valid domain, icon set to disabled");
			return;
		}

		const isActive = await isDomainActive(domain);

		setIcon(isActive);

		console.trace(
			`Icon updated for domain "${domain}": ${
				isActive ? "active" : "inactive"
			}`,
		);
	} catch (error: unknown) {
		console.error("Failed to update icon for active tab:", error);
	}
}

async function captureHandler(tab: Browser.tabs.Tab) {
	try {
		const dataUrl = await browser.tabs.captureVisibleTab();
		await downloadImage(dataUrl);
	} catch (err) {
		console.error(
			"Cannot capture screenshot of current tab",
			tab,
			err,
		);
	}
}

async function downloadImage(dataUrl: string): Promise<number> {
	const filename = `Screenshot-${
		new Date().toISOString().replaceAll(":", "-")
	}.png`;

	console.log(`Downloading image: ${filename}`, { dataUrl });

	if (import.meta.env.FIREFOX || import.meta.env.MANIFEST_VERSION === 2) {
		const blob = dataUrltoBlob(dataUrl);
		const objectUrl = URL.createObjectURL(blob);
		return browser.downloads.download({
			url: objectUrl,
			filename,
		});
	} else {
		// There are known issues with download images in background scripts: https://issues.chromium.org/issues/40774955
		// But this works well enough for small screenshots
		return browser.downloads.download({
			url: dataUrl,
			filename,
		});
	}
}
