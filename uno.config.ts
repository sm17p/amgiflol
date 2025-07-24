import extractorSvelte from "@unocss/extractor-svelte";
import presetRemToPx from "@unocss/preset-rem-to-px";
import presetWind4 from "@unocss/preset-wind4";
import {
	defineConfig,
	presetAttributify,
	presetTypography,
	transformerDirectives,
} from "unocss";

export default defineConfig({
	extractors: [
		extractorSvelte(),
	],
	presets: [
		presetAttributify({
			prefix: "amg-",
			prefixedOnly: true,
		}),
		presetWind4({
			preflights: {
				reset: true,
			},
		}),
		presetTypography(),
		presetRemToPx(),
	],
	transformers: [
		transformerDirectives(),
	],
	theme: {
		colors: {
			// Light mode VIBGYOR colors
			"vibgyor-violet-light": "#8A2BE2",
			"vibgyor-indigo-light": "#4B0082",
			"vibgyor-blue-light": "#0000FF",
			"vibgyor-green-light": "#008000",
			"vibgyor-yellow-light": "#FFFF00",
			"vibgyor-orange-light": "#FFA500",
			"vibgyor-red-light": "#FF0000",

			// Dark mode VIBGYOR colors (adjust these to your preference for dark mode visibility)
			"vibgyor-violet-dark": "#B088F5", // Lighter violet for dark background
			"vibgyor-indigo-dark": "#7A38BC", // Lighter indigo
			"vibgyor-blue-dark": "#4F4FFF", // Lighter blue
			"vibgyor-green-dark": "#3CB371", // Lighter green
			"vibgyor-yellow-dark": "#FFFF99", // Lighter yellow
			"vibgyor-orange-dark": "#FFD700", // Lighter orange (more golden)
			"vibgyor-red-dark": "#FF6347", // Lighter red (tomato)
		},
		extend: {
			transitionTimingFunction: {
				"ease-spring": "cubic-bezier(0.68,-0.55,0.265,1.55)",
				"ease-spring-smooth": "cubic-bezier(0.175,0.885,0.32,1.275)",
				"ease-spring-gentle": "cubic-bezier(0.25,0.46,0.45,0.94)",
				"ease-spring-elastic": "cubic-bezier(0.68,-0.6,0.32,1.6)",
			},
		},
	},
});
