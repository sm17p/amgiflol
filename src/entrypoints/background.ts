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
		}
	});

	browser.runtime.onInstalled.addListener(async ({ reason }) => {
		console.log(
			`Extension installed, reason: ${reason}, browser: ${import.meta.env.BROWSER}`,
		);
		analytics.setEnabled(true);
		updateIconForActiveTab();
	});

	browser.runtime.onStartup.addListener(async () => {
		console.log("Extension started");
		await updateIconForActiveTab();
	});

	// Update icon when switching tabs
	browser.tabs.onActivated.addListener(async () => {
		updateIconForActiveTab();
	});

	// Update icon when tab URL changes
	browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
		if (changeInfo.status === "complete" && tab.active) {
			updateIconForActiveTab();
		}
	});

	// Listen for storage changes to update icon
	browser.storage.onChanged.addListener(async (changes, areaName) => {
		if (areaName === "local") {
			updateIconForActiveTab();
		}
	});
});

/**
 * Get the current active tab's domain
 */
async function getCurrentDomain(): Promise<string | null> {
	try {
		const [tab] = await browser.tabs.query({
			active: true,
			currentWindow: true,
		});

		if (!tab.url) return null;

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

/**
 * Update extension icon based on current active tab's domain state
 */
async function updateIconForActiveTab() {
	try {
		const domain = await getCurrentDomain();

		if (!domain) {
			// No valid domain, show disabled state
			await (browser.action ?? browser.browserAction).setIcon({
				path: IconOff,
			});
			console.log("No valid domain, icon set to disabled");
			return;
		}

		const isActive = await isDomainActive(domain);

		await (browser.action ?? browser.browserAction).setIcon({
			path: isActive ? IconOn : IconOff,
		});

		console.log(
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
