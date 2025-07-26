import { createMessageHandler, sendMessage } from "@/lib/core/MessageBus";
import rainbowLayoutCss from "@/lib/css/rainbow-translucent.css?raw";
import { booleanToVote } from "@/utils/tracking";
import { watch } from "runed";
import { browser } from "wxt/browser";

export class UIStore implements App.UIStore {
	isActive = $state(false);
	debugToolbar = $state({
		isVisible: import.meta.env.DEV,
	});
	rainbowLayout = $state<App.UIStore["rainbowLayout"]>({
		css: new CSSStyleSheet({ disabled: true }),
		enabled: false,
	});
	sidePanel = $state({
		autoMove: false,
		isVisible: false,
		width: 360,
		selectedTab: "properties",
	});
	svg = $state({
		// TODO: Why error?
		mode: "inspect" as App.Mode,
		showDistances: true,
		showGrid: false,
		showRuler: false,
		zoomLevel: 1,
	});
	// TODO: why explicit type declaration needed over here?
	toolbar = $state<App.UIStore["toolbar"]>({
		autoMove: false,
		autoHide: false,
		featureVotingVisible: true,
		isVisible: true,
		position: { x: 20, y: 20 },
		settings: {
			open: false,
		},
	});

	constructor() {
		this.toggleRainbowLayout = this.toggleRainbowLayout.bind(this);
		// Setup rainbow layout stylesheet
		this.rainbowLayout.css!.replace(rainbowLayoutCss);
		document.adoptedStyleSheets.push(this.rainbowLayout.css!);

		$effect(() => {
			const cleanup = createMessageHandler("KEYDOWN", this.handleKeyDown);
			return cleanup;
		});

		watch(
			() => [
				this.rainbowLayout.enabled,
				this.sidePanel.isVisible,
				this.sidePanel.autoMove,
				this.svg.showDistances,
				this.svg.showRuler,
				this.svg.showGrid,
				this.toolbar.settings.open,
				this.toolbar.autoHide,
				this.toolbar.autoMove,
			],
			() => {
				this.syncToStorage("content");
			},
			{
				lazy: true,
			},
		);
	}

	handleKeyDown = (
		event: KeyboardEvent,
		_message: App.Message<KeyboardEvent>,
	) => {
		switch (event.key) {
			// case "i":
			// case "I":
			// 	if (event.ctrlKey || event.metaKey) {
			// 		this.toggleActive("content");
			// 	}
			// 	break;
			case "1":
				if (event.ctrlKey || event.metaKey) {
					this.setMode("inspect");
				}
				break;
			// case "2":
			// 	if (event.ctrlKey || event.metaKey) {
			// 		event.preventDefault();
			// 		uiStore.setMode("select");
			// 	}
			// 	break;
			// case "3":
			// 	if (event.ctrlKey || event.metaKey) {
			// 		event.preventDefault();
			// 		uiStore.setMode("measure");
			// 	}
			// 	break;
			// case "d":
			// case "D":
			// 	if (event.ctrlKey || event.metaKey) {
			// 		this.toggleDistances();
			// 	}
			// 	break;
			// case "r":
			// case "R":
			// 	if (event.ctrlKey || event.metaKey) {
			// 		this.toggleRulers();
			// 	}
			// 	break;
			case "#":
				this.toggleGridlines();
				break;
			case "$":
				this.toggleRulers();
				break;
			case "%":
				this.toggleDistances();
				break;
			case "6":
				this.toggleRainbowLayout();
				break;
			case "8":
				this.toggleSidePanel();
				break;
			case "0":
				this.toggleToolbarSettings();
				break;
		}
	};

	toggleToolbar() {
		this.toolbar.isVisible = !this.toolbar.isVisible;
	}

	setActiveFeature(feature?: string) {
		this.toolbar.activeFeature = feature;
	}

	toggleAutoHide() {
		this.toolbar.autoHide = !this.toolbar.autoHide;
	}

	toggleRainbowLayout = () => {
		this.rainbowLayout.css!.disabled = this.rainbowLayout.enabled;
		this.rainbowLayout.enabled = !this.rainbowLayout.enabled;
	};

	toggleSidePanel() {
		this.sidePanel.isVisible = !this.sidePanel.isVisible;
	}

	toggleToolbarSettings() {
		this.toolbar.settings.open = !this.toolbar.settings.open;
	}

	setSidePanelTab(tab: string) {
		this.sidePanel.selectedTab = tab;
	}

	setSidePanelWidth(width: number) {
		this.sidePanel.width = Math.max(250, Math.min(600, width));
	}

	toggleDebugToolbar() {
		this.debugToolbar.isVisible = !this.debugToolbar
			.isVisible;
	}

	setMode(mode: App.Mode) {
		this.svg.mode = mode;
	}

	toggleGridlines() {
		this.svg.showGrid = !this.svg.showGrid;
		analytics.track("toggle_gridlines", {
			value: booleanToVote(this.svg.showGrid),
		});
	}

	toggleDistances() {
		this.svg.showDistances = !this.svg.showDistances;
		analytics.track("toggle_distances", {
			value: booleanToVote(this.svg.showDistances),
		});
	}

	toggleRulers() {
		this.svg.showRuler = !this.svg.showRuler;
		analytics.track("toggle_ruler", {
			value: booleanToVote(this.svg.showRuler),
		});
	}

	setZoomLevel(zoom: number) {
		this.svg.zoomLevel = Math.max(0.1, Math.min(5, zoom));
	}

	makeToolbarVisible(visible: boolean) {
		this.toolbar.isVisible = visible;
	}

	async toggleActive(from: App.Message["source"]) {
		this.isActive = !this.isActive;
		await this.syncToStorage(from);
		if (from === "content") {
			this.broadcastStateChange();
		}
	}

	public snapshot(): App.UIStore {
		const snapshot = {
			isActive: this.isActive,
			debugToolbar: $state.snapshot(this.debugToolbar),
			rainbowLayout: {
				enabled: this.rainbowLayout.enabled,
			},
			sidePanel: $state.snapshot(this.sidePanel),
			svg: $state.snapshot(this.svg),
			toolbar: $state.snapshot(this.toolbar),
		};
		return snapshot;
	}

	private async syncToStorage(from: App.Message["source"]) {
		try {
			let active: Record<string, boolean> = {};
			if (from === "content") {
				const { host } = window.location;
				active[host] = this.isActive;
			}
			const uiStore = this.snapshot();
			await browser.storage?.local.set({
				uiStore,
				...active,
			});
		} catch (error) {
			console.error("Failed to sync inspector state to storage:", error);
		}
	}

	private broadcastStateChange() {
		sendMessage("EXTENSION_TOGGLE", {
			isActive: this.isActive,
			timestamp: Date.now(),
		}, "popup");
	}

	async loadFromStorage() {
		try {
			const { host } = window.location;
			const result: {
				uiStore?: App.UIStore;
			} & { [host]: boolean } = await browser.storage?.local.get([
				"uiStore",
				host,
			]);

			if (Object.hasOwn(result, host)) {
				this.isActive = result[host] ?? false;
			}

			if (result.uiStore) {
				this.debugToolbar = result.uiStore.debugToolbar;
				this.sidePanel = result.uiStore.sidePanel;
				this.svg = result.uiStore.svg;
				this.toolbar = result.uiStore.toolbar;
				this.rainbowLayout.enabled =
					result.uiStore.rainbowLayout?.enabled ?? false;
				if (this.isActive) {
					this.rainbowLayout.css!.disabled = !this.rainbowLayout
						.enabled;
				}
				// Handle store breaking change
				if (result.uiStore.sidePanel.autoMove === undefined) {
					this.sidePanel.autoMove = false;
				}
			}
		} catch (error) {
			console.error(
				"Failed to load inspector state from storage:",
				error,
			);
		}
	}
}
