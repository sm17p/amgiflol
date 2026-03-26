import { watch } from "runed";

import { CONTENT, createMessageHandler, sendMessage } from "@/lib/core/MessageBus";
import rainbowLayoutCss from "@/lib/css/rainbow-translucent.css?raw";
import { getDomainActive, getUiStoreSnapshot, setDomainActive, setUiStoreSnapshot } from "@/lib/storage/amgState";
import { booleanToVote } from "@/utils/tracking";

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
	svg = $state<App.UIStore["svg"]>({
		mode: "inspect",
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

		// https://bugzilla.mozilla.org/show_bug.cgi?id=1751346
		// https://bugzilla.mozilla.org/show_bug.cgi?id=1817675
		// https://bugzilla.mozilla.org/show_bug.cgi?id=1928865
		if (!import.meta.env.FIREFOX) {
			document.adoptedStyleSheets.push(this.rainbowLayout.css!);
		}

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
				this.syncToStorage(CONTENT);
			},
			{
				lazy: true,
			},
		);
	}

	handleKeyDown = (event: KeyboardEvent, _message: App.Message<KeyboardEvent>) => {
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
		if (!import.meta.env.DEV && import.meta.env.FIREFOX) return;
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
		this.debugToolbar.isVisible = !this.debugToolbar.isVisible;
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
		if (from.content) {
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
			let persistDomain = Promise.resolve();
			if (from.content) {
				const { host } = window.location;
				persistDomain = setDomainActive(host, this.isActive);
			}
			const uiStore = this.snapshot();
			await Promise.all([setUiStoreSnapshot(uiStore), persistDomain]);
		} catch (error) {
			console.error("Failed to sync inspector state to storage:", error);
		}
	}

	private broadcastStateChange() {
		void sendMessage("EXTENSION_TOGGLE", {
			isActive: this.isActive,
			timestamp: Date.now(),
		});
	}

	async loadFromStorage() {
		try {
			const { host } = window.location;
			this.isActive = await getDomainActive(host);
			const uiStore = await getUiStoreSnapshot();

			if (uiStore) {
				if (
					typeof uiStore.debugToolbar === "object" &&
					uiStore.debugToolbar &&
					typeof uiStore.debugToolbar.isVisible === "boolean"
				) {
					this.debugToolbar = {
						isVisible: uiStore.debugToolbar.isVisible,
					};
				}
				if (typeof uiStore.sidePanel === "object" && uiStore.sidePanel) {
					const sidePanel = uiStore.sidePanel;
					if (
						typeof sidePanel.autoMove === "boolean" &&
						typeof sidePanel.isVisible === "boolean" &&
						typeof sidePanel.selectedTab === "string" &&
						typeof sidePanel.width === "number"
					) {
						this.sidePanel = {
							autoMove: sidePanel.autoMove,
							isVisible: sidePanel.isVisible,
							selectedTab: sidePanel.selectedTab,
							width: sidePanel.width,
						};
					}
				}
				if (typeof uiStore.svg === "object" && uiStore.svg) {
					const svg = uiStore.svg;
					if (
						(svg.mode === "inspect" || svg.mode === "select" || svg.mode === "measure") &&
						typeof svg.showDistances === "boolean" &&
						typeof svg.showGrid === "boolean" &&
						typeof svg.showRuler === "boolean" &&
						typeof svg.zoomLevel === "number"
					) {
						this.svg = {
							mode: svg.mode,
							showDistances: svg.showDistances,
							showGrid: svg.showGrid,
							showRuler: svg.showRuler,
							zoomLevel: svg.zoomLevel,
						};
					}
				}
				if (typeof uiStore.toolbar === "object" && uiStore.toolbar) {
					const toolbar = uiStore.toolbar;
					if (
						typeof toolbar.autoHide === "boolean" &&
						typeof toolbar.autoMove === "boolean" &&
						typeof toolbar.featureVotingVisible === "boolean" &&
						typeof toolbar.isVisible === "boolean" &&
						typeof toolbar.position === "object" &&
						toolbar.position &&
						typeof toolbar.position.x === "number" &&
						typeof toolbar.position.y === "number" &&
						typeof toolbar.settings === "object" &&
						toolbar.settings &&
						typeof toolbar.settings.open === "boolean"
					) {
						this.toolbar = {
							activeFeature:
								typeof toolbar.activeFeature === "string" ? toolbar.activeFeature : undefined,
							autoHide: toolbar.autoHide,
							autoMove: toolbar.autoMove,
							featureVotingVisible: toolbar.featureVotingVisible,
							isVisible: toolbar.isVisible,
							position: {
								x: toolbar.position.x,
								y: toolbar.position.y,
							},
							settings: {
								open: toolbar.settings.open,
							},
						};
					}
				}
				const rainbowLayout = uiStore.rainbowLayout;
				if (
					typeof rainbowLayout === "object" &&
					rainbowLayout &&
					typeof rainbowLayout.enabled === "boolean"
				) {
					this.rainbowLayout.enabled = rainbowLayout.enabled;
				}
				if (this.isActive) {
					this.rainbowLayout.css!.disabled = !this.rainbowLayout.enabled;
				}
				if (this.sidePanel.autoMove === undefined) {
					this.sidePanel.autoMove = false;
				}
			}
		} catch (error) {
			console.error("Failed to load inspector state from storage:", error);
		}
	}
}
