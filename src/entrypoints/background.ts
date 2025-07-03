import { dataUrltoBlob } from "@/utils/data-urls";

export default defineBackground(() => {
	console.log("Hello background!", { id: browser.runtime.id });
	browser.runtime.onMessage.addListener(async (event, sender) => {
		if (event.type === "SCREENSHOT" && sender.tab) {
			console.log(
				"🚀 ~ browser.runtime.onMessage.addListener ~ event:",
				event.type,
				event,
				sender.tab?.id,
			);
			captureHandler(sender.tab);
		}
	});
	// (browser.action ?? browser.browserAction).onClicked.addListener(
	// 	async (tab) => {
	// 		console.log("browser action triggered,", tab);
	// 		if (tab.id) {
	// 			await browser.tabs.sendMessage(tab.id, { type: "MOUNT_UI" });
	// 		}
	// 	},
	// );
	// See https://developer.chrome.com/docs/extensions/develop/concepts/activeTab#invoking-activeTab
	(browser.action ?? browser.browserAction).onClicked.addListener(
		captureHandler,
	);
});

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

async function downloadImage(dataUrl: string): Promise<void> {
	const filename = `Screenshot-${
		new Date().toISOString().replaceAll(":", "-")
	}.png`;
	console.log(`Downloading image: ${filename}`, { dataUrl });

	if (import.meta.env.MANIFEST_VERSION === 3) {
		// There are known issues with download images in background scripts: https://issues.chromium.org/issues/40774955
		// But this works well enough for small screenshots
		await browser.downloads.download({
			url: dataUrl,
			filename,
		});
	} else {
		// Use "createObjectURL" for MV2
		const blob = dataUrltoBlob(dataUrl);
		const objectUrl = URL.createObjectURL(blob);
		await browser.downloads.download({
			url: objectUrl,
			filename,
		});
	}
}
