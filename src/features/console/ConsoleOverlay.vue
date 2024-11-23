<script setup lang="ts">
import Console from "./Console.vue";
import { ConsoleContextInjectionKey, createConsoleContext } from "./console";
import { SplitterGroup, SplitterPanel, SplitterResizeHandle } from "radix-vue";
import { computed, provide, ref } from "vue";
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
import { injectContext } from "@/utils/injectContext";
import { PixelScaleContextInjectionKey } from "@/utils/pixelScale";

const consoleContext = createConsoleContext({
	maxEntries: 300,
	maxMessageLength: 10000,
	maxMessageNewlines: 50,
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
const saveConsoleHeight = useDebounceFn(() => settings.save("consoleHeight"));
const consoleHeight = computed<number>({
	get: () => settings.data.consoleHeight * 100,
	set: (value) => {
		settings.data.consoleHeight = value / 100;
		saveConsoleHeight();
	},
});

const measurementsContext = createConsoleMeasurementsContext(consoleContext);
provide(ConsoleMeasurementsContextInjectionKey, measurementsContext);

const { pixelScale } = injectContext(PixelScaleContextInjectionKey);
const hitAreaMargins = computed(() => ({
	// fine is for mouse input
	fine: 4 * pixelScale.value,
	// coarse for touch input (we probably don't need this but it won't hurt)
	coarse: 12 * pixelScale.value,
}));

const draggingX = ref(false);
const draggingY = ref(false);
</script>

<template>
	<div
		v-if="consoleContext.open.value || consoleContext.transparent.value"
		class="fixed inset-0 z-10 h-dvh w-full p-2 tw"
		:class="consoleContext.open.value ? 'bg-black/50' : 'pointer-events-none'"
	>
		<SplitterGroup direction="horizontal">
			<SplitterPanel :min-size="0" />
			<SplitterResizeHandle
				:hit-area-margins="hitAreaMargins"
				:disabled="
					consoleContext.transparent.value && !consoleContext.open.value
				"
				class="peer z-20 outline-none"
				@dragging="(dragging) => (draggingX = dragging)"
			/>
			<SplitterPanel
				:min-size="25"
				:max-size="100"
				:default-size="consoleWidth"
				@resize="
					(newWidth) => {
						consoleWidth = newWidth;
						measurementsContext.clearMeasurementsCache();
					}
				"
			>
				<SplitterGroup direction="vertical">
					<SplitterPanel
						:min-size="25"
						:max-size="100"
						:default-size="consoleHeight"
						@resize="
							(newHeight) => {
								consoleHeight = newHeight;
								measurementsContext.clearMeasurementsCache();
							}
						"
						class="console-panel rounded-md overflow-hidden"
						:class="{
							'border border-stone-600 bg-stone-900 shadow-lg  peer-data-[state=hover]:border-b-stone-400':
								consoleContext.open.value,
							'border border-white/10':
								consoleContext.transparent.value && !consoleContext.open.value,
							'border-b-stone-400': draggingY,
							'border-l-stone-400': draggingX,
						}"
					>
						<Console />
					</SplitterPanel>
					<SplitterResizeHandle
						:hit-area-margins="hitAreaMargins"
						:disabled="
							consoleContext.transparent.value && !consoleContext.open.value
						"
						@dragging="(dragging) => (draggingY = dragging)"
						class="peer z-20 outline-none"
					/>
					<SplitterPanel :min-size="0" />
				</SplitterGroup>
			</SplitterPanel>
		</SplitterGroup>
	</div>
</template>
