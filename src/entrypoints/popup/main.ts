import App from "@/lib/modules/ExtenstionSettings/App.svelte";
import { mount } from "svelte";
import "@/assets/tailwind.css";

const app = mount(App, {
	target: document.getElementById("app")!,
});

export default app;
