import { elementInspector } from "@/lib/core/ElementInspector";
import { createMessageHandler } from "@/lib/core/MessageBus";
import { watch } from "runed";
import { getContext } from "svelte";
import { MetaDataStore } from "./MetaDataStore.svelte";

export class TrackerState implements App.TrackerState {
	id: string;
	isLocked: boolean;
	isVisible: boolean;
	boundingRect = $state<DOMRect>();
	parentRect = $state<DOMRect>();
	element = $state<HTMLElement>();
	parentElement = $state<HTMLElement>();
	elementInfo = $state<App.ElementInfo>();
	elementStyles?: string;
	parentStyles?: string;
	lines?: App.Line[];
	lockedLines = $state<App.Line[]>([]);

	constructor(options: App.TrackerStateOptions) {
		this.id = $state(options.id ?? this.getId());
		this.isLocked = $state(options.isLocked);
		this.isVisible = $state(options.isVisible);
		this.parentStyles = $derived(this.getStyles(this.parentRect));
		this.elementStyles = $derived(this.getStyles(this.boundingRect));
		this.lines = $derived(
			this.getDistanceLines(this.boundingRect, this.parentRect),
		);

		const metadataStoreStore = getContext<MetaDataStore>("metadataStore");

		$effect(() => {
			const unsub = createMessageHandler(
				"ELEMENT_HOVER",
				(payload) => {
					if (!this.isLocked) {
						this.handleMouseenter(payload as MouseEvent);
					}
				},
			);
			return unsub;
		});

		watch.pre(
			() => [
				this.isLocked,
			],
			([locked]) => {
				this.updateLockedLines();
			},
			{
				lazy: true,
			},
		);

		watch.pre(
			() => [
				metadataStoreStore.scroll.scrollX,
				metadataStoreStore.scroll.scrollY,
				this.isLocked,
			],
			([x, y, locked]) => {
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
				metadataStoreStore.window.innerHeight,
				metadataStoreStore.window.innerWidth,
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
		analytics.track("toggle_inspector_lock", {
			value: this.isLocked.toString(),
		});
		this.isLocked = !this.isLocked;
	}

	public updateTrackerPosition() {
		if (
			this.element instanceof HTMLElement
		) {
			this.elementInfo = elementInspector.getElementInfo(this.element);
		}

		if (
			this.element instanceof HTMLElement &&
			this.parentElement instanceof HTMLElement
		) {
			this.boundingRect = this.element.getBoundingClientRect();
			this.parentRect = this.parentElement.getBoundingClientRect();
		}
	}

	private handleMouseenter(event: MouseEvent) {
		let { target } = event;

		if (
			!(target instanceof HTMLElement) ||
			elementInspector.isExtensionElement(target)
		) {
			return;
		}

		this.element = target;
		this.parentElement = this.findParent(target);
		this.updateTrackerPosition();
	}

	private findParent(node?: HTMLElement | null): HTMLElement | undefined {
		let curr = node;
		let parent = node?.parentElement;
		// console.log("###################");

		while (this.areSameSize(curr, parent)) {
			parent = parent?.parentElement;
		}

		// console.log("🚀 ~ TrackerState ~ findParent ~ parent:", curr, parent);
		// console.log("###################");

		return parent ? parent : undefined;
	}

	private areSameSize(
		node?: HTMLElement | null,
		parent?: HTMLElement | null,
	) {
		// console.log("🚀 ~ TrackerState ~ sameWidth:", node, parent);

		if (node == null || parent == null) {
			return false;
		}

		const sameWidth = node.offsetWidth === parent.offsetWidth;
		const sameHeight = node.offsetHeight === parent.offsetHeight;

		// console.log("🚀 ~ TrackerState ~ sameWidth:", parent.offsetWidth, node.offsetWidth, sameWidth);
		// console.log("🚀 ~ TrackerState ~ sameHeight:", parent.offsetHeight, node.offsetHeight, sameHeight);

		// display: contents element are 0 x 0
		return sameWidth && sameHeight || parent.style.display === "contents";
	}

	private getId() {
		return `tracker-${Date.now()}-${
			Math.random().toString(36).slice(2, 9)
		}`;
	}

	private getStyles(rects?: DOMRect): string {
		return `width: ${rects?.width}px; height: ${rects?.height}px; transform: translate(${rects?.x}px, ${rects?.y}px);`;
	}

	private updateLockedLines() {
		const element = this.boundingRect;
		const parent = this.parentRect;
		const metadataStore = getContext<MetaDataStore>("metadataStore");
		const window = metadataStore.window;

		if (this.isLocked && element && parent) {
			this.lockedLines = [
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
			];
		} else {
			this.lockedLines = [];
		}
	}

	private getDistanceLines(from?: DOMRect, to?: DOMRect): App.Line[] {
		if (!from || !to) return [];
		const metadataStore = getContext<MetaDataStore>("metadataStore");
		const mouse = metadataStore.mouse;

		const element = from;
		const parent = to;

		let x = this.isLocked ? (element.x + element.width / 2) : mouse.x;
		let y = this.isLocked ? (element.y + element.height / 2) : mouse.y;

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
					parent.x +
						parent.width -
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
					parent.y +
						parent.height -
						(element.y + element.height),
				),
				color: "#bbf451",
			},
		];

		return lines;
	}
}
