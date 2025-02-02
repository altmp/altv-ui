<script setup lang="ts">
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import ArrowDropDownUpIcon from "@/icons/arrow-drop-down-up.svg?component";
import { computed } from "vue";
import ResourcesPopoverListbox from "./resources-popover-listbox.vue";
import { useSettingsStore } from "@/stores/settings";

const settings = useSettingsStore();
const triggerLabel = computed(() => {
	const length = settings.data.hiddenLogResources.length;

	if (length === 0) return "All resources";
	if (length === 1) return "1 resource hidden";
	return `${length} resources hidden`;
});
</script>

<template>
	<Popover>
		<PopoverTrigger
			class="group flex h-8 min-w-0 items-center gap-1 rounded px-2.5 hover:bg-white/10 active:bg-white/15"
		>
			<span class="truncate text-sm text-white/75">
				{{ triggerLabel }}
			</span>
			<ArrowDropDownUpIcon
				class="size-4 shrink-0 text-white/60 transition-transform [transform:rotateX(180deg)] group-data-[state=open]:[transform:rotateX(0)]"
			/>
		</PopoverTrigger>
		<PopoverContent class="tw w-48 p-0" align="start">
			<ResourcesPopoverListbox />
		</PopoverContent>
	</Popover>
</template>
