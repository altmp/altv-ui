import { putTime } from "@/features/console/put-time";
import { useSettingsStore } from "@/stores/settings";
import { computed, watch, type ComputedRef, type InjectionKey } from "vue";

export interface ConsoleTimeFormatContext {
	useFormattedTime: (time: Date) => ComputedRef<string>;
}

export const ConsoleTimeFormatContextInjectionKey = Symbol(
	"ConsoleTimeFormatContext",
) as InjectionKey<ConsoleTimeFormatContext>;

class Removable<T> {
	public readonly timeoutId: ReturnType<typeof setTimeout>;

	constructor(
		private _value: T,
		private readonly remove: () => void,
		ttl: number,
	) {
		this.timeoutId = setTimeout(() => this.remove(), ttl);
	}

	get value(): T {
		return this._value;
	}
}

export function createConsoleTimeFormatContext(): ConsoleTimeFormatContext {
	const settings = useSettingsStore();
	const formattedTimeCache = new Map<number, Removable<string>>();

	watch(
		() => settings.data.logTimeFormat,
		() => {
			for (const value of formattedTimeCache.values()) {
				clearTimeout(value.timeoutId);
			}
			formattedTimeCache.clear();
		},
	);

	const formatTime = (date: Date, format: string): string => {
		const timestamp = Math.floor(date.getTime() / 1000);

		const existingEntry = formattedTimeCache.get(timestamp);
		if (existingEntry) return existingEntry.value;

		const formattedTime = putTime(date, format);
		formattedTimeCache.set(
			timestamp,
			new Removable(
				formattedTime,
				() => formattedTimeCache.delete(timestamp),
				10000,
			),
		);
		return formattedTime;
	};

	return {
		useFormattedTime: (time: Date) =>
			computed(() => formatTime(time, settings.data.logTimeFormat)),
	};
}
