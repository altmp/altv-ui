import { LogType } from "@/stores/settings";
import {
	computed,
	onScopeDispose,
	readonly,
	ref,
	shallowRef,
	triggerRef,
	watch,
	type ComputedRef,
	type InjectionKey,
	type Ref,
	type ShallowRef,
} from "vue";
import { useIntervalFn } from "@vueuse/core";
import { CircularBuffer } from "./circular-buffer";
import {
	IncomingConsoleEntry,
	type IncomingConsoleEntrySettings,
} from "./incoming-console-entry";

function useAltListener(event: string, listener: (...args: any[]) => void) {
	alt.on(event, listener);
	onScopeDispose(() => alt.off(event, listener));
}

export interface ConsoleEntry {
	id: number;
	type: LogType;
	/**
	 * If resource is undefined, then this log is from alt:V core
	 */
	resource?: string;
	message: string;
	/**
	 * HTML representation of the message
	 */
	html: string;
	/**
	 * Number of identical messages received in a row
	 */
	count: number;
	/**
	 * Time when the message was received.
	 * If there are multiple identical messages, the time of the last message is used
	 */
	time: Date;
}

export interface ConsoleContextSettings extends IncomingConsoleEntrySettings {
	maxEntries: number;
	pullInterval: number;
}

export interface ConsoleContext {
	open: Ref<boolean>;
	mode: Ref<"default" | "transparent">;
	visible: ComputedRef<boolean>;
	entries: ShallowRef<CircularBuffer<ConsoleEntry>>;
	execute: (command: string) => void;
	clear: () => void;
	lastEntryId: Readonly<Ref<number>>;
}

export const ConsoleContextKey = Symbol(
	"ConsoleContext",
) as InjectionKey<ConsoleContext>;

export function createConsoleContext(
	settings: ConsoleContextSettings,
): ConsoleContext {
	const lastEntryId = ref(0);
	const queue: ConsoleEntry[] = [];
	const entries = shallowRef(
		CircularBuffer.create(settings.maxEntries),
	) as ShallowRef<CircularBuffer<ConsoleEntry>>;

	let incomingEntry: IncomingConsoleEntry | null = null;

	const open = ref(false);
	useAltListener("console:open", (state?: boolean) => {
		if (typeof state === "boolean") {
			open.value = state;
		}
	});

	const mode = ref<"default" | "transparent">("default");
	useAltListener("console:forceTransparent", () => {
		mode.value = "transparent";
	});

	useAltListener(
		"console:push",
		(colorIndex: number, messageFragment: string) => {
			if (incomingEntry === null) {
				incomingEntry = IncomingConsoleEntry.create(settings);
			}

			incomingEntry.push(messageFragment, colorIndex);
		},
	);

	useAltListener(
		"console:end",
		(resource?: string, type: LogType = LogType.Info) => {
			if (incomingEntry === null) return;

			const time = new Date();
			const lastEntry = queue.length
				? queue[queue.length - 1]
				: entries.value.get(-1);

			if (
				lastEntry &&
				lastEntry.type === type &&
				lastEntry.resource === resource &&
				lastEntry.message === incomingEntry.originalMessage
			) {
				if (queue.length) {
					lastEntry.count++;
					lastEntry.time = time;
				} else {
					// Vue's shallowRef requires replacing the object to ensure reactivity
					entries.value.set(entries.value.size - 1, {
						id: lastEntry.id,
						type: lastEntry.type,
						resource: lastEntry.resource,
						message: lastEntry.message,
						html: lastEntry.html,
						count: ++lastEntry.count,
						time,
					});
				}

				incomingEntry = null;
				return;
			}

			const { originalMessage, formattedMessage } = incomingEntry.end();
			incomingEntry = null;

			queue.push({
				id: lastEntryId.value++,
				type,
				resource,
				message: originalMessage,
				html: formattedMessage,
				count: 1,
				time,
			});
		},
	);

	let lastRenderedEntryCount = 1;
	const interval = useIntervalFn(
		() => {
			if (queue.length) {
				const lastEntry = queue[queue.length - 1]!;
				lastRenderedEntryCount = lastEntry.count;
				entries.value.push(...queue);
				queue.length = 0;

				triggerRef(entries);
				return;
			}

			const lastEntry = entries.value.get(-1);
			if (lastEntry && lastRenderedEntryCount !== lastEntry.count) {
				lastRenderedEntryCount = lastEntry.count;
				triggerRef(entries);
			}
		},
		settings.pullInterval,
		{ immediate: false },
	);

	const visible = computed(() => open.value || mode.value === "transparent");
	watch(visible, (visible) => {
		if (visible) {
			interval.resume();
		} else {
			interval.pause();
		}
	});

	const execute = (command: string) => {
		alt.emit("console:execute", command);
	};

	const clear = () => {
		entries.value.clear();
		triggerRef(entries);
		queue.length = 0;
	};
	useAltListener("console:clear", clear);

	useAltListener("console:reset", () => {
		incomingEntry = null;
	});

	return {
		entries,
		execute,
		clear,
		open: computed({
			get: () => open.value,
			set: (state) => {
				alt.emit("console:setState", state);
				open.value = state;
			},
		}),
		visible,
		mode,
		lastEntryId: readonly(lastEntryId),
	};
}
