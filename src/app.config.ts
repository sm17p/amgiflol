// <srcDir>/app.config.ts
import { googleAnalytics4 } from "@wxt-dev/analytics/providers/google-analytics-4";
import pkg from "../package.json";

export default defineAppConfig({
	analytics: {
		debug: import.meta.env.DEV,
		providers: [
			googleAnalytics4({
				apiSecret: import.meta.env.WXT_GA_API_SECRET,
				measurementId: "G-XWT0HYT2KT",
			}),
		],
		enabled: storage.defineItem("local:analytics-enabled", {
			fallback: true,
		}),
		userId: storage.defineItem("local:amg-user-id-key", {
			fallback: crypto.randomUUID().toString(),
		}),
		userProperties: storage.defineItem("local:amg-user-properties-key", {
			fallback: {},
		}),
	},
	version: pkg.version.toString(),
});
