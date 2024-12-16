import { putTime } from "@/features/console/put-time";
import { useSettingsStore } from "@/stores/settings";
import { computed, watch, type ComputedRef, type InjectionKey } from "vue";
import type { ConsoleContext } from "./console";

export interface ConsoleTimeFormatContext {
	useFormattedTime: (time: Date) => ComputedRef<string>;
}

export const ConsoleTimeFormatContextInjectionKey = Symbol(
	"ConsoleTimeFormatContext",
) as InjectionKey<ConsoleTimeFormatContext>;

export function createConsoleTimeFormatContext(
	consoleContext: ConsoleContext,
): ConsoleTimeFormatContext {
	const { entries, lastEntryId } = consoleContext;
	const settings = useSettingsStore();

	/**
	 * Seconds since epoch to formatted time string cache.
	 * 1732362366 => "12:03:56"
	 */
	const timeFormatCache = new Map<number, string>();
	watch(
		() => settings.data.logTimeFormat,
		() => timeFormatCache.clear(),
	);

	const MAX_CACHE_SIZE = 60;
	let lastClearedEntryId = 0;
	watch(entries, () => {
		const invisibleEntriesCount = lastEntryId.value - entries.value.size;
		if (
			invisibleEntriesCount > lastClearedEntryId + entries.value.capacity &&
			timeFormatCache.size > MAX_CACHE_SIZE
		) {
			lastClearedEntryId = invisibleEntriesCount;
			const highestInvisibleEntryTimestamp =
				entries.value.get(0)!.time.getTime() / 1000 - 1;

			for (const timestamp of timeFormatCache.keys()) {
				if (timestamp > highestInvisibleEntryTimestamp) break;
				timeFormatCache.delete(timestamp);
			}
		}
	});

	const putTimeWithCache = (date: Date, format: string): string => {
		const timestamp = Math.floor(date.getTime() / 1000);

		const cachedTime = timeFormatCache.get(timestamp);
		if (cachedTime) return cachedTime;

		const formattedTime = putTime(date, format);
		timeFormatCache.set(timestamp, formattedTime);
		return formattedTime;
	};

	return {
		useFormattedTime: (time: Date) =>
			computed(() => putTimeWithCache(time, settings.data.logTimeFormat)),
	};
}
