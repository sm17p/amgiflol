import { SvelteMap } from "svelte/reactivity";
import { TrackerState } from "./TrackerState.svelte";

export class TrackersStore {
	private _trackers = $state<SvelteMap<string, TrackerState>>(
		new SvelteMap(),
	);
	current = $state<TrackerState>();
	private _selectedTracker = $state<string | null>(null);
	private _hoveredTracker = $state<string | null>(null);

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

	get lockedTrackers() {
		return Array.from(this._trackers.values()).filter(
			(tracker) => tracker.isLocked,
		);
	}

	createTracker(
		_element: HTMLElement,
		_elementInfo: App.ElementInfo,
	): string {
		const tracker: App.TrackerState = new TrackerState({
			isLocked: false,
			isVisible: true,
		});
		this._trackers.set(tracker.id, tracker);
		return tracker.id;
	}

	createCurrentTracker() {
		const tracker: App.TrackerState = new TrackerState({
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
