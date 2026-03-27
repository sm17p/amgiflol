<script lang="ts">
  import { UpvoteState } from "@/lib/store/UpvoteState.svelte";
  import { generateId } from "@/lib/utils/useId";
  import { Toggle } from "@ark-ui/svelte/toggle";
  import { ArrowBigUp } from "@lucide/svelte";

  interface Props {
    id?: string;
    voteKey: string;
    label: string;
    disabled?: boolean;
    class?: string;
  }

  const defaultToggleId = generateId("upvote");

  let {
    id: idProp,
    voteKey,
    label,
    disabled = false,
    class: className = "",
    ...restProps
  }: Props = $props();

  const id = $derived(idProp ?? defaultToggleId);

  const upvoteState = $derived.by(() => new UpvoteState(voteKey));

  function handlePressedChange(pressed: boolean) {
    upvoteState.updatePressed(pressed);
  }
</script>

<span
  class="min-w-[250px] flex justify-between items-center gap-3 font-inherit"
>
  <Toggle.Root
    {id}
    aria-label={label}
    pressed={upvoteState.pressed}
    onPressedChange={handlePressedChange}
    {disabled}
    class="group w-full flex justify-between items-center gap-3 {className}"
    {...restProps}
  >
    <label for={id} class="cursor-inherit flex-1 text-start font-inherit">
      {label}
    </label>
    <div
      class="outline-none rounded-sm group-data-[state=off]:not-disabled:hover:bg-lime-200 group-data-[state=off]:not-disabled:hover:text-lime-500 !active:bg-lime-700 !active:text-lime-500 group-data-[state=on]:bg-lime-700 group-data-[state=on]:text-white/80 inline-flex size-8 items-center justify-center transition-all not-disabled:active:rounded-3xl not-disabled:active:scale-[0.85]"
    >
      <ArrowBigUp absoluteStrokeWidth class="size-8" />
    </div>
  </Toggle.Root>
</span>
