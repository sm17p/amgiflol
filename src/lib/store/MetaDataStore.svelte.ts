export class MetaDataStore implements App.MetaDataStore {
	mouse = $state<App.MouseState>({
		x: 0,
		y: 0,
		isPressed: false,
		modifiers: {
			ctrl: false,
			shift: false,
			alt: false,
		},
	});
	window = $state({
		innerHeight: 0,
		innerWidth: 0,
	});

	constructor() {
	}

	public updateMousePosition(x: number, y: number) {
		this.mouse.x = x;
		this.mouse.y = y;
	}

	public updateModifiers(modifiers: Partial<App.MouseState["modifiers"]>) {
		Object.assign(this.mouse.modifiers, modifiers);
	}
}
