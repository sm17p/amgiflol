import { browser } from "wxt/browser";

class MessageBus {
	private static instance: MessageBus;
	private handlers: Map<App.MessageType | "*", Set<App.MessageHandler>> =
		new Map();
	private messageHistory: App.Message[] = [];
	private maxHistorySize = 100;

	private constructor() {
		this.setupMessageListeners();
	}

	public static getInstance(): MessageBus {
		if (!MessageBus.instance) {
			MessageBus.instance = new MessageBus();
		}
		return MessageBus.instance;
	}

	public subscribe<T>(
		type: App.MessageType | "*",
		handler: App.MessageHandler<T>,
	): () => void {
		if (!this.handlers.has(type)) {
			this.handlers.set(type, new Set());
		}

		this.handlers.get(type)!.add(handler);

		return () => {
			const handlers = this.handlers.get(type);
			if (handlers) {
				handlers.delete(handler);
				if (handlers.size === 0) {
					this.handlers.delete(type);
				}
			}
		};
	}

	public async send<T>(
		type: App.MessageType,
		payload: T,
		target: App.MessageRecipients = "all",
	): Promise<void> {
		const message: App.Message<T> = {
			type,
			payload,
			timestamp: Date.now(),
			source: this.getSource(),
			target,
		};

		this.addToHistory(message);

		try {
			switch (target) {
				case "popup":
					await this.sendToPopuporBackground(message);
					break;
				case "content":
					await this.sendToContent(message);
					break;
				case "background":
					await this.sendToPopuporBackground(message);
					break;
				case "all":
					await Promise.allSettled([
						this.sendToPopuporBackground(message),
						this.sendToContent(message),
					]);
					break;
			}
		} catch (error) {
			console.error(`Failed to send message of type ${type}:`, error);
		}

		this.handleMessage(message);
	}

	public broadcast<T>(type: App.MessageType, payload: T): Promise<void> {
		return this.send(type, payload, "all");
	}

	public getMessageHistory(): App.Message[] {
		return [...this.messageHistory];
	}

	public clearHistory(): void {
		this.messageHistory = [];
	}

	private setupMessageListeners(): void {
		if (browser.runtime?.onMessage) {
			browser.runtime.onMessage.addListener(
				(message, _sender, _sendResponse) => {
					if (this.isValidMessage(message)) {
						this.handleMessage(message);
					}
				},
			);
		}

		if (typeof window !== "undefined") {
			window.addEventListener("message", (event) => {
				if (
					event.source === window && this.isValidMessage(event.data)
				) {
					this.handleMessage(event.data);
				}
			});
		}
		if (browser.runtime?.connect) {
			browser.runtime.connect();
		}
	}

	private async sendToPopuporBackground<T>(
		message: App.Message<T>,
	): Promise<void> {
		if (browser.runtime?.sendMessage) {
			await browser.runtime.sendMessage(message);
		}
	}

	private async sendToContent<T>(message: App.Message<T>): Promise<void> {
		if (browser.tabs?.query && browser.tabs?.sendMessage) {
			const tabs = await browser.tabs.query({
				active: true,
				currentWindow: true,
			});
			if (tabs[0]?.id) {
				await browser.tabs.sendMessage(tabs[0].id, message);
			}
		}
	}

	private handleMessage<T>(message: App.Message<T>): void {
		const handlers = this.handlers.get(message.type);
		if (handlers) {
			handlers.forEach((handler) => {
				try {
					handler(message.payload, message);
				} catch (error) {
					console.error(
						`Error in message handler for ${message.type}:`,
						error,
					);
				}
			});
		}

		// Handle wildcard subscribers
		const wildcardHandlers = this.handlers.get("*");
		if (wildcardHandlers && message.type !== "*") {
			wildcardHandlers.forEach((handler) => {
				try {
					handler(message.payload, message);
				} catch (error) {
					console.error(
						`Error in wildcard message handler for ${message.type}:`,
						error,
					);
				}
			});
		}
	}

	private getSource(): App.Message["source"] {
		if (typeof window === "undefined") {
			return "background";
		}

		if (window.location.protocol === "chrome-extension:") {
			return "popup";
		}

		return "content";
	}

	private isValidMessage(data: any): data is App.Message {
		return (
			data &&
			typeof data === "object" &&
			typeof data.type === "string" &&
			typeof data.timestamp === "number" &&
			typeof data.source === "string" &&
			data.payload !== undefined
		);
	}

	private addToHistory(message: App.Message): void {
		this.messageHistory.push(message);
		if (this.messageHistory.length > this.maxHistorySize) {
			this.messageHistory.shift();
		}
	}
}

export const messageBus = MessageBus.getInstance();

export const createMessageHandler = <T>(
	type: App.MessageType | "*",
	handler: App.MessageHandler<T>,
): () => void => {
	return messageBus.subscribe(type, handler);
};

export const sendMessage = <T>(
	type: App.MessageType,
	payload: T,
	target?: App.MessageRecipients,
): Promise<void> => {
	return messageBus.send(type, payload, target);
};

export const broadcastMessage = <T>(
	type: App.MessageType,
	payload: T,
): Promise<void> => {
	return messageBus.broadcast(type, payload);
};
