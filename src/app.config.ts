// <srcDir>/app.config.ts
import { googleAnalytics4 } from "@wxt-dev/analytics/providers/google-analytics-4";
import {
	createAnalyticsEnabledStorageItem,
	createAnalyticsUserIdStorageItem,
	createAnalyticsUserPropertiesStorageItem,
} from "@/lib/storage/amgState";

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
		enabled: createAnalyticsEnabledStorageItem(),
		userId: createAnalyticsUserIdStorageItem(),
		userProperties: createAnalyticsUserPropertiesStorageItem(),
	},
	version: pkg.version.toString(),
});
