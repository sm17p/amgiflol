import IconOn from "@/assets/icon.png";
import IconOff from "@/assets/icon.png";

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
		iconActions();
		analytics.setEnabled(true);
	});
});

function iconActions() {
	storage.watch<boolean>(
		"local:isExtensionEnabled",
		isEnabled =>
			browser.action.setIcon({
				path: isEnabled! ? IconOn : IconOff,
			}),
	);
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
