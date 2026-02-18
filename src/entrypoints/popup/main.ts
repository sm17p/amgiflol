import { mount } from "svelte";
import "virtual:uno.css";
import App from "@/lib/modules/ExtenstionSettings/App.svelte";

const app = mount(App, {
	target: document.getElementById("app")!,
});

export default app;
