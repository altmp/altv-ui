import { watch, type InjectionKey } from "vue";
import type { ConsoleContext } from "./console";
import type { VirtualItem } from "@tanstack/vue-virtual";

export interface ConsoleMeasurementsContext {
	measureElement: (element: Element) => number;
	getMeasurementsCache: () => VirtualItem[];
	setMeasurementsCache: (cache: VirtualItem[]) => void;
	clearMeasurementsCache: () => void;
}

export const ConsoleMeasurementsContextKey = Symbol(
	"ConsoleMeasurementsContext",
) as InjectionKey<ConsoleMeasurementsContext>;

export function createConsoleMeasurementsContext(
	consoleContext: ConsoleContext,
): ConsoleMeasurementsContext {
	const { lastEntryId, entries } = consoleContext;

	/**
	 * We keep the cached virtual items in this context to not recompute them on every console open.
	 */
	let measurementsCache: VirtualItem[] = [];
	const setMeasurementsCache = (cache: VirtualItem[]) => {
		measurementsCache = cache;
	};
	const getMeasurementsCache = () => measurementsCache;

	const entryHeightMap = new Map<number, number>();

	let lastClearedCacheId = 0;
	watch(
		entries,
		() => {
			const invisibleEntriesCount = lastEntryId.value - entries.value.size;
			if (invisibleEntriesCount > lastClearedCacheId + entries.value.capacity) {
				for (const id of measurementsCache.keys()) {
					if (id < invisibleEntriesCount) {
						entryHeightMap.delete(id);
					}
				}
				lastClearedCacheId = invisibleEntriesCount;
			}
		},
		{ flush: "post" },
	);

	const measureElement = (element: Element): number => {
		const id = parseInt(element.getAttribute("data-id")!);
		const cachedHeight = entryHeightMap.get(id);
		if (cachedHeight !== undefined) return cachedHeight;

		const size = element.clientHeight;
		entryHeightMap.set(id, size);
		return size;
	};

	const clearMeasurementsCache = () => {
		measurementsCache = [];
		entryHeightMap.clear();
	};

	window.addEventListener("resize", () => {
		clearMeasurementsCache();
	});

	return {
		measureElement,
		getMeasurementsCache,
		setMeasurementsCache,
		clearMeasurementsCache,
	};
}
