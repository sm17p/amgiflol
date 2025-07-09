import { elementInspector } from "@/lib/core/ElementInspector";
import { createMessageHandler } from "@/lib/core/MessageBus";
import { getContext } from "svelte";
import { MetaDataStore } from "./MetaDataStore.svelte";
import { watch } from 'runed';

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

		const metadataStoreStore = getContext<MetaDataStore>('metadataStore');

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
			() => [metadataStoreStore.scroll.scrollX, metadataStoreStore.scroll.scrollY, this.isLocked],
			([x, y, locked]) => {
				if (locked) {
					this.updateTrackerPosition();
				}
			},
			{
				lazy: true
			}
		)

		watch.pre(
			() => [metadataStoreStore.window.innerHeight, metadataStoreStore.window.innerWidth],
			([height, width]) => {
				if (height > 0 && width > 0) {
					this.updateTrackerPosition();
				}
			},
			{
				lazy: true
			}
		)
	}

	public toggleLock() {
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
		while (this.areSameSize(curr, parent)) {
			if (parent?.style.display === "contents") {
				parent = curr?.parentElement?.parentElement;
			} else {
				curr = parent;
				parent = curr?.parentElement;
			}
		}

		return parent ? parent : undefined;
	}

	private areSameSize(node?: HTMLElement | null, parent?: HTMLElement | null) {
		if (node == null || parent == null) {
			return false;
		}

		const sameWidth = node.clientWidth === parent.clientWidth;
		const sameHeight = node.clientHeight === parent.clientHeight;

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
				color: "#bbf451",
			},
			{
				type: "left",
				x1: element.x,
				y1: mouse.y,
				x2: parent.x,
				y2: mouse.y,
				distance: Math.round(element.x - parent.x),
				color: "#bbf451",
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
				color: "#bbf451",
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
				color: "#bbf451",
			},
		];
	}
}
