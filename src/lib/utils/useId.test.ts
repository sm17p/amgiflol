/**
 * Test file for useId utility to verify it works correctly with Svelte 5 patterns
 */

import {
	// clearIdCache,
	generateId,
	getIdCounter,
	resetIdSystem,
	useId,
	useUniqueId,
} from "./useId.js";

function runTests() {
	console.log("🧪 Running useId tests...\n");

	// Reset before tests
	resetIdSystem();

	// Test 1: Basic ID generation
	console.log("Test 1: Basic ID generation");
	const id1 = useId();
	const id2 = useId();
	console.log(`First ID: ${id1}`);
	console.log(`Second ID: ${id2}`);
	console.log(`IDs are different: ${id1 !== id2 ? "✅" : "❌"}\n`);

	// Test 2: Custom prefix
	console.log("Test 2: Custom prefix");
	const prefixedId = useId("custom");
	console.log(`Prefixed ID: ${prefixedId}`);
	console.log(`Has custom prefix: ${prefixedId.startsWith("custom-") ? "✅" : "❌"}\n`);

	// Test 3: generateId always returns new ID
	console.log("Test 3: generateId uniqueness");
	const genId1 = generateId();
	const genId2 = generateId();
	console.log(`Generated ID 1: ${genId1}`);
	console.log(`Generated ID 2: ${genId2}`);
	console.log(`Generated IDs are different: ${genId1 !== genId2 ? "✅" : "❌"}\n`);

	// Test 4: useUniqueId format
	console.log("Test 4: useUniqueId format");
	const uniqueId = useUniqueId();
	console.log(`Unique ID: ${uniqueId}`);
	console.log(`Has ui prefix: ${uniqueId.startsWith("ui-") ? "✅" : "❌"}\n`);

	// Test 5: Counter incrementation
	console.log("Test 5: Counter incrementation");
	const counterBefore = getIdCounter();
	// const newId = generateId();
	const counterAfter = getIdCounter();
	console.log(`Counter before: ${counterBefore}`);
	console.log(`Counter after: ${counterAfter}`);
	console.log(`Counter incremented: ${counterAfter > counterBefore ? "✅" : "❌"}\n`);

	// Test 6: Reset functionality
	console.log("Test 6: Reset functionality");
	resetIdSystem();
	const resetId = generateId();
	const resetCounter = getIdCounter();
	console.log(`ID after reset: ${resetId}`);
	console.log(`Counter after reset: ${resetCounter}`);
	console.log(`Counter reset to 1: ${resetCounter === 1 ? "✅" : "❌"}\n`);

	// Test 7: Simulate Svelte 5 props pattern
	console.log("Test 7: Simulating Svelte 5 props pattern");

	function simulateComponent(providedId?: string) {
		// This simulates: let { id = useId(), ...props } = $props();
		const id = providedId ?? useId("component");
		return id;
	}

	const comp1Id1 = simulateComponent();
	const comp1Id2 = simulateComponent(); // Should be different (new call site)
	const comp2IdWithProp = simulateComponent("custom-id");

	console.log(`Component 1 call 1: ${comp1Id1}`);
	console.log(`Component 1 call 2: ${comp1Id2}`);
	console.log(`Component with custom ID: ${comp2IdWithProp}`);
	console.log(`Auto-generated IDs are different: ${comp1Id1 !== comp1Id2 ? "✅" : "❌"}`);
	console.log(`Custom ID preserved: ${comp2IdWithProp === "custom-id" ? "✅" : "❌"}\n`);

	console.log("✅ All tests completed!");
}

// Run tests if this file is executed directly
if (typeof window === "undefined") {
	runTests();
}

export { runTests };
