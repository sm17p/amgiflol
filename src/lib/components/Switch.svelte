<script lang="ts">
  import { generateId } from "@/lib/utils/useId";
  import { Switch } from "@ark-ui/svelte/switch";

  interface Props {
    id?: string;
    checked?: boolean;
    labelText: string;
    disabled?: boolean;
    class?: string;
    style?: string;
    onCheckedChange?: (details: { checked: boolean }) => void;
  }

  const defaultSwitchId = generateId("switch");

  let {
    id: idProp,
    checked = $bindable(false),
    labelText,
    disabled = false,
    class: classes = "",
    style = "",
    ...restProps
  }: Props = $props();

  const id = $derived(idProp ?? defaultSwitchId);

  function handleCheckedChange(details: { checked: boolean }) {
    checked = details.checked;
  }
</script>

<Switch.Root
  {id}
  {checked}
  {disabled}
  onCheckedChange={handleCheckedChange}
  class="flex justify-between items-center gap-3 w-full {classes}"
  {style}
  {...restProps}
>
  <Switch.Label class="cursor-inherit flex-1 text-start">
    {labelText}
  </Switch.Label>
  <Switch.Control
    class="h-full p-0.5 w-12 h-6 focus-visible:ring-white focus-visible:ring-offset data-[state=checked]:bg-lime-700 data-[state=unchecked]:bg-neutral-700 data-[state=unchecked]:shadow-inner dark:data-[state=checked]:bg-white focus-visible:outline-hidden inline-flex cursor-pointer items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
  >
    <Switch.Thumb
      class="bg-white h-4 w-4 data-[state=unchecked]:shadow-md pointer-events-none block rounded-full transition-transform data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-0 dark:border dark:data-[state=unchecked]:border"
    />
  </Switch.Control>
  <Switch.HiddenInput />
</Switch.Root>
