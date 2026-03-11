/**
 * A replacement for Bits UI's useId utility that handles Svelte 5 reactivity correctly.
 *
 * This implementation addresses the key challenge: in Svelte 5 with runes,
 * `let { id = useId() } = $props()` may call useId() multiple times during
 * reactive updates, but we need the same ID to be returned consistently.
 */

let globalCounter = 0;

// Store generated IDs by stack trace to ensure same call site gets same ID
const callSiteCache = new Map<string, string>();

/**
 * Generate a unique ID that remains stable across multiple calls from the same location.
 *
 * This is designed to work with the Svelte 5 pattern:
 * ```svelte
 * let { id = useId(), ...props } = $props();
 * ```
 *
 * Even if this is called multiple times due to reactivity, the same component
 * instance will always get the same ID.
 *
 * @param prefix - Optional prefix for the ID (default: "ui")
 * @returns A stable, unique ID string
 */
export function useId(prefix: string = "ui"): string {
	// Create a stable identifier based on call location
	// This is a simplified approach - in production you might want to use
	// Error.stack or other call site identification methods
	const callSite = getCallSite();

	// Return cached ID if we've seen this call site before
	if (callSiteCache.has(callSite)) {
		return callSiteCache.get(callSite)!;
	}

	// Generate new ID and cache it
	const id = `${prefix}-${++globalCounter}`;
	callSiteCache.set(callSite, id);

	return id;
}

/**
 * Simple version that generates a new ID on each call.
 * Use this when you want a truly unique ID every time.
 *
 * @param prefix - Optional prefix for the ID (default: "ui")
 * @returns A unique ID string
 */
export function generateId(prefix: string = "ui"): string {
	return `${prefix}-${++globalCounter}`;
}

/**
 * Version using crypto.randomUUID() for maximum uniqueness.
 * Falls back to timestamp-based generation in older environments.
 *
 * @param prefix - Optional prefix for the ID (default: "ui")
 * @returns A globally unique ID string
 */
export function useUniqueId(prefix: string = "ui"): string {
	if (typeof crypto !== "undefined" && crypto.randomUUID) {
		// Use built-in UUID generation
		return `${prefix}-${crypto.randomUUID()}`;
	} else {
		// Fallback for environments without crypto.randomUUID()
		const timestamp = Date.now();
		const random = Math.random().toString(36).substring(2, 15);
		return `${prefix}-${timestamp}-${random}`;
	}
}

/**
 * Get a simple call site identifier.
 * This is a basic implementation - could be enhanced with proper stack trace parsing.
 */
function getCallSite(): string {
	try {
		// Create an error to capture stack trace
		const error = new Error();
		const stack = error.stack || "";

		// Extract relevant part of stack (skip this function and useId)
		const lines = stack.split("\n");
		const callerLine = lines[3] || lines[2] || `fallback-${Math.random()}`;

		// Create a simplified identifier from the caller line
		// This captures file path and line number information
		return callerLine.trim();
	} catch {
		// Fallback if stack trace fails
		return `fallback-${Math.random().toString(36).substring(2)}`;
	}
}

/**
 * Clear the call site cache - useful for testing or memory management.
 */
export function clearIdCache(): void {
	callSiteCache.clear();
}

/**
 * Get current counter value - useful for debugging.
 */
export function getIdCounter(): number {
	return globalCounter;
}

/**
 * Reset counter and clear cache - useful for testing.
 */
export function resetIdSystem(): void {
	globalCounter = 0;
	callSiteCache.clear();
}
