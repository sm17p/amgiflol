import { elementInspector } from "@/lib/core/ElementInspector";
import { createMessageHandler } from "@/lib/core/MessageBus";
import { getContext } from "svelte";
import type { MetaDataStore } from "./MetaDataStore.svelte";

export class TrackerState implements App.TrackerState {
	id: string;
	isLocked: boolean;
	isVisible: boolean;
	boundingRect = $state<DOMRect>();
	parentRect = $state<DOMRect>();
	element = $state<HTMLElement>();
	elementInfo = $state<App.ElementInfo>();
	elementStyles?: string;
	parentStyles?: string;
	lines?: App.Lines[];

	constructor(options: App.TrackerStateOptions) {
		this.id = $state(options.id ?? this.getId());
		this.isLocked = $state(options.isLocked);
		this.isVisible = $state(options.isVisible);
		this.parentStyles = $derived(this.getStyles(this.parentRect));
		this.elementStyles = $derived(this.getStyles(this.boundingRect));
		this.lines = $derived(
			this.getDistanceLines(this.boundingRect, this.parentRect),
		);

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
	}

	public toggleLock() {
		this.isLocked = !this.isLocked;
	}

	private handleMouseenter(event: MouseEvent) {
		let { target } = event;

		if (
			!(target instanceof HTMLElement) ||
			elementInspector.isExtensionElement(target)
		) {
			return;
		}

		let parentElem = this.findParent(target);

		if (
			target instanceof HTMLElement &&
			parentElem instanceof HTMLElement
		) {
			this.boundingRect = target.getBoundingClientRect();
			this.parentRect = parentElem.getBoundingClientRect();
		}

		this.element = target;
		this.elementInfo = elementInspector.getElementInfo(target);
	}

	private findParent(node?: Element | null): Element | null | undefined {
		let curr = node;
		let parent = node?.parentElement;
		while (this.areSameSize(curr, parent)) {
			curr = parent;
			parent = curr?.parentElement;
		}

		return parent;
	}

	private areSameSize(node?: Element | null, parent?: Element | null) {
		if (!node || !parent) {
			return false;
		}

		const sameWidth = node.clientWidth === parent.clientWidth;
		const sameHeight = node.clientHeight === parent.clientHeight;

		return sameWidth && sameHeight;
	}

	private getId() {
		return `tracker-${Date.now()}-${
			Math.random().toString(36).slice(2, 9)
		}`;
	}

	private getStyles(rects?: DOMRect): string {
		return `width: ${rects?.width}px; height: ${rects?.height}px; transform: translate(${rects?.x}px, ${rects?.y}px);`;
	}

	private getDistanceLines(from?: DOMRect, to?: DOMRect): App.Lines[] {
		if (!from || !to) return [];
		const metadataStore = getContext<MetaDataStore>("metadataStore");
		const mouse = metadataStore.mouse;

		const element = from;
		const parent = to;

		return [
			{
				type: "top",
				x1: mouse.x,
				y1: element.y,
				x2: mouse.x,
				y2: parent.y,
				distance: Math.round(element.y - parent.y),
				color: "#ef4444",
			},
			{
				type: "left",
				x1: element.x,
				y1: mouse.y,
				x2: parent.x,
				y2: mouse.y,
				distance: Math.round(element.x - parent.x),
				color: "#ef4444",
			},
			{
				type: "right",
				x1: element.x + element.width,
				y1: mouse.y,
				x2: parent.x + parent.width,
				y2: mouse.y,
				distance: Math.round(
					parent.x +
						parent.width -
						(element.x + element.width),
				),
				color: "#10b981",
			},
			{
				type: "bottom",
				x1: mouse.x,
				y1: element.y + element.height,
				x2: mouse.x,
				y2: parent.y + parent.height,
				distance: Math.round(
					parent.y +
						parent.height -
						(element.y + element.height),
				),
				color: "#10b981",
			},
		];
	}
}
