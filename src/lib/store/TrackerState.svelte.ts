import { elementInspector } from "@/lib/core/ElementInspector";
import { createMessageHandler } from "@/lib/core/MessageBus";
import { booleanToVote } from "@/utils/tracking";
import { watch } from "runed";
import { getContext } from "svelte";
import { MetaDataStore } from "./MetaDataStore.svelte";

export class TrackerState implements App.TrackerState {
	id: string;
	isLocked: boolean;
	isVisible: boolean;
	hoveredAltTarget = $state<App.TrackerTargetMetaData>();
	target = $state<App.TrackerTargetMetaData>();
	parentOfTarget = $state<App.TrackerTargetMetaData>();
	lines: App.Line[];
	lockedLines = $state<App.Line[]>([]);
	metadataStore: MetaDataStore;

	constructor(options: App.TrackerStateOptions) {
		this.id = $state(options.id ?? this.getId());
		this.isLocked = $state(options.isLocked);
		this.isVisible = $state(options.isVisible);
		this.metadataStore = getContext<MetaDataStore>("metadataStore");
		this.lines = $derived([
			...(this.parentOfTarget?.distanceLines ?? []),
			...(this.hoveredAltTarget?.distanceLines ?? []),
		]);

		$effect(() => {
			const unsub = createMessageHandler(
				"ELEMENT_HOVER",
				(payload) => {
					if (!this.isLocked) {
						this.handleMouseenter(payload as MouseEvent);
					} else if (
						this.isLocked &&
						this.metadataStore.keyboard.modifiers.alt
					) {
						this.addDistanceFromElem(payload as MouseEvent);
					}
				},
			);
			return unsub;
		});

		watch.pre(
			() => [
				this.metadataStore.mouse.y,
				this.metadataStore.mouse.x,
				this.isLocked,
			],
			() => {
				this.updateLines();
			},
			{
				lazy: true,
			},
		);

		watch.pre(
			() => [
				this.isLocked,
			],
			([_locked]) => {
				this.updateLockedLines();
			},
			{
				lazy: true,
			},
		);

		watch.pre(
			() => [
				this.metadataStore.scroll.scrollX,
				this.metadataStore.scroll.scrollY,
				this.isLocked,
			],
			([_x, _y, locked]) => {
				if (locked) {
					this.updateTrackerPosition();
				}
			},
			{
				lazy: true,
			},
		);

		watch.pre(
			() => [
				this.metadataStore.window.innerHeight,
				this.metadataStore.window.innerWidth,
			],
			([height, width]) => {
				if (height > 0 && width > 0) {
					this.updateTrackerPosition();
				}
			},
			{
				lazy: true,
			},
		);
	}

	public toggleLock() {
		this.isLocked = !this.isLocked;

		if (!this.isLocked) {
			this.hoveredAltTarget = undefined;
		}
		analytics.track("toggle_inspector_lock", {
			value: booleanToVote(this.isLocked),
		});
	}

	public updateTrackerPosition() {
		if (this.target?.domElement instanceof HTMLElement) {
			this.target = this.createTrackerTargetMetaData(
				this.target.domElement,
			);
		}

		if (this.parentOfTarget?.domElement instanceof HTMLElement) {
			this.parentOfTarget = this.createTrackerTargetMetaData(
				this.parentOfTarget.domElement,
			);
		}

		this.updateLines();
	}

	private createTrackerTargetMetaData(
		element: HTMLElement,
	): App.TrackerTargetMetaData {
		const properties = elementInspector.getElementInfo(element);
		const bounds = element.getBoundingClientRect();
		const overlayStyles = this.getStyles(bounds);

		return {
			bounds,
			domElement: element,
			properties,
			overlayStyles,
			distanceLines: [],
		};
	}

	private handleMouseenter(event: MouseEvent) {
		let { target } = event;

		if (
			!(target instanceof HTMLElement) ||
			elementInspector.isExtensionElement(target)
		) {
			return;
		}

		this.target = this.createTrackerTargetMetaData(target);

		const parentElement = elementInspector.moveUp(target);
		if (parentElement) {
			this.parentOfTarget = this.createTrackerTargetMetaData(
				parentElement,
			);
		}

		this.updateTrackerPosition();
	}

	private addDistanceFromElem(event: MouseEvent) {
		let { target } = event;

		if (
			!(target instanceof HTMLElement) ||
			elementInspector.isExtensionElement(target) ||
			target === this.target?.domElement ||
			target === this.parentOfTarget?.domElement
		) {
			return;
		}

		this.hoveredAltTarget = this.createTrackerTargetMetaData(target);
		this.updateLines();
	}

	private getId() {
		return `tracker-${Date.now()}-${
			Math.random().toString(36).slice(2, 9)
		}`;
	}

	private getStyles(rects?: DOMRect): string {
		return `width: ${rects?.width}px; height: ${rects?.height}px; transform: translate(${rects?.x}px, ${rects?.y}px);`;
	}

	private updateLines() {
		if (!this.isLocked && this.target && this.parentOfTarget) {
			this.parentOfTarget.distanceLines = this.setDistanceLines(
				this.target,
				this.parentOfTarget,
				!this.isLocked,
			);
		}

		if (
			this.isLocked && this.target && this.hoveredAltTarget &&
			this.metadataStore.keyboard.modifiers.alt
		) {
			this.hoveredAltTarget.distanceLines = this.setDistanceLines(
				this.target,
				this.hoveredAltTarget,
				true,
			);
		}
	}

	private updateLockedLines() {
		const window = this.metadataStore.window;
		let lines: App.Line[] = [];

		if (this.isLocked && this.target && this.parentOfTarget) {
			const element = this.target.bounds;
			const parent = this.parentOfTarget.bounds;
			lines.push(
				...this.setDistanceLines(this.target, this.parentOfTarget),
			);

			lines.push(
				{
					x1: 0,
					y1: parent.top,
					x2: window.innerWidth,
					y2: parent.top,
					distance: -1,
					color: "#bbf451",
				},
				{
					x1: 0,
					y1: element.top,
					x2: window.innerWidth,
					y2: element.top,
					distance: -1,
					color: "#bbf451",
				},
				{
					x1: parent.left,
					y1: 0,
					x2: parent.left,
					y2: window.innerHeight,
					distance: -1,
					color: "#bbf451",
				},
				{
					x1: element.left,
					y1: 0,
					x2: element.left,
					y2: window.innerHeight,
					distance: -1,
					color: "#bbf451",
				},
				{
					x1: parent.right,
					y1: 0,
					x2: parent.right,
					y2: window.innerHeight,
					distance: -1,
					color: "#bbf451",
				},
				{
					x1: element.right,
					y1: 0,
					x2: element.right,
					y2: window.innerHeight,
					distance: -1,
					color: "#bbf451",
				},
				{
					x1: 0,
					y1: parent.bottom,
					x2: window.innerWidth,
					y2: parent.bottom,
					distance: -1,
					color: "#bbf451",
				},
				{
					x1: 0,
					y1: element.bottom,
					x2: window.innerWidth,
					y2: element.bottom,
					distance: -1,
					color: "#bbf451",
				},
			);
		}

		this.lockedLines = lines;
	}

	private setDistanceLines(
		from?: App.TrackerTargetMetaData,
		to?: App.TrackerTargetMetaData,
		stickToMouse: boolean = false,
	): App.Line[] {
		if (!from || !to) return [];

		const mouse = this.metadataStore.mouse;
		const isContaining = from.domElement.contains(to.domElement) ||
			to.domElement.contains(from.domElement);
		const element = from.bounds;
		const parent = to.bounds;

		let x = !stickToMouse ? (element.x + element.width / 2) : mouse.x;
		let y = !stickToMouse ? (element.y + element.height / 2) : mouse.y;

		if (isContaining) {
			// For containing elements, show distances from all boundaries
			let lines: App.Line[] = [
				{
					type: "top",
					x1: x,
					y1: element.y,
					x2: x,
					y2: parent.y,
					distance: Math.round(element.y - parent.y),
					color: "#bbf451",
				},
				{
					type: "left",
					x1: element.x,
					y1: y,
					x2: parent.x,
					y2: y,
					distance: Math.round(element.x - parent.x),
					color: "#bbf451",
				},
				{
					type: "right",
					x1: element.x + element.width,
					y1: y,
					x2: parent.x + parent.width,
					y2: y,
					distance: Math.round(
						parent.x + parent.width -
							(element.x + element.width),
					),
					color: "#bbf451",
				},
				{
					type: "bottom",
					x1: x,
					y1: element.y + element.height,
					x2: x,
					y2: parent.y + parent.height,
					distance: Math.round(
						parent.y + parent.height -
							(element.y + element.height),
					),
					color: "#bbf451",
				},
			];
			return lines;
		} else {
			// For non-containing elements, show nearest x and y distances
			let lines: App.Line[] = [];

			// Calculate nearest X distance
			let nearestXDistance: number;
			let xLine: App.Line;

			if (element.x + element.width < parent.x) {
				// Element is to the left of parent
				nearestXDistance = parent.x - (element.x + element.width);
				xLine = {
					type: "right",
					x1: element.x + element.width,
					y1: y,
					x2: parent.x,
					y2: y,
					distance: Math.round(nearestXDistance),
					color: "#bbf451",
				};
			} else if (element.x > parent.x + parent.width) {
				// Element is to the right of parent
				nearestXDistance = element.x - (parent.x + parent.width);
				xLine = {
					type: "left",
					x1: element.x,
					y1: y,
					x2: parent.x + parent.width,
					y2: y,
					distance: Math.round(nearestXDistance),
					color: "#bbf451",
				};
			} else {
				// Elements overlap horizontally - show distance to nearest edge
				const leftDistance = Math.abs(element.x - parent.x);
				const rightDistance = Math.abs(
					(element.x + element.width) - (parent.x + parent.width),
				);

				if (leftDistance <= rightDistance) {
					xLine = {
						type: "left",
						x1: element.x,
						y1: y,
						x2: parent.x,
						y2: y,
						distance: Math.round(leftDistance),
						color: "#bbf451",
					};
				} else {
					xLine = {
						type: "right",
						x1: element.x + element.width,
						y1: y,
						x2: parent.x + parent.width,
						y2: y,
						distance: Math.round(rightDistance),
						color: "#bbf451",
					};
				}
			}

			// Calculate nearest Y distance
			let nearestYDistance: number;
			let yLine: App.Line;

			if (element.y + element.height < parent.y) {
				// Element is above parent
				nearestYDistance = parent.y - (element.y + element.height);
				yLine = {
					type: "bottom",
					x1: x,
					y1: element.y + element.height,
					x2: x,
					y2: parent.y,
					distance: Math.round(nearestYDistance),
					color: "#bbf451",
				};
			} else if (element.y > parent.y + parent.height) {
				// Element is below parent
				nearestYDistance = element.y - (parent.y + parent.height);
				yLine = {
					type: "top",
					x1: x,
					y1: element.y,
					x2: x,
					y2: parent.y + parent.height,
					distance: Math.round(nearestYDistance),
					color: "#bbf451",
				};
			} else {
				// Elements overlap vertically - show distance to nearest edge
				const topDistance = Math.abs(element.y - parent.y);
				const bottomDistance = Math.abs(
					(element.y + element.height) - (parent.y + parent.height),
				);

				if (topDistance <= bottomDistance) {
					yLine = {
						type: "top",
						x1: x,
						y1: element.y,
						x2: x,
						y2: parent.y,
						distance: Math.round(topDistance),
						color: "#bbf451",
					};
				} else {
					yLine = {
						type: "bottom",
						x1: x,
						y1: element.y + element.height,
						x2: x,
						y2: parent.y + parent.height,
						distance: Math.round(bottomDistance),
						color: "#bbf451",
					};
				}
			}

			lines.push(xLine, yLine);
			return lines;
		}
	}
}
