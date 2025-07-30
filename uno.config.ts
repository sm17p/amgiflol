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
