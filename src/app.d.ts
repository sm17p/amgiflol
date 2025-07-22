import { type AttributifyNames } from "@unocss/preset-attributify";
import { Component } from "svelte";

type Prefix = "amg-"; // change it to your prefix
type AttributifyAttributes = Partial<Record<AttributifyNames<Prefix>, string>>;

// declare module "svelte" {
// 	interface Component<Props extends AttributifyAttributes, Exports extends Record<string, any> = {}, Bindings extends keyof Props | "" = string> {}
// }

declare global {
	namespace App {
		interface ElementInfo {
			tagName: string;
			id: string;
			classes: string[];
			dimensions: {
				aspectRatio: string;
				height: number;
				width: number;
				x: number;
				y: number;
			};
			computedStyles: {
				backgroundColor: string;
				border: string;
				color: string;
				display: string;
				fontFamily: string;
				fontSize: string;
				lineHeight: string;
				lineHeightToFontSizeRatio: string;
				margin: string;
				padding: string;
				position: string;
				zIndex: string;
			};
			attributes: Record<string, string>;
		}

		interface TrackerState {
			boundingRect?: DOMRect;
			element?: HTMLElement;
			parentElement?: HTMLElement;
			elementInfo?: ElementInfo;
			id: string;
			isLocked: boolean;
			isVisible: boolean;
			parentRect?: DOMRect;
			elementStyles?: string;
			parentStyles?: string;
			lines?: Lines[];
		}

		interface MouseState {
			isPressed: boolean;
			modifiers: {
				alt: boolean;
				ctrl: boolean;
				shift: boolean;
			};
			x: number;
			y: number;
		}

		interface MetaDataStore {
			mouse: MouseState;
			scroll: {
				scrollX: number;
				scrollY: number;
			};
			window: {
				innerHeight: number;
				innerWidth: number;
			};
		}

		type Mode = "inspect" | "select" | "measure";

		interface UIStore {
			isActive: boolean;
			svg: {
				mode: Mode;
				showDistances: boolean;
				showGrid: boolean;
				showRuler: boolean;
				zoomLevel: number;
			};
			debugToolbar: {
				isVisible: boolean;
			};
			toolbar: {
				autoHide: boolean;
				autoMove: boolean;
				isVisible: boolean;
				featureVotingVisible: boolean;
				position: { x: number; y: number };
				activeFeature?: string;
				settings: {
					open: boolean;
				};
			};
			sidePanel: {
				autoMove: boolean;
				isVisible: boolean;
				width: number;
				selectedTab: string;
			};
		}

		interface Line {
			type?: string;
			x1: number;
			y1: number;
			x2: number;
			y2: number;
			distance: number;
			color: string;
		}

		interface TrackerStateOptions {
			id?: string;
			isLocked: boolean;
			isVisible: boolean;
		}

		type MessageType =
			| "EXTENSION_TOGGLE"
			| "ELEMENT_SELECT"
			| "ELEMENT_HOVER"
			| "TRACKER_CREATE"
			| "TRACKER_UPDATE"
			| "TRACKER_DELETE"
			| "TRACKER_LOCK"
			| "UI_UPDATE"
			| "SETTINGS_CHANGE"
			| "ZOOM_CHANGE"
			| "MODE_CHANGE"
			| "SCREENSHOT"
			| "VIEWPORT_RESIZE"
			| "KEYDOWN"
			| "*";

		type MessageRecipients = "popup" | "content" | "background" | "all";

		interface Message<T = any> {
			type: MessageType;
			payload: T;
			timestamp: number;
			source: Omit<MessageRecipients, "all">;
			target?: MessageRecipients;
		}

		interface MessageHandler<T = any> {
			(payload: T, message: Message<T>): void | Promise<void>;
		}

		interface ComponentOptions {
			id?: string;
			className?: string;
			container?: HTMLElement;
			zIndex?: number;
			visible?: boolean;
		}

		interface ComponentState {
			isVisible: boolean;
			isActive: boolean;
			isDestroyed: boolean;
			position: { x: number; y: number };
			size: { width: number; height: number };
		}
	}

	namespace svelteHTML {
		interface HTMLAttributes extends AttributifyAttributes {}
	}
}

declare module "wxt/utils/define-app-config" {
	export interface WxtAppConfig {
		version: string;
	}
}

export {};
