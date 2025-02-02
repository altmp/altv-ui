<script setup lang="ts">
import Console from "./console.vue";
import { ConsoleContextKey, createConsoleContext } from "./console";
import { SplitterGroup, SplitterPanel, SplitterResizeHandle } from "radix-vue";
import { computed, provide, ref } from "vue";
import { useDebounceFn } from "@vueuse/core";
import {
	ConsoleTimeFormatContextKey,
	createConsoleTimeFormatContext,
} from "./time-format";
import {
	ConsoleHistoryContextKey,
	createConsoleHistoryContext,
} from "./history";
import {
	ConsoleMeasurementsContextKey,
	createConsoleMeasurementsContext,
} from "./measurements";
import { useSettingsStore } from "@/stores/settings";
import { injectContext } from "@/utils/context";
import { PixelScaleContextKey } from "@/utils/pixelScale";

const COLORS = Object.freeze({
	BLACK: "#1e1e1e",
	LBLACK: "#666666",
	RED: "#bd3f39",
	LRED: "#df5853",
	GREEN: "#55b87f",
	LGREEN: "#63cd91",
	BLUE: "#3972c2",
	LBLUE: "#508ee3",
	YELLOW: "#e6e34d",
	LYELLOW: "#f6f366",
	MAGENTA: "#ae4cb6",
	LMAGENTA: "#c978d1",
	CYAN: "#4ba6c9",
	LCYAN: "#59b6d7",
	WHITE: "#C0C0C0",
	LWHITE: "#FFFFFF",
});
const colorByIndex = Object.freeze(Object.values(COLORS));

const consoleContext = createConsoleContext({
	maxEntries: 300,
	pullInterval: 16,
	truncationSuffix: (count) => `... ${count} chars more ...`,
	colorByIndex,
	defaultColorIndex: colorByIndex.indexOf(COLORS.WHITE),
	maxFormattedMessageLength: 10_000,
	maxFormattedMessageNewlines: 50,
});
provide(ConsoleContextKey, consoleContext);

provide(
	ConsoleHistoryContextKey,
	createConsoleHistoryContext({ maxLength: 50 }),
);
provide(
	ConsoleTimeFormatContextKey,
	createConsoleTimeFormatContext(consoleContext),
);

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
provide(ConsoleMeasurementsContextKey, measurementsContext);

const { pixelScale } = injectContext(PixelScaleContextKey);
const hitAreaMargins = computed(() => ({
	// fine is for mouse input
	fine: 4 * pixelScale.value,
	// coarse for touch input (we probably don't need this but it won't hurt)
	coarse: 12 * pixelScale.value,
}));

const draggingX = ref(false);
const draggingY = ref(false);

/**
 * @see https://github.com/TanStack/virtual/issues/531
 */
const knownErrors = [
	"ResizeObserver loop limit exceeded",
	"ResizeObserver loop completed with undelivered notifications.",
];

window.onerror = (message) => {
	// by returning true, we prevent the error from being logged to the console
	return knownErrors.some((error) => error === message);
};
</script>

<template>
	<div
		v-if="consoleContext.visible.value"
		:data-open="consoleContext.open.value"
		class="fixed inset-0 z-40 h-dvh w-full p-2 tw data-[open=true]:bg-black/50 data-[open=false]:pointer-events-none"
	>
		<SplitterGroup direction="horizontal">
			<SplitterPanel :min-size="0" />
			<SplitterResizeHandle
				:hit-area-margins="hitAreaMargins"
				:disabled="!consoleContext.visible.value"
				class="outline-none"
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
						:data-open="consoleContext.open.value"
						class="rounded-md overflow-hidden data-[open=true]:bg-stone-900 data-[open=false]:bg-stone-900/50 data-[open=true]:border-stone-600 data-[open=true]:shadow-lg data-[open=false]:border-white/10 border"
						:class="{
							'data-[open=true]:border-b-stone-400': draggingY,
							'data-[open=true]:border-l-stone-400': draggingX,
						}"
					>
						<Console />
					</SplitterPanel>
					<SplitterResizeHandle
						:hit-area-margins="hitAreaMargins"
						:disabled="!consoleContext.visible.value"
						@dragging="(dragging) => (draggingY = dragging)"
						class="outline-none"
					/>
					<SplitterPanel :min-size="0" />
				</SplitterGroup>
			</SplitterPanel>
		</SplitterGroup>
	</div>
</template>
