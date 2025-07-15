import { SvelteMap } from "svelte/reactivity";
import { createMessageHandler } from "../core/MessageBus";
import { TrackerState } from "./TrackerState.svelte";

export class TrackersStore {
	private _trackers = $state<SvelteMap<string, TrackerState>>(
		new SvelteMap(),
	);
	current = $state<TrackerState>();
	private _selectedTracker = $state<string | null>(null);
	private _hoveredTracker = $state<string | null>(null);

	constructor() {
		$effect(() => {
			const cleanup = createMessageHandler("KEYDOWN", this.handleKeyDown);
			return cleanup;
		});
	}

	handleKeyDown = (
		event: KeyboardEvent,
		_message: App.Message<KeyboardEvent>,
	) => {
		switch (event.key) {
			case "c":
			case "C":
				if (
					event.ctrlKey || (event.metaKey && event.shiftKey)
				) {
					this.clearAllTrackers();
				}
				break;
			case "@":
				if (event.shiftKey) {
					this.toggleCurrent();
				}
				break;
		}
	};

	toggleCurrent() {
		this.current?.toggleLock();
	}

	get trackers() {
		return this._trackers;
	}

	get selectedTracker() {
		return this._selectedTracker;
	}

	get hoveredTracker() {
		return this._hoveredTracker;
	}

	get activeTrackers() {
		return Array.from(this._trackers.values()).filter(
			(tracker) => tracker.isVisible,
		);
	}

	get lockedTrackers(): App.TrackerState[] {
		// return Array.from(this._trackers.values()).filter(
		// 	(tracker) => tracker.isLocked,
		// );
		return [];
	}

	createTracker(
		_element: HTMLElement,
		_elementInfo: App.ElementInfo,
	): string {
		const tracker = new TrackerState({
			isLocked: false,
			isVisible: true,
		});
		this._trackers.set(tracker.id, tracker);
		return tracker.id;
	}

	createCurrentTracker() {
		const tracker = new TrackerState({
			isLocked: false,
			isVisible: true,
		});
		this._trackers.set(tracker.id, tracker);
		this.current = tracker;
	}

	updateTracker(id: string, updates: Partial<App.TrackerState>) {
		const tracker = this._trackers.get(id);
		if (tracker) {
			Object.assign(tracker, updates);
		}
	}

	lockTracker(id: string) {
		const tracker = this._trackers.get(id);
		if (tracker) {
			tracker.isLocked = true;
		}
	}

	unlockTracker(id: string) {
		const tracker = this._trackers.get(id);
		if (tracker) {
			tracker.isLocked = false;
		}
	}

	deleteTracker(id: string) {
		this._trackers.delete(id);
		if (this._selectedTracker === id) {
			this._selectedTracker = null;
		}
		if (this._hoveredTracker === id) {
			this._hoveredTracker = null;
		}
	}

	selectTracker(id: string | null) {
		this._selectedTracker = id;
	}

	setHoveredTracker(id: string | null) {
		this._hoveredTracker = id;
	}

	clearAllTrackers() {
		this._trackers.clear();
		this._selectedTracker = null;
		this._hoveredTracker = null;
	}
}
