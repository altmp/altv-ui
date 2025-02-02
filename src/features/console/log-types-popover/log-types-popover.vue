<script setup lang="ts">
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import ArrowDropDownUpIcon from "@/icons/arrow-drop-down-up.svg?component";
import { LogType, useSettingsStore } from "@/stores/settings";
import { computed } from "vue";
import LogTypesPopoverListbox from "./log-types-popover-listbox.vue";
import { LOG_TYPES } from "./constants";

const settings = useSettingsStore();

const triggerLabelByType = {
	[LogType.Info]: "Info only",
	[LogType.Warning]: "Warnings only",
	[LogType.Error]: "Errors only",
	[LogType.Debug]: "Debug only",
} satisfies Record<LogType, string>;

const triggerText = computed(() => {
	const visibleLogTypes = LOG_TYPES.filter(
		(type) => !settings.data.hiddenLogTypes.includes(type),
	);

	if (visibleLogTypes.length === LOG_TYPES.length) {
		return "All levels";
	}
	if (visibleLogTypes.length === 1) {
		return triggerLabelByType[visibleLogTypes[0]!];
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
