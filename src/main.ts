import { createApp } from "vue";
import { createPinia } from "pinia";
import "@/assets/base.scss";

import App from "./App.vue";
import router from "./router";
import { useServersStore } from "@/stores/servers";
import { useLocalization } from "@/stores/localization";

const app = createApp(App);
const pinia = createPinia();

const importLocales = import.meta.glob("@/locales/i18n/altvui/*.json", {
	eager: true,
});

async function main() {
	app.use(router);
	app.use(pinia);

	if (import.meta.env.DEV) {
		await import("./browser-test");
	}

	const locales = await Promise.all(
		Object.entries(importLocales)
			.filter(([k]) => k.endsWith(".json"))
			.map(([k, v]) => [k.match(/\w+(?=\.json$)/)![0], v] as const)
			.map(([k, v]) => {
				const data = (v as any).default;

				return {
					code: k,
					name: data.name,
					data: data.strings,
					rtl: data.rtl,
				};
			}),
	);

	useServersStore(); // make sure it inits before loaded event
	const locale = useLocalization();
	locale.init(locales);

	app.mount("#altv-launcher");

	alt.emit("loaded");
}

main().catch(console.error);
