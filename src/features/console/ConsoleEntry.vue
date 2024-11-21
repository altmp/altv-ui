<script lang="ts">
const COUNT_CIRCLE_BG: Record<LogType, string> = Object.freeze({
	[LogType.Info]: "bg-white/60",
	[LogType.Warning]: "bg-orange-500",
	[LogType.Error]: "bg-red-400",
	[LogType.Debug]: "",
});

const MESSAGE_COLOR: Record<LogType, string> = Object.freeze({
	[LogType.Info]: "text-code-white",
	[LogType.Warning]: "text-orange-200",
	[LogType.Error]: "text-red-100",
	[LogType.Debug]: "",
});

const MESSAGE_BACKGROUND = Object.freeze({
	[LogType.Info]: "",
	[LogType.Warning]: "bg-orange-500/15",
	[LogType.Error]: "bg-red-400/15",
	[LogType.Debug]: "",
});
</script>

<script setup lang="ts">
import { type ConsoleEntry } from "./console";
import WarningIcon from "@/icons/warning.svg?component";
import ErrorCircleIcon from "@/icons/error-circle.svg?component";
import { ref } from "vue";
import ConsoleEntryCopyButton from "./ConsoleEntryCopyButton.vue";
import ConsoleEntryTime from "./ConsoleEntryTime.vue";
import { LogType, useSettingsStore } from "@/stores/settings";

const props = defineProps<{ entry: ConsoleEntry }>();

const settings = useSettingsStore();
const element = ref<HTMLElement | null>(null);
</script>

<template>
	<div
		ref="element"
		class="rounded py-1 !select-text"
		:class="[
			MESSAGE_BACKGROUND[props.entry.type],
			props.entry.count > 1 ? 'px-2' : 'pl-7 pr-2',
		]"
	>
		<div class="float-right top-0 text-right whitespace-nowrap flex gap-1">
			<span class="size-5 inline-block" v-if="settings.data.showLogCopyButton">
				<ConsoleEntryCopyButton
					:entry-element="element"
					:text="entry.message"
				/>
			</span>
			<span
				v-if="props.entry.resource"
				class="rounded bg-white/10 px-1.5 text-xs font-medium text-white/75 leading-5"
			>
				{{ props.entry.resource }}
			</span>
			<ConsoleEntryTime
				v-if="settings.data.showLogTime"
				:time="props.entry.time"
			/>
		</div>

		<span
			v-if="props.entry.count > 1"
			class="mr-1.5 rounded-full px-1.5 text-center text-xs font-semibold leading-4 text-stone-900"
			:class="COUNT_CIRCLE_BG[props.entry.type]"
		>
			{{ props.entry.count }}
		</span>
		<WarningIcon
			v-else-if="props.entry.type === LogType.Warning"
			class="top-1.5 left-1.5 absolute size-4 text-orange-500"
		/>
		<ErrorCircleIcon
			v-else-if="props.entry.type === LogType.Error"
			class="top-1.5 left-1.5 absolute size-4 text-red-400"
		/>

		<span
			class="whitespace-pre-wrap leading-5 !select-text *:select-text font-mono text-sm [&>a:hover]:underline [&>a]:underline-offset-2"
			:class="MESSAGE_COLOR[props.entry.type]"
			v-html="props.entry.html"
		/>
	</div>
</template>
