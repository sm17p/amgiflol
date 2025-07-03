import { browser } from "wxt/browser";

export class UIStore implements App.UIStore {
	isActive = $state(false);
	debugToolbar = $state({
		isVisible: import.meta.env.DEV,
	});
	sidePanel = $state({
		isVisible: false,
		width: 300,
		selectedTab: "properties",
	});
	svg = $state({
		// TODO: Why error?
		mode: "mode" as App.Mode,
		showDistances: true,
		showGrid: false,
		showRulers: true,
		zoomLevel: 1,
	});
	// TODO: why explicit type declaration needed over here?
	toolbar = $state<App.UIStore["toolbar"]>({
		isVisible: true,
		position: { x: 20, y: 20 },
	});

	toggleToolbar() {
		this.toolbar.isVisible = !this.toolbar.isVisible;
	}

	setToolbarPosition(x: number, y: number) {
		this.toolbar.position.x = x;
		this.toolbar.position.y = y;
	}

	setActiveFeature(feature?: string) {
		this.toolbar.activeFeature = feature;
	}

	toggleSidePanel() {
		this.sidePanel.isVisible = !this.sidePanel.isVisible;
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

	toggleDistances() {
		this.svg.showDistances = !this.svg.showDistances;
	}

	toggleRulers() {
		this.svg.showRulers = !this.svg.showRulers;
	}

	setZoomLevel(zoom: number) {
		this.svg.zoomLevel = Math.max(0.1, Math.min(5, zoom));
	}

	async toggleActive() {
		this.isActive = !this.isActive;
		await this.syncToStorage();
		this.broadcastStateChange();
	}

	public snapshot(): App.UIStore {
		const snapshot = {
			isActive: this.isActive,
			debugToolbar: $state.snapshot(this.debugToolbar),
			sidePanel: $state.snapshot(this.sidePanel),
			svg: $state.snapshot(this.svg),
			toolbar: $state.snapshot(this.toolbar),
		};
		return snapshot;
	}

	private async syncToStorage() {
		try {
			const uiStore = this.snapshot();
			await browser.storage?.local.set({
				uiStore,
			});
		} catch (error) {
			console.error("Failed to sync inspector state to storage:", error);
		}
	}

	private broadcastStateChange() {
		const message = {
			action: "inspectorStateChange",
			state: $state.snapshot(this),
		};

		browser.runtime?.sendMessage?.(message);

		browser.tabs?.query({ active: true, currentWindow: true }).then(
			([tab]) => {
				if (tab?.id) {
					browser.tabs?.sendMessage(tab.id, message);
				}
			},
		);
	}

	async loadFromStorage() {
		try {
			const { host } = window.location;
			const result: {
				uiStore?: App.UIStore;
			} & { [host]: boolean;} = await browser.storage?.local.get([
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
			}
		} catch (error) {
			console.error(
				"Failed to load inspector state from storage:",
				error,
			);
		}
	}
}
