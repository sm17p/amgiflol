export class ElementInspector {
	private static instance: ElementInspector;
	private zoomLevel: number = 1;

	private constructor() {}

	public static getInstance(): ElementInspector {
		if (!ElementInspector.instance) {
			ElementInspector.instance = new ElementInspector();
		}
		return ElementInspector.instance;
	}

	public setZoomLevel(zoom: number): void {
		this.zoomLevel = zoom;
	}

	public getElementInfo(element: HTMLElement): App.ElementInfo {
		const rect = element.getBoundingClientRect();
		const computedStyle = window.getComputedStyle(element);

		return {
			tagName: element.tagName.toLowerCase(),
			id: element.id || "",
			classes: Array.from(element.classList),
			dimensions: this.extractDimensions(element, rect),
			computedStyles: this.extractComputedStyles(computedStyle),
			attributes: this.extractAttributes(element),
		};
	}

	public findParentElement(element: HTMLElement): HTMLElement | null {
		let current = element;
		let parent = element.parentElement;
		let safetyCounter = 20;

		while (parent && safetyCounter > 0) {
			if (!this.areSameSize(current, parent)) {
				return parent;
			}
			current = parent;
			parent = current.parentElement;
			safetyCounter--;
		}

		return parent;
	}

	public isExtensionElement(element: HTMLElement): boolean {
		if (!element) return false;

		return (
			element.closest("[data-wxt-integrated]") !== null ||
			element.id?.startsWith("amgiflol-") ||
			element.className?.includes("amgiflol")
		);
	}

	public getElementPath(element: HTMLElement): string[] {
		const path: string[] = [];
		let current: HTMLElement | null = element;

		while (current && current !== document.body) {
			let selector = current.tagName.toLowerCase();

			if (current.id) {
				selector += `#${current.id}`;
			}

			if (current.className) {
				const classes = Array.from(current.classList)
					.filter((cls) => cls.trim())
					.join(".");
				if (classes) {
					selector += `.${classes}`;
				}
			}

			const siblings = Array.from(current.parentElement?.children || []);
			const sameTagSiblings = siblings.filter(
				(sibling) => sibling.tagName === current!.tagName,
			);

			if (sameTagSiblings.length > 1) {
				const index = sameTagSiblings.indexOf(current) + 1;
				selector += `:nth-of-type(${index})`;
			}

			path.unshift(selector);
			current = current.parentElement;
		}

		return path;
	}

	public calculateDistance(
		rect1: DOMRect,
		rect2: DOMRect,
		type: "horizontal" | "vertical" = "horizontal",
	): number {
		const distance = type === "horizontal"
			? Math.abs(rect1.x - rect2.x)
			: Math.abs(rect1.y - rect2.y);

		return Math.round(distance / this.zoomLevel);
	}

	public isElementVisible(element: HTMLElement): boolean {
		const rect = element.getBoundingClientRect();
		const computedStyle = window.getComputedStyle(element);

		return !!(
			rect.width &&
			rect.height &&
			computedStyle.visibility !== "hidden" &&
			computedStyle.display !== "none" &&
			parseFloat(computedStyle.opacity) > 0
		);
	}

	public getElementAtPoint(x: number, y: number): HTMLElement | null {
		const elements = document.elementsFromPoint(x, y);
		return (
			(elements.find((el) => el instanceof HTMLElement) as HTMLElement) ||
			null
		);
	}

	private extractDimensions(element: HTMLElement, rect: DOMRect) {
		const width = Math.round(rect.width / this.zoomLevel);
		const height = Math.round(rect.height / this.zoomLevel);

		return {
			width,
			height,
			aspectRatio: this.calculateAspectRatio(width, height),
			x: Math.round(rect.x / this.zoomLevel),
			y: Math.round(rect.y / this.zoomLevel),
		};
	}

	private extractComputedStyles(computedStyle: CSSStyleDeclaration) {
		const fontSize = computedStyle.fontSize;
		const lineHeight = computedStyle.lineHeight;

		return {
			fontSize,
			lineHeight,
			fontFamily: computedStyle.fontFamily,
			color: computedStyle.color,
			backgroundColor: computedStyle.backgroundColor,
			margin: this.formatBoxModel(computedStyle, "margin"),
			padding: this.formatBoxModel(computedStyle, "padding"),
			border: this.formatBoxModel(computedStyle, "border"),
			display: computedStyle.display,
			position: computedStyle.position,
			zIndex: computedStyle.zIndex,
			lineHeightToFontSizeRatio: this.calculateLineHeightRatio(
				fontSize,
				lineHeight,
			),
		};
	}

	private extractAttributes(element: HTMLElement): Record<string, string> {
		const attributes: Record<string, string> = {};

		for (const attr of element.attributes) {
			attributes[attr.name] = attr.value;
		}

		return attributes;
	}

	private calculateAspectRatio(width: number, height: number): string {
		if (width <= 0 || height <= 0) return "N/A";

		const gcd = this.greatestCommonDivisor(width, height);
		const ratioWidth = width / gcd;
		const ratioHeight = height / gcd;

		return `${ratioWidth}:${ratioHeight}`;
	}

	private calculateLineHeightRatio(
		fontSize: string,
		lineHeight: string,
	): string {
		const fontSizeValue = parseFloat(fontSize);
		const lineHeightValue = parseFloat(lineHeight);

		if (isNaN(fontSizeValue) || fontSizeValue <= 0) return "N/A";

		if (lineHeight === "normal") {
			return "normal (≈1.2)";
		}

		if (isNaN(lineHeightValue) || lineHeightValue <= 0) return "N/A";

		const ratio = lineHeightValue / fontSizeValue;
		return ratio.toFixed(2);
	}

	private formatBoxModel(
		computedStyle: CSSStyleDeclaration,
		property: "margin" | "padding" | "border",
	): string {
		const top = computedStyle.getPropertyValue(`${property}-top`);
		const right = computedStyle.getPropertyValue(`${property}-right`);
		const bottom = computedStyle.getPropertyValue(`${property}-bottom`);
		const left = computedStyle.getPropertyValue(`${property}-left`);

		if (property === "border") {
			const width = computedStyle.getPropertyValue("border-width");
			const style = computedStyle.getPropertyValue("border-style");
			const color = computedStyle.getPropertyValue("border-color");
			return `${width} ${style} ${color}`;
		}

		if (top === right && right === bottom && bottom === left) {
			return top;
		}

		if (top === bottom && left === right) {
			return `${top} ${right}`;
		}

		return `${top} ${right} ${bottom} ${left}`;
	}

	private areSameSize(element: Element, parent: Element): boolean {
		const elementRect = element.getBoundingClientRect();
		const parentRect = parent.getBoundingClientRect();

		const widthDiff = Math.abs(elementRect.width - parentRect.width);
		const heightDiff = Math.abs(elementRect.height - parentRect.height);

		return widthDiff < 2 && heightDiff < 2;
	}

	private greatestCommonDivisor(a: number, b: number): number {
		return b === 0 ? a : this.greatestCommonDivisor(b, a % b);
	}
}

export const elementInspector = ElementInspector.getInstance();
