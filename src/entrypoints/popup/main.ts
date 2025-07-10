import App from "@/lib/modules/ExtenstionSettings/App.svelte";
import "virtual:uno.css";
import { mount } from "svelte";

const app = mount(App, {
	target: document.getElementById("app")!,
});

export default app;
