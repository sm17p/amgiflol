import { getVoteState, setVoteState } from "@/lib/storage/amgState";
import { booleanToVote } from "@/utils/tracking";

export class UpvoteState {
	private key: string;
	public pressed = $state(false);

	constructor(key: string) {
		this.key = key;
		getVoteState(this.key).then((res: boolean) => {
			this.pressed = res;
		});
	}

	updatePressed(newState: boolean) {
		this.pressed = newState;
		analytics.track("vote", {
			label: this.key,
			value: booleanToVote(this.pressed),
		});
		void setVoteState(this.key, newState);
	}
}
