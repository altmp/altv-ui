<script lang="ts">
import WarningIcon from "@/icons/warning.svg?component";
import ErrorCircleIcon from "@/icons/error-circle.svg?component";
import BugIcon from "@/icons/bug.svg?component";
import InfoCircleIcon from "@/icons/info-circle.svg?component";
import { logNameByType, logTypes } from "./console";
import { LogType, useSettingsStore } from "@/stores/settings";

const logLabelByType = {
	[LogType.Info]: "Info",
	[LogType.Warning]: "Warning",
	[LogType.Error]: "Error",
	[LogType.Debug]: "Debug",
} satisfies Record<LogType, string>;

const iconByType = {
	[LogType.Info]: InfoCircleIcon,
	[LogType.Warning]: WarningIcon,
	[LogType.Error]: ErrorCircleIcon,
	[LogType.Debug]: BugIcon,
} satisfies Record<LogType, FunctionalComponent>;
</script>

<script setup lang="ts">
import {
	ListboxRoot,
	ListboxContent,
	ListboxItem,
	ListboxItemIndicator,
	Separator,
} from "radix-vue";
import CheckIcon from "@/icons/check.svg?component";
import { computed, type FunctionalComponent } from "vue";

const settings = useSettingsStore();

const visibleLogTypes = computed({
	get: () => {
		return logTypes
			.filter((type) => {
				return !settings.data.hiddenLogTypes.includes(type);
			})
			.map((type) => type.toString());
	},
	set: (values) => {
		const visibleLogTypes = values.map((value) => parseInt(value) as LogType);
		settings.data.hiddenLogTypes = logTypes.filter(
			(type) => !visibleLogTypes.includes(type),
		);
		settings.save("hiddenLogTypes");
	},
});

const resetToDefault = () => {
	settings.data.hiddenLogTypes = [];
	settings.save("hiddenLogTypes");
};
</script>

<template>
	<ListboxRoot
		:multiple="true"
		:highlight-on-hover="true"
		v-model="visibleLogTypes"
	>
		<ListboxContent class="p-1">
			<ListboxItem
				v-for="(label, type) of logLabelByType"
				:key="type"
				:value="type"
				class="relative flex w-full select-none items-center justify-between gap-2 rounded py-1.5 pl-2 pr-8 text-sm outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-white/5 data-[disabled]:opacity-50"
			>
				<component
					:is="iconByType[type]"
					class="size-4 data-[type=debug]:text-white/60 data-[type=error]:text-red-400 data-[type=info]:text-white/60 data-[type=warning]:text-orange-400"
					:data-type="logNameByType[type]"
				/>
				<span class="flex flex-1 items-center gap-2 text-sm text-stone-50">
					{{ label }}
				</span>
				<ListboxItemIndicator class="absolute right-2 top-2">
					<CheckIcon class="size-4 stroke-1.5 text-white/60" />
				</ListboxItemIndicator>
			</ListboxItem>
			<Separator class="-mx-1 my-1 h-px rounded-full bg-white/15" />
			<ListboxItem
				value=""
				@select.prevent="resetToDefault"
				class="flex w-full select-none items-center justify-between gap-2 rounded py-1.5 pl-2 pr-8 text-sm outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-white/5 data-[disabled]:opacity-50"
			>
				<span class="flex flex-1 items-center gap-2 text-sm text-stone-50">
					Reset to default
				</span>
			</ListboxItem>
		</ListboxContent>
	</ListboxRoot>
</template>
