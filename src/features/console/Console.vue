<script setup lang="ts">
import { ConsoleContextInjectionKey, type ConsoleEntry } from "./console";
import {
	computed,
	nextTick,
	onBeforeUnmount,
	onMounted,
	ref,
	watch,
	type ComponentPublicInstance,
} from "vue";
import { useVirtualizer, type Range } from "@tanstack/vue-virtual";
import ChevronUpIcon from "@/icons/chevron-up.svg?component";
import ConsoleEntryItem from "./ConsoleEntry.vue";
import BanIcon from "@/icons/ban.svg?component";
import VerticalDotsIcon from "@/icons/vertical-dots.svg?component";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator, CollapsibleRoot, CollapsibleContent } from "radix-vue";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LogTypesPopover from "./LogTypesPopover.vue";
import ResourcesPopover from "./ResourcesPopover.vue";
import ConsoleSettings from "./ConsoleSettings.vue";
import SettingsIcon from "@/icons/settings.svg?component";
import AltVOutlineLogo from "@/icons/altv-outline-logo.svg?component";
import { ConsoleHistoryContextInjectionKey } from "./history";
import { Id } from "@/components/ui/id";
import { ConsoleMeasurementsContextInjectionKey } from "./measurements";
import ConsoleTransparentIcon from "@/icons/console-transparent.svg?component";
import ConsoleSolidIcon from "@/icons/console-solid.svg?component";
import { injectContext } from "@/utils/injectContext";
import { LogType, useSettingsStore } from "@/stores/settings";
import { PixelScaleContextInjectionKey } from "@/utils/pixelScale";

const consoleContext = injectContext(ConsoleContextInjectionKey);
const settings = useSettingsStore();

const entries = computed<readonly ConsoleEntry[]>(() => {
	const result: ConsoleEntry[] = [];

	for (let i = 0; i < consoleContext.entries.value.size; i++) {
		const entry = consoleContext.entries.value.get(i)!;
		if (
			settings.data.hiddenLogTypes.length &&
			settings.data.hiddenLogTypes.includes(entry.type)
		) {
			continue;
		}
		if (
			settings.data.hiddenLogResources.length > 0 &&
			settings.data.hiddenLogResources.includes(entry.resource || "")
		) {
			continue;
		}
		result.push(entry);
	}
	return result;
});

const textarea = ref<HTMLTextAreaElement | null>(null);
onMounted(() => {
	textarea.value?.focus();
});
watch(
	consoleContext.open,
	() => {
		if (consoleContext.open.value) {
			textarea.value?.focus();
		}
	},
	{ flush: "post" },
);

const viewport = ref<HTMLElement | null>(null);

const { measureElement, getMeasurementsCache, setMeasurementsCache } =
	injectContext(ConsoleMeasurementsContextInjectionKey);

const { pixelScale } = injectContext(PixelScaleContextInjectionKey);

const virtualizer = useVirtualizer({
	get count() {
		return entries.value.length;
	},
	getScrollElement: () => viewport.value,
	estimateSize: () => Math.round(32 * pixelScale.value),
	overscan: 4,
	get gap() {
		return Math.round(3 * pixelScale.value);
	},
	measureElement,
	initialMeasurementsCache: getMeasurementsCache(),
});

onBeforeUnmount(() => {
	setMeasurementsCache(virtualizer.value.measurementsCache);
});

const handleClear = () => {
	virtualizer.value.measurementsCache = [];
	consoleContext.clear();
};

const handleVirtualItemRefChange = (
	element: ComponentPublicInstance | Element | null,
) => {
	if (!element) return;
	virtualizer.value.measureElement(element as Element);
};

const virtualItems = computed(() => virtualizer.value.getVirtualItems());
const totalSize = computed(() => virtualizer.value.getTotalSize());

const scrollToLastEntry = () => {
	virtualizer.value.scrollToIndex(entries.value.length - 1, {
		// for some reason align: "end" doesn't work
		align: "center",
	});
};

const scrollbarWidth = ref(0);

const rs = new ResizeObserver(([entry]) => {
	if (!entry) return;
	scrollbarWidth.value =
		(entry.target as HTMLElement).offsetWidth - entry.target.clientWidth;
});
onMounted(() => {
	if (viewport.value) {
		rs.observe(viewport.value);
	}
});
onBeforeUnmount(() => rs.disconnect());

watch(
	entries,
	() => {
		const scrollElement = virtualizer.value.scrollElement;
		if (scrollElement === null) return;
		const atBottom =
			Math.abs(
				scrollElement.scrollTop +
					scrollElement.clientHeight -
					scrollElement.scrollHeight,
			) < 1;

		if (atBottom) {
			nextTick(scrollToLastEntry);
		}
	},
	{ flush: "sync" },
);

watch(consoleContext.open, () => scrollToLastEntry(), {
	flush: "post",
});

onMounted(() => nextTick(scrollToLastEntry));

const consoleHistory = injectContext(ConsoleHistoryContextInjectionKey);

function handleExecute(event: KeyboardEvent) {
	// prevent executing command when enter is pressed with shift key
	if (event.shiftKey) return;
	const command = consoleHistory.current.value.trim();
	if (command.length === 0) return;

	consoleContext.execute(command);
	consoleHistory.push(command);

	nextTick(scrollToLastEntry);
}

const isGhostEntry = (index: number) => {
	const entry = entries.value[index];
	if (!entry) return false;
	return entry.type === LogType.Info || entry.type === LogType.Debug;
};

const isSettingsOpen = ref(false);
watch(consoleContext.transparent, () => {
	if (consoleContext.transparent.value) {
		isSettingsOpen.value = false;
	}
});

const openLogFile = () => {
	alt.emit("console:openLogFile");
};
</script>

<template>
	<div
		class="relative flex h-full w-full flex-col"
		:class="{
			'opacity-75':
				consoleContext.transparent.value && !consoleContext.open.value,
		}"
	>
		<div
			v-if="consoleContext.open.value"
			class="flex justify-between border-b border-stone-600 bg-stone-700 p-1"
		>
			<div class="flex min-w-0">
				<Tooltip>
					<TooltipTrigger
						@click="handleClear()"
						class="flex rounded p-2 hover:bg-white/10 active:bg-white/15"
					>
						<BanIcon class="size-4 shrink-0 stroke-1.5 text-white/60" />
					</TooltipTrigger>
					<TooltipContent :collision-padding="0" align="start">
						Clear console
					</TooltipContent>
				</Tooltip>
				<Separator class="mx-1 my-1 w-px bg-white/15" />
				<LogTypesPopover />
				<ResourcesPopover />
			</div>
			<div class="flex">
				<Tooltip>
					<TooltipTrigger
						class="group flex rounded p-1.5 hover:bg-white/10 active:bg-white/15"
						@click="
							() => {
								consoleContext.transparent.value =
									!consoleContext.transparent.value;
								scrollToLastEntry();
							}
						"
					>
						<component
							:is="
								consoleContext.transparent.value
									? ConsoleTransparentIcon
									: ConsoleSolidIcon
							"
							class="m-px size-4.5 shrink-0 stroke-1.5 text-white/60 group-hover:text-white/75"
						/>
					</TooltipTrigger>
					<TooltipContent>
						{{
							consoleContext.transparent.value
								? "Transparent console"
								: "Solid console"
						}}
					</TooltipContent>
				</Tooltip>
				<button
					type="button"
					:data-state="isSettingsOpen ? 'open' : 'closed'"
					@click="isSettingsOpen = !isSettingsOpen"
					class="group flex rounded p-1.5 hover:bg-white/10 active:bg-white/15"
				>
					<SettingsIcon
						class="m-px size-4.5 shrink-0 text-white/60 group-hover:text-white/75 group-data-[state=open]:text-white/75"
					/>
				</button>
				<DropdownMenu :modal="false">
					<DropdownMenuTrigger
						class="group flex rounded p-1.5 hover:bg-white/10 active:bg-white/15"
					>
						<VerticalDotsIcon
							class="m-px size-4.5 shrink-0 stroke-1.5 text-white/60"
						/>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="end"
						class="tw bg-stone-500 shadow-[0px_1px_0px_0px_rgba(255,255,255,0.06)_inset]"
					>
						<DropdownMenuItem @select="openLogFile()">
							Open log file
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
		<CollapsibleRoot v-model:open="isSettingsOpen">
			<CollapsibleContent
				class="overflow-hidden border-b border-stone-600 bg-stone-800 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down"
			>
				<ConsoleSettings />
			</CollapsibleContent>
		</CollapsibleRoot>
		<div
			class="h-full w-full overflow-hidden"
			:class="{
				'bg-opacity-50':
					consoleContext.transparent.value && !consoleContext.open.value,
			}"
		>
			<AltVOutlineLogo
				v-if="entries.length === 0"
				class="mx-auto size-24 h-full text-white/10"
			/>
			<div
				ref="viewport"
				class="console-viewport overflow-y-auto overflow-x-hidden p-1 w-full h-full"
				:style="{
					paddingRight: scrollbarWidth > 0 ? '0' : undefined,
				}"
			>
				<div
					class="relative w-full overflow-hidden"
					:style="{
						height: `${totalSize}px`,
					}"
				>
					<div
						v-for="virtualItem of virtualItems"
						:key="entries[virtualItem.index]!.id"
						:data-id="entries[virtualItem.index]!.id"
						:data-index="virtualItem.index"
						:ref="handleVirtualItemRefChange"
						class="virtual-item"
						:data-ghost="isGhostEntry(virtualItem.index) ? '' : undefined"
						:style="{
							transform: `translateY(${virtualItem.start}px)`,
						}"
					>
						<ConsoleEntryItem :entry="entries[virtualItem.index]!" />
					</div>
				</div>
			</div>
		</div>
		<div
			v-if="consoleContext.open.value"
			class="flex items-start gap-1.5 bg-stone-800 p-2"
		>
			<ChevronUpIcon
				aria-hidden="true"
				class="size-4 shrink-0 translate-y-0.5 rotate-90 stroke-1.5 text-code-blue"
			/>
			<Id v-slot="{ id }">
				<textarea
					:id="id"
					ref="textarea"
					:value="consoleHistory.current.value"
					@input="
						(event) => {
							const newValue = (event.target as HTMLTextAreaElement).value;
							consoleHistory.current.value = newValue;
						}
					"
					style="field-sizing: content"
					autocomplete="off"
					autocorrect="off"
					autocapitalize="off"
					class="scrollbar-vertical w-full resize-none bg-transparent font-mono text-sm text-code-white outline-none"
					@keydown.enter.exact.prevent="handleExecute"
					@keydown.up.prevent="consoleHistory.go(1)"
					@keydown.down.prevent="consoleHistory.go(-1)"
				/>
			</Id>
		</div>
	</div>
</template>

<style>
.console-viewport::-webkit-scrollbar {
	width: 0.75rem;
}

.console-viewport::-webkit-scrollbar-thumb {
	border-width: 0.1875rem;
	border-style: solid;
	border-color: transparent;
	background-clip: padding-box;
	border-radius: 9999px;
	background-color: rgba(255, 255, 255, 0.2);
}

.console-viewport::-webkit-scrollbar-thumb:hover {
	background-color: rgba(255, 255, 255, 0.4);
}

.virtual-item {
	position: absolute;
	width: -webkit-fill-available;
	top: 0;
	left: 0;
}

.virtual-item[data-ghost] + .virtual-item[data-ghost] {
	border-top: 0.06275rem solid rgba(255, 255, 255, 0.1);
}
</style>
