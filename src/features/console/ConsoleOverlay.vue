<script setup lang="ts">
import Console from "./Console.vue";
import { ConsoleContextInjectionKey, createConsoleContext } from "./console";
import { SplitterGroup, SplitterPanel, SplitterResizeHandle } from "radix-vue";
import { computed, provide } from "vue";
import { useDebounceFn } from "@vueuse/core";
import {
	ConsoleTimeFormatContextInjectionKey,
	createConsoleTimeFormatContext,
} from "./time-format";
import {
	ConsoleHistoryContextInjectionKey,
	createConsoleHistoryContext,
} from "./history";
import {
	ConsoleMeasurementsContextInjectionKey,
	createConsoleMeasurementsContext,
} from "./measurements";
import { useSettingsStore } from "@/stores/settings";

const consoleContext = createConsoleContext({
	maxEntries: 300,
	maxMessageLength: 10000,
	maxMessageNewlines: 50,
	pullInterval: 16,
});
provide(ConsoleContextInjectionKey, consoleContext);

provide(
	ConsoleHistoryContextInjectionKey,
	createConsoleHistoryContext({ maxLength: 50 }),
);

provide(ConsoleTimeFormatContextInjectionKey, createConsoleTimeFormatContext());

const settings = useSettingsStore();

const saveConsoleWidth = useDebounceFn(() => settings.save("consoleWidth"));
const consoleWidth = computed<number>({
	get: () => settings.data.consoleWidth * 100,
	set: (value) => {
		settings.data.consoleWidth = value / 100;
		saveConsoleWidth();
	},
});

const measurementsContext = createConsoleMeasurementsContext(consoleContext);

provide(ConsoleMeasurementsContextInjectionKey, measurementsContext);
</script>

<template>
	<div
		v-if="consoleContext.open.value || consoleContext.transparent.value"
		class="fixed inset-0 z-10 h-dvh w-full p-2 tw"
		:class="consoleContext.open.value ? 'bg-black/50' : 'pointer-events-none'"
	>
		<SplitterGroup id="splitter-group-1" direction="horizontal">
			<SplitterPanel id="splitter-group-1-panel-1" :min-size="0" />
			<SplitterResizeHandle
				:hit-area-margins="{ fine: 2, coarse: 12 }"
				:disabled="
					consoleContext.transparent.value && !consoleContext.open.value
				"
				id="splitter-group-1-resize-handle-1"
				class="peer z-20 outline-none"
			/>
			<SplitterPanel
				id="splitter-group-1-panel-2"
				:min-size="20"
				:max-size="80"
				:default-size="consoleWidth"
				@resize="
					(newWidth) => {
						consoleWidth = newWidth;
						measurementsContext.clearMeasurementsCache();
					}
				"
				class="rounded-md shadow-lg"
				:class="
					consoleContext.open
						? 'border border-stone-600 peer-data-[state=drag]:border-l-stone-400 peer-data-[state=hover]:border-l-stone-400'
						: ''
				"
			>
				<Console />
			</SplitterPanel>
		</SplitterGroup>
	</div>
</template>
