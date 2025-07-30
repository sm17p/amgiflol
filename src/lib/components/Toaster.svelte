<script lang="ts">
	import {
		createToaster,
		Toast,
		Toaster,
	} from "@ark-ui/svelte/toast";
	import { X } from "@lucide/svelte";

	const toaster = createToaster({
		placement: "bottom-end",
		overlap: true,
		gap: 24,
	});

	function addToast() {
		toaster.create({
			title: "Toast Title",
			description: "Toast Description",
			type: "info",
		});
	}

	onMount(addToast);
</script>

{#if import.meta.env.DEV}
	<div class="bg-white pointer-events-initial px-4">
		<button type="button" onclick={addToast}>Add Toast</button>
		<Toaster {toaster}>
			{#snippet children(toast)}
				<Toast.Root class="bg-white">
					<Toast.Title>{toast().title}</Toast.Title>
					<Toast.Description>{toast().description}</Toast.Description>
					<Toast.CloseTrigger>
						<X />
					</Toast.CloseTrigger>
				</Toast.Root>
			{/snippet}
		</Toaster>
	</div>
{/if}
