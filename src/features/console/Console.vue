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
import {
	ScrollArea,
	ScrollAreaScrollbar,
	ScrollAreaViewport,
} from "@/components/ui/scroll-area";
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
import {
	ConsoleHistoryContextInjectionKey,
	useConsoleHistoryIndex,
} from "./history";
import { Id } from "@/components/ui/id";
import { ConsoleMeasurementsContextInjectionKey } from "./measurements";
import ConsoleTransparentIcon from "@/icons/console-transparent.svg?component";
import ConsoleSolidIcon from "@/icons/console-solid.svg?component";
import { injectContext } from "@/utils/injectContext";
import { LogType, useSettingsStore } from "@/stores/settings";

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
			settings.data.hiddenLogResources.includes(entry.resource)
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

const viewport = ref<InstanceType<typeof ScrollAreaViewport> | null>(null);

/**
 * Improved version of the defaultRangeExtractor function from @tanstack/virtual-core which allocates the memory once, instead of resizing an empty array.
 * 
 * @see https://github.com/TanStack/virtual/blob/47ecdc7522c6c2d0d480224dbfb97cf4edb1745b/packages/virtual-core/src/index.ts#L49-L60
 */
const rangeExtractor = (range: Range): number[] => {
	const start = Math.max(range.startIndex - range.overscan, 0)
	const end = Math.min(range.endIndex + range.overscan, range.count - 1)

	const arr = new Array<number>(end - start + 1)
	for (let i = 0; i < arr.length; i++) {
		arr[i] = i + start
	}
	return arr;
}

const { measureElement, getMeasurementsCache, setMeasurementsCache } =
	injectContext(ConsoleMeasurementsContextInjectionKey);

const virtualizer = useVirtualizer({
	get count() {
		return entries.value.length;
	},
	getScrollElement: () => {
		return viewport.value?.viewportElement || null;
	},
	estimateSize: () => 0,
	overscan: 4,
	paddingStart: 2,
	paddingEnd: 2,
	measureElement,
	rangeExtractor,
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
		align: "center",
	});
};

watch(
	entries,
	() => {
		if (virtualizer.value.scrollElement === null) return;
		const atBottom =
			Math.abs(
				virtualizer.value.scrollElement.scrollTop +
					virtualizer.value.scrollElement.clientHeight -
					virtualizer.value.scrollElement.scrollHeight,
			) < 1;

		if (atBottom) {
			nextTick(scrollToLastEntry);
		}
	},
	{ flush: "sync" },
);

watch(consoleContext.open, () => nextTick(scrollToLastEntry), {
	flush: "sync",
});

onMounted(() => nextTick(scrollToLastEntry));

const consoleHistory = injectContext(ConsoleHistoryContextInjectionKey);
const { historyIndex, moveHistoryIndex } = useConsoleHistoryIndex();

const _command = ref("");
const command = computed({
	get: () =>
		historyIndex.value === -1
			? _command.value
			: consoleHistory.entries.value[historyIndex.value]!,
	set: (newValue) => {
		historyIndex.value = -1;
		_command.value = newValue;
	},
});

function handleExecute(event: KeyboardEvent) {
	// prevent executing command when enter is pressed with shift key
	if (event.shiftKey) return;
	if (command.value.length === 0) return;

	consoleContext.execute(command.value);
	consoleHistory.addEntry(command.value);
	command.value = "";
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
				<button></button>
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
					<DropdownMenuContent align="end" class="tw">
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
		<ScrollArea
			class="h-full w-full overflow-hidden bg-stone-900 px-1"
			:class="{
				'bg-opacity-50':
					consoleContext.transparent.value && !consoleContext.open.value,
			}"
		>
			<AltVOutlineLogo
				v-if="entries.length === 0"
				class="mx-auto size-24 h-full text-white/10"
			/>
			<ScrollAreaViewport
				ref="viewport"
				class="h-full w-full overflow-y-auto overflow-x-hidden outline-none"
				style="overflow-anchor: none"
			>
				<ul
					class="relative w-full overflow-hidden"
					:style="{
						height: `${totalSize}px`,
					}"
				>
					<li
						v-for="virtualItem of virtualItems"
						:key="entries[virtualItem.index]!.id"
						:data-id="entries[virtualItem.index]!.id"
						:data-index="virtualItem.index"
						:ref="handleVirtualItemRefChange"
						class="absolute left-0 top-0 w-full border-t border-transparent [&[data-ghost]_+_&[data-ghost]]:border-stone-500 py-px"
						:data-ghost="isGhostEntry(virtualItem.index) ? '' : undefined"
						:style="{
							transform: `translateY(${virtualItem.start}px)`,
						}"
					>
						<ConsoleEntryItem :entry="entries[virtualItem.index]!" />
					</li>
				</ul>
			</ScrollAreaViewport>
			<ScrollAreaScrollbar :style="{ '--scrollbar-size': '0.75rem' }" />
		</ScrollArea>
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
					v-model="command"
					style="field-sizing: content"
					autocomplete="off"
					autocorrect="off"
					autocapitalize="off"
					class="scrollbar-vertical w-full resize-none bg-transparent font-mono text-sm text-code-white outline-none"
					@keydown.enter.exact.prevent="handleExecute"
					@keydown.up.prevent="moveHistoryIndex(1)"
					@keydown.down.prevent="moveHistoryIndex(-1)"
				/>
			</Id>
		</div>
	</div>
</template>
