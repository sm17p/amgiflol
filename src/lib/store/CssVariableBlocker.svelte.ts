// oxlint-disable no-empty-file
// import { Attachment } from "svelte/attachments";
// import { SvelteSet } from "svelte/reactivity";

// export let cssVariables = new SvelteSet();

// export function documentAttachment(): Attachment {
// 	let observer = new MutationObserver((mutations) => {
// 		let shouldUpdate = false;

// 		mutations.forEach((mutation) => {
// 			if (mutation.type === "childList") {
// 				// Check if any added nodes are style/link elements
// 				mutation.addedNodes.forEach((node) => {
// 					if (node.nodeType === Node.ELEMENT_NODE) {
// 						const tagName = node.tagName.toLowerCase();
// 						if (
// 							tagName === "style" ||
// 							(tagName === "link" &&
// 								node.rel === "stylesheet")
// 						) {
// 							shouldUpdate = true;
// 						}
// 					}
// 				});

// 				// Check if any removed nodes were style/link elements
// 				mutation.removedNodes.forEach((node) => {
// 					if (node.nodeType === Node.ELEMENT_NODE) {
// 						const tagName = node.tagName.toLowerCase();
// 						if (
// 							tagName === "style" ||
// 							(tagName === "link" &&
// 								node.rel === "stylesheet")
// 						) {
// 							shouldUpdate = true;
// 						}
// 					}
// 				});
// 			}

// 			// Watch for attribute changes on style/link elements
// 			if (mutation.type === "attributes" && mutation.target) {
// 				const tagName = mutation.target.tagName.toLowerCase();
// 				if (
// 					tagName === "style" ||
// 					(tagName === "link" &&
// 						mutation.target.rel === "stylesheet")
// 				) {
// 					shouldUpdate = true;
// 				}
// 			}
// 		});

// 		// if (shouldUpdate) {
// 		// 	console.log(
// 		// 		"Stylesheet changes detected, updating CSS variable blocks...",
// 		// 	);
// 		// 	// Small delay to ensure stylesheets are fully loaded
// 		// 	setTimeout(() => {
// 		// 		this.blockDocumentCSSVariables();
// 		// 	}, 100);
// 		// }
// 	});
// 	return (_element: Element) => {
// 		const targetSelectors = [":root", "html", "html:root", "*"];

// 		try {
// 			// Iterate through all stylesheets
// 			for (const styleSheet of document.styleSheets) {
// 				try {
// 					console.log("🚀 ~ return ~ styleSheet:", styleSheet);
// 					// Skip stylesheets we can't access (CORS)
// 					if (!styleSheet.cssRules) continue;

// 					// Check each rule in the stylesheet
// 					for (const rule of styleSheet.cssRules) {
// 						if (rule instanceof CSSStyleRule) {
// 							// Check if this rule targets a top-level selector
// 							const selectorText = rule.selectorText
// 								.toLowerCase();
// 							const isTargetSelector = true ||
// 								targetSelectors.some(
// 									selector => selectorText.includes(selector),
// 								);

// 							if (isTargetSelector && rule.style) {
// 								// Extract CSS custom properties from this rule
// 								for (let i = 0; i < rule.style.length; i++) {
// 									const property = rule.style[i];
// 									if (property.startsWith("--")) {
// 										cssVariables.add(property);
// 									}
// 								}
// 							}
// 						}
// 					}
// 				} catch (e) {
// 					// Skip stylesheets that can't be accessed (cross-origin)
// 					console.warn(
// 						"Cannot access stylesheet:",
// 						styleSheet.href,
// 						e,
// 					);
// 				}
// 			}
// 		} catch (e) {
// 			console.error("Error extracting CSS variables:", e);
// 		}

// 		setupStyleSheetObserver(observer);

// 		$inspect(cssVariables);

// 		return () => {
// 			observer.disconnect();
// 		};
// 	};
// }

// // Target selectors that define global CSS variables

// const a = (document: Document) => {
// 	let element = document.querySelector("amgif-lol");
// 	let elementhead = document.querySelector("amgif-lol > head");
// 	console.log(
// 		"🚀 ~ <svelte:body{@attach ~ body:",
// 		document,
// 		document.styleSheets,
// 		element,
// 		elementhead,
// 	);
// };

// function setupStyleSheetObserver(observer: MutationObserver) {
// 	// Watch for changes to the document head (new stylesheets)

// 	// Start observing
// 	observer.observe(document.head, {
// 		childList: true,
// 		subtree: true,
// 		attributes: true,
// 		attributeFilter: ["href", "rel"],
// 	});

// 	// Also observe the document element for dynamically added styles
// 	observer.observe(document.documentElement, {
// 		childList: true,
// 		subtree: true,
// 		attributes: false,
// 	});
// }
