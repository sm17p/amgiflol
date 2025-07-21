import { booleanToVote } from "@/utils/tracking";

export class UpvoteState {
	private key: string;
	public pressed = $state(false);
	public upvoteStore: WxtStorageItem<boolean, {}>;

	constructor(key: string) {
		this.key = key;
		this.upvoteStore = storage.defineItem<boolean>(
			`local:voting-${key}`,
			{
				fallback: false,
			},
		);
		this.upvoteStore.getValue().then((res: boolean) => {
			this.pressed = res;
		});
		this.upvoteStore.watch((newValue, oldValue) => {
			if (newValue !== oldValue) {
				this.pressed = newValue;
			}
		});
	}

	updatePressed(newState: boolean) {
		this.pressed = newState;
		analytics.track("vote", {
			label: this.key,
			value: booleanToVote(this.pressed),
		});
		this.upvoteStore.setValue(newState);
	}
}
