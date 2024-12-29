<script lang="ts">
import LogTypesPopoverListbox from "./LogTypesPopoverListbox.vue";
import { logTypes } from "./console";
import { LogType, useSettingsStore } from "@/stores/settings";

const triggerLabelByType = {
	[LogType.Info]: "Info only",
	[LogType.Warning]: "Warnings only",
	[LogType.Error]: "Errors only",
	[LogType.Debug]: "Debug only",
} satisfies Record<LogType, string>;
</script>

<script setup lang="ts">
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import ArrowDropDownUpIcon from "@/icons/arrow-drop-down-up.svg?component";
import { computed } from "vue";

const settings = useSettingsStore();

const triggerText = computed(() => {
	const hiddenLogTypes = settings.data.hiddenLogTypes;
	if (hiddenLogTypes.length === 0) {
		return "All levels";
	}
	if (logTypes.length - hiddenLogTypes.length === 1) {
		const onlyVisibleType = logTypes.find(
			(type) => !hiddenLogTypes.includes(type),
		);
		return triggerLabelByType[onlyVisibleType!];
	}
	return "Custom levels";
});
</script>

<template>
	<Popover>
		<PopoverTrigger
			class="group flex h-8 min-w-0 items-center gap-1 rounded px-2.5 hover:bg-white/10 active:bg-white/15"
		>
			<span class="truncate text-sm text-white/75">
				{{ triggerText }}
			</span>
			<ArrowDropDownUpIcon
				class="size-4 shrink-0 text-white/60 transition-transform [transform:rotateX(180deg)] group-data-[state=open]:[transform:rotateX(0)]"
			/>
		</PopoverTrigger>
		<PopoverContent class="tw w-48 p-0" align="start">
			<LogTypesPopoverListbox />
		</PopoverContent>
	</Popover>
</template>
