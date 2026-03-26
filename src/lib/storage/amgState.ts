import { browser } from "wxt/browser";

export const AMG_STATE_KEY = "amg-state";

const LEGACY_UI_STORE_KEY = "uiStore";
const LEGACY_PLATFORM_INFO_KEY = "platformInfo";
const LEGACY_ANALYTICS_ENABLED_KEY = "analytics-enabled";
const LEGACY_ANALYTICS_USER_ID_KEY = "amg-user-id-key";
const LEGACY_ANALYTICS_USER_PROPERTIES_KEY = "amg-user-properties-key";
const LEGACY_VOTE_PREFIX = "voting-";

type JsonRecord = Record<string, unknown>;

export interface AmgState {
	domains: Record<string, boolean>;
	uiStore?: App.UIStore;
	platformInfo?: App.MetaDataStore["platformInfo"];
	votes: Record<string, boolean>;
	analytics: {
		enabled?: boolean;
		userId?: string;
		userProperties?: Record<string, string>;
	};
}

type StorageWatchCallback<T> = (newValue: T, oldValue: T) => void;

function isObject(value: unknown): value is JsonRecord {
	return typeof value === "object" && value !== null;
}

function asBooleanRecord(value: unknown): Record<string, boolean> {
	if (!isObject(value)) return {};
	const result: Record<string, boolean> = {};
	for (const [key, fieldValue] of Object.entries(value)) {
		if (typeof fieldValue === "boolean") {
			result[key] = fieldValue;
		}
	}
	return result;
}

function asStringRecord(value: unknown): Record<string, string> {
	if (!isObject(value)) return {};
	const result: Record<string, string> = {};
	for (const [key, fieldValue] of Object.entries(value)) {
		if (typeof fieldValue === "string") result[key] = fieldValue;
	}
	return result;
}

function isUiStore(value: unknown): value is App.UIStore {
	if (!isObject(value)) return false;
	if (typeof value.isActive !== "boolean") return false;
	if (!isObject(value.debugToolbar) || typeof value.debugToolbar.isVisible !== "boolean") return false;
	if (
		!isObject(value.rainbowLayout) ||
		typeof value.rainbowLayout.enabled !== "boolean"
	) {
		return false;
	}
	if (
		!isObject(value.sidePanel) ||
		typeof value.sidePanel.autoMove !== "boolean" ||
		typeof value.sidePanel.isVisible !== "boolean" ||
		typeof value.sidePanel.width !== "number" ||
		typeof value.sidePanel.selectedTab !== "string"
	) {
		return false;
	}
	if (
		!isObject(value.svg) ||
		(value.svg.mode !== "inspect" && value.svg.mode !== "select" && value.svg.mode !== "measure") ||
		typeof value.svg.showDistances !== "boolean" ||
		typeof value.svg.showGrid !== "boolean" ||
		typeof value.svg.showRuler !== "boolean" ||
		typeof value.svg.zoomLevel !== "number"
	) {
		return false;
	}
	if (
		!isObject(value.toolbar) ||
		typeof value.toolbar.autoHide !== "boolean" ||
		typeof value.toolbar.autoMove !== "boolean" ||
		typeof value.toolbar.featureVotingVisible !== "boolean" ||
		typeof value.toolbar.isVisible !== "boolean" ||
		!isObject(value.toolbar.position) ||
		typeof value.toolbar.position.x !== "number" ||
		typeof value.toolbar.position.y !== "number" ||
		!isObject(value.toolbar.settings) ||
		typeof value.toolbar.settings.open !== "boolean"
	) {
		return false;
	}
	return true;
}

function parseState(value: unknown): AmgState {
	const state: AmgState = {
		analytics: {},
		domains: {},
		votes: {},
	};
	if (!isObject(value)) return state;
	state.domains = asBooleanRecord(value.domains);
	state.votes = asBooleanRecord(value.votes);
	if (isObject(value.analytics)) {
		const analytics = value.analytics;
		if (typeof analytics.enabled === "boolean") state.analytics.enabled = analytics.enabled;
		if (typeof analytics.userId === "string") state.analytics.userId = analytics.userId;
		if (isObject(analytics.userProperties)) {
			state.analytics.userProperties = asStringRecord(analytics.userProperties);
		}
	}
	if (isUiStore(value.uiStore)) state.uiStore = value.uiStore;
	if (isObject(value.platformInfo) && typeof value.platformInfo.os === "string") {
		state.platformInfo = { os: value.platformInfo.os };
	}
	return state;
}

async function getStorageSnapshot(): Promise<JsonRecord> {
	const snapshot = await browser.storage.local.get(null);
	return isObject(snapshot) ? snapshot : {};
}

export async function getAmgState(): Promise<AmgState> {
	const stateRecord = await browser.storage.local.get([AMG_STATE_KEY]);
	return parseState(stateRecord[AMG_STATE_KEY]);
}

export async function setAmgState(state: AmgState): Promise<void> {
	await browser.storage.local.set({
		[AMG_STATE_KEY]: state,
	});
}

export async function migrateLegacyState(): Promise<void> {
	const [storageSnapshot, existingState] = await Promise.all([
		getStorageSnapshot(),
		getAmgState(),
	]);
	const nextState: AmgState = {
		analytics: {
			...existingState.analytics,
		},
		domains: {
			...existingState.domains,
		},
		platformInfo: existingState.platformInfo,
		uiStore: existingState.uiStore,
		votes: {
			...existingState.votes,
		},
	};
	let changed = false;

	if (nextState.uiStore === undefined && isObject(storageSnapshot[LEGACY_UI_STORE_KEY])) {
		if (isUiStore(storageSnapshot[LEGACY_UI_STORE_KEY])) {
			nextState.uiStore = storageSnapshot[LEGACY_UI_STORE_KEY];
		}
		changed = true;
	}
	if (
		nextState.platformInfo === undefined &&
		isObject(storageSnapshot[LEGACY_PLATFORM_INFO_KEY]) &&
		typeof storageSnapshot[LEGACY_PLATFORM_INFO_KEY].os === "string"
	) {
		nextState.platformInfo = { os: storageSnapshot[LEGACY_PLATFORM_INFO_KEY].os };
		changed = true;
	}
	if (
		nextState.analytics.enabled === undefined &&
		typeof storageSnapshot[LEGACY_ANALYTICS_ENABLED_KEY] === "boolean"
	) {
		nextState.analytics.enabled = storageSnapshot[LEGACY_ANALYTICS_ENABLED_KEY];
		changed = true;
	}
	if (
		nextState.analytics.userId === undefined &&
		typeof storageSnapshot[LEGACY_ANALYTICS_USER_ID_KEY] === "string"
	) {
		nextState.analytics.userId = storageSnapshot[LEGACY_ANALYTICS_USER_ID_KEY];
		changed = true;
	}
	if (
		nextState.analytics.userProperties === undefined &&
		isObject(storageSnapshot[LEGACY_ANALYTICS_USER_PROPERTIES_KEY])
	) {
		nextState.analytics.userProperties = asStringRecord(
			storageSnapshot[LEGACY_ANALYTICS_USER_PROPERTIES_KEY],
		);
		changed = true;
	}

	for (const [key, value] of Object.entries(storageSnapshot)) {
		if (key.startsWith(LEGACY_VOTE_PREFIX) && typeof value === "boolean") {
			const featureKey = key.slice(LEGACY_VOTE_PREFIX.length);
			if (!(featureKey in nextState.votes)) {
				nextState.votes[featureKey] = value;
				changed = true;
			}
		}
	}

	if (changed) {
		await setAmgState(nextState);
	}
}

export async function getDomainActive(domain: string): Promise<boolean> {
	const state = await getAmgState();
	return Boolean(state.domains[domain]);
}

export async function setDomainActive(domain: string, isActive: boolean): Promise<void> {
	const state = await getAmgState();
	const nextState: AmgState = {
		...state,
		domains: {
			...state.domains,
			[domain]: isActive,
		},
	};
	await setAmgState(nextState);
}

export async function getUiStoreSnapshot(): Promise<App.UIStore | undefined> {
	const state = await getAmgState();
	if (state.uiStore) return state.uiStore;
	const legacy = await browser.storage.local.get([LEGACY_UI_STORE_KEY]);
	if (isUiStore(legacy[LEGACY_UI_STORE_KEY])) {
		const uiStore = legacy[LEGACY_UI_STORE_KEY];
		await setUiStoreSnapshot(uiStore);
		return uiStore;
	}
	return undefined;
}

export async function setUiStoreSnapshot(uiStore: App.UIStore): Promise<void> {
	const state = await getAmgState();
	const nextState: AmgState = {
		...state,
		uiStore,
	};
	await setAmgState(nextState);
}

export async function getPlatformInfoState(): Promise<App.MetaDataStore["platformInfo"] | undefined> {
	const state = await getAmgState();
	if (state.platformInfo) return state.platformInfo;
	const legacy = await browser.storage.local.get([LEGACY_PLATFORM_INFO_KEY]);
	const legacyPlatform = legacy[LEGACY_PLATFORM_INFO_KEY];
	if (isObject(legacyPlatform) && typeof legacyPlatform.os === "string") {
		const platformInfo = { os: legacyPlatform.os };
		await setPlatformInfoState(platformInfo);
		return platformInfo;
	}
	return undefined;
}

export async function setPlatformInfoState(platformInfo: App.MetaDataStore["platformInfo"]): Promise<void> {
	const state = await getAmgState();
	const nextState: AmgState = {
		...state,
		platformInfo: {
			os: platformInfo.os,
		},
	};
	await setAmgState(nextState);
}

export async function getVoteState(voteKey: string): Promise<boolean> {
	const state = await getAmgState();
	if (voteKey in state.votes) {
		return state.votes[voteKey];
	}
	const legacyKey = `${LEGACY_VOTE_PREFIX}${voteKey}`;
	const legacy = await browser.storage.local.get([legacyKey]);
	const legacyValue = legacy[legacyKey];
	if (typeof legacyValue === "boolean") {
		await setVoteState(voteKey, legacyValue);
		return legacyValue;
	}
	return false;
}

export async function setVoteState(voteKey: string, value: boolean): Promise<void> {
	const state = await getAmgState();
	const nextState: AmgState = {
		...state,
		votes: {
			...state.votes,
			[voteKey]: value,
		},
	};
	await setAmgState(nextState);
}

export async function getAnalyticsEnabledState(): Promise<boolean | undefined> {
	const state = await getAmgState();
	if (state.analytics.enabled !== undefined) return state.analytics.enabled;
	const legacy = await browser.storage.local.get([LEGACY_ANALYTICS_ENABLED_KEY]);
	const legacyValue = legacy[LEGACY_ANALYTICS_ENABLED_KEY];
	if (typeof legacyValue === "boolean") {
		await setAnalyticsEnabledState(legacyValue);
		return legacyValue;
	}
	return undefined;
}

export async function setAnalyticsEnabledState(value: boolean): Promise<void> {
	const state = await getAmgState();
	const nextState: AmgState = {
		...state,
		analytics: {
			...state.analytics,
			enabled: value,
		},
	};
	await setAmgState(nextState);
}

export async function getAnalyticsUserIdState(): Promise<string | undefined> {
	const state = await getAmgState();
	if (state.analytics.userId !== undefined) return state.analytics.userId;
	const legacy = await browser.storage.local.get([LEGACY_ANALYTICS_USER_ID_KEY]);
	const legacyValue = legacy[LEGACY_ANALYTICS_USER_ID_KEY];
	if (typeof legacyValue === "string") {
		await setAnalyticsUserIdState(legacyValue);
		return legacyValue;
	}
	return undefined;
}

export async function setAnalyticsUserIdState(value: string | undefined): Promise<void> {
	const state = await getAmgState();
	const nextState: AmgState = {
		...state,
		analytics: {
			...state.analytics,
			userId: value,
		},
	};
	await setAmgState(nextState);
}

export async function getAnalyticsUserPropertiesState(): Promise<Record<string, string>> {
	const state = await getAmgState();
	if (state.analytics.userProperties !== undefined) {
		return state.analytics.userProperties;
	}
	const legacy = await browser.storage.local.get([LEGACY_ANALYTICS_USER_PROPERTIES_KEY]);
	const legacyValue = legacy[LEGACY_ANALYTICS_USER_PROPERTIES_KEY];
	if (isObject(legacyValue)) {
		const userProperties = asStringRecord(legacyValue);
		await setAnalyticsUserPropertiesState(userProperties);
		return userProperties;
	}
	return {};
}

export async function setAnalyticsUserPropertiesState(value: Record<string, string>): Promise<void> {
	const state = await getAmgState();
	const nextState: AmgState = {
		...state,
		analytics: {
			...state.analytics,
			userProperties: value,
		},
	};
	await setAmgState(nextState);
}

function createStateBackedStorageItem<T>(options: {
	fallback: T;
	getter: () => Promise<T | undefined>;
	setter: (value: T) => Promise<void>;
	fromState: (state: AmgState) => T | undefined;
}): {
	getValue: () => Promise<T>;
	setValue: (value: T) => Promise<void>;
	watch: (callback: StorageWatchCallback<T>) => () => void;
} {
	const getValue = async () => {
		const currentValue = await options.getter();
		return currentValue === undefined ? options.fallback : currentValue;
	};
	const setValue = async (value: T) => {
		await options.setter(value);
	};
	const watch = (callback: StorageWatchCallback<T>) => {
		const listener = (changes: Record<string, { oldValue?: unknown; newValue?: unknown }>, areaName: string) => {
			if (areaName !== "local" || !(AMG_STATE_KEY in changes)) return;
			const oldState = parseState(changes[AMG_STATE_KEY].oldValue);
			const newState = parseState(changes[AMG_STATE_KEY].newValue);
			const oldValueFromState = options.fromState(oldState);
			const newValueFromState = options.fromState(newState);
			const oldValue = oldValueFromState === undefined ? options.fallback : oldValueFromState;
			const newValue = newValueFromState === undefined ? options.fallback : newValueFromState;
			if (oldValue !== newValue) callback(newValue, oldValue);
		};
		browser.storage.onChanged.addListener(listener);
		return () => browser.storage.onChanged.removeListener(listener);
	};
	return {
		getValue,
		setValue,
		watch,
	};
}

export function createAnalyticsEnabledStorageItem() {
	return createStateBackedStorageItem({
		fallback: true,
		getter: getAnalyticsEnabledState,
		setter: setAnalyticsEnabledState,
		fromState: (state) => state.analytics.enabled,
	});
}

export function createAnalyticsUserIdStorageItem() {
	const getValue = async () => {
		const existingValue = await getAnalyticsUserIdState();
		if (existingValue !== undefined) return existingValue;
		const generatedValue = crypto.randomUUID().toString();
		await setAnalyticsUserIdState(generatedValue);
		return generatedValue;
	};
	const setValue = async (value: string | undefined) => {
		await setAnalyticsUserIdState(value);
	};
	const watch = (callback: StorageWatchCallback<string | undefined>) => {
		const listener = (changes: Record<string, { oldValue?: unknown; newValue?: unknown }>, areaName: string) => {
			if (areaName !== "local" || !(AMG_STATE_KEY in changes)) return;
			const oldState = parseState(changes[AMG_STATE_KEY].oldValue);
			const newState = parseState(changes[AMG_STATE_KEY].newValue);
			if (oldState.analytics.userId !== newState.analytics.userId) {
				callback(newState.analytics.userId, oldState.analytics.userId);
			}
		};
		browser.storage.onChanged.addListener(listener);
		return () => browser.storage.onChanged.removeListener(listener);
	};
	return {
		getValue,
		setValue,
		watch,
	};
}

export function createAnalyticsUserPropertiesStorageItem() {
	return createStateBackedStorageItem({
		fallback: {},
		getter: getAnalyticsUserPropertiesState,
		setter: setAnalyticsUserPropertiesState,
		fromState: (state) => state.analytics.userProperties,
	});
}
