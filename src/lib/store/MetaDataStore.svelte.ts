export class MetaDataStore implements App.MetaDataStore {
	keyboard: App.KeyboardState = $state<App.KeyboardState>({
		modifiers: {
			alt: false,
			ctrl: false,
			meta: false,
			primary: false,
			secondary: false,
			shift: false,
		},
	});
	platformInfo = $state<App.MetaDataStore["platformInfo"]>({ os: "none" });
	mouse = $state<App.MouseState>({
		x: 0,
		y: 0,
		isPressed: false,
	});
	scroll = $state({
		scrollX: 0,
		scrollY: 0,
	});
	window = $state({
		innerHeight: 0,
		innerWidth: 0,
	});

	constructor() {
		const platformInfoStore = storage.defineItem<
			App.MetaDataStore["platformInfo"]
		>("local:platformInfo");
		platformInfoStore.getValue().then(value => {
			if (value) {
				this.platformInfo = value;
			}
		});
	}

	public updateMousePosition(x: number, y: number) {
		this.mouse.x = x;
		this.mouse.y = y;
	}

	public updateModifiers(modifiers: Partial<App.KeyboardState["modifiers"]>) {
		Object.assign(this.keyboard.modifiers, modifiers);
	}
}
