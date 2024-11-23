import { LogType } from "@/stores/settings";
import {
	onScopeDispose,
	readonly,
	ref,
	shallowRef,
	triggerRef,
	watch,
	type InjectionKey,
	type Ref,
	type ShallowRef,
} from "vue";
import { RingBuffer } from "./ring-buffer";

const useAltListener = (event: string, listener: (...args: any[]) => void) => {
	alt.on(event, listener);
	onScopeDispose(() => {
		alt.off(event, listener);
	});
};

export const logTypeByName = Object.freeze({
	info: LogType.Info,
	warning: LogType.Warning,
	error: LogType.Error,
	debug: LogType.Debug,
} satisfies Record<string, LogType>);
export type LogTypeName = keyof typeof logTypeByName;

export const logTypes = Object.freeze(Object.values(logTypeByName)) as Readonly<
	LogType[]
>;
export const logNameByType = Object.freeze(
	Object.keys(logTypeByName),
) as Readonly<LogTypeName[]>;

export function nthIndexOf(str: string, substr: string, n: number): number {
	let i = -1;

	while (n-- && i++ < str.length) {
		i = str.indexOf(substr, i);
		if (i < 0) break;
	}

	return i;
}

const htmlEntities = Object.freeze({
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&quot;",
	"'": "&#39;",
});

export function stripHtml(string: string): string {
	return string.replace(
		/[&<>"']/g,
		(match) => htmlEntities[match as keyof typeof htmlEntities],
	);
}

export function convertLinksToHTML(string: string): string {
	return string.replace(
		/https?:\/\/[^\s/$.?#].[^\s]*/g,
		'<a href="$&" target="_blank">$&</a>',
	);
}

export function getNewlinesCount(str: string): number {
	return (str.match(/\n/g) || []).length;
}

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
const whiteColorIndex = colorByIndex.indexOf(COLORS.WHITE);

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

interface IncomingConsoleEntry {
	/**
	 * Original message buffer without any processing.
	 */
	messageBuffer: string;
	/**
	 * Formatted, truncated, and escaped version of the message buffer.
	 */
	htmlBuffer: string;
	/**
	 * Remaining number of newlines allowed before the message is truncated.
	 */
	availableNewlinesCount: number;
	/**
	 * Remaining character count allowed before the message is truncated.
	 */
	availableCharactersCount: number;
}

export interface ConsoleContextOptions {
	maxMessageNewlines: number;
	maxMessageLength: number;
	maxEntries: number;
}

export interface ConsoleContext {
	open: Ref<boolean>;
	transparent: Ref<boolean>;
	entries: ShallowRef<RingBuffer<ConsoleEntry>>;
	execute: (command: string) => void;
	clear: () => void;
	options: ConsoleContextOptions;
	lastEntryId: Readonly<Ref<number>>;
}

export const ConsoleContextInjectionKey = Symbol(
	"ConsoleContext",
) as InjectionKey<ConsoleContext>;

export function createConsoleContext(
	options: ConsoleContextOptions,
): ConsoleContext {
	const { maxEntries, maxMessageLength, maxMessageNewlines } = options;

	const lastEntryId = ref(0);
	const queue: ConsoleEntry[] = [];
	const entries = shallowRef(new RingBuffer(maxEntries)) as ShallowRef<
		RingBuffer<ConsoleEntry>
	>;

	let incomingEntry: IncomingConsoleEntry | null = null;

	useAltListener("console:push", (colorIndex: number, value: string) => {
		if (incomingEntry === null) {
			incomingEntry = {
				messageBuffer: "",
				htmlBuffer: "",
				availableCharactersCount: maxMessageLength,
				availableNewlinesCount: maxMessageNewlines,
			};
		}

		incomingEntry.messageBuffer += value;

		if (incomingEntry.availableCharactersCount < 1) return;

		let content = stripHtml(value);

		if (incomingEntry.availableCharactersCount - content.length < 0) {
			content = content.slice(0, incomingEntry.availableCharactersCount);
		}
		incomingEntry.availableCharactersCount -= content.length;

		const newlinesCount = getNewlinesCount(content);
		if (incomingEntry.availableNewlinesCount - newlinesCount < 0) {
			const lastNewlineIndex = nthIndexOf(
				content,
				"\n",
				incomingEntry.availableNewlinesCount,
			);
			content = content.slice(0, lastNewlineIndex + 1);
		}
		incomingEntry.availableNewlinesCount -= newlinesCount;

		if (colorIndex === whiteColorIndex) {
			incomingEntry.htmlBuffer += content;
			return;
		}
		const color = colorByIndex[colorIndex] ?? COLORS.WHITE;
		incomingEntry.htmlBuffer += `<span style="color:${color}">${content}</span>`;
	});

	useAltListener(
		"console:end",
		(resource?: string, type: LogType = LogType.Info) => {
			if (incomingEntry === null) return;

			const time = new Date();
			const lastEntry = queue.length
				? queue[queue.length - 1]
				: entries.value.get(entries.value.size - 1);
			if (
				lastEntry &&
				lastEntry.type === type &&
				lastEntry.resource === resource &&
				lastEntry.message === incomingEntry.messageBuffer
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

			incomingEntry.htmlBuffer = convertLinksToHTML(incomingEntry.htmlBuffer);
			if (incomingEntry.availableCharactersCount < 0) {
				incomingEntry.htmlBuffer += `... ${Math.abs(
					incomingEntry.availableCharactersCount,
				)} chars more ...`;
			}

			queue.push({
				id: lastEntryId.value++,
				type,
				resource,
				message: incomingEntry.messageBuffer,
				html: incomingEntry.htmlBuffer,
				count: 1,
				time,
			});
			incomingEntry = null;
		},
	);

	let lastRenderedEntryCount = 1;
	const update = () => {
		if (queue.length) {
			const lastEntry = queue[queue.length - 1]!;
			lastRenderedEntryCount = lastEntry.count;
			entries.value.push(...queue);
			queue.length = 0;

			triggerRef(entries);
			requestAnimationFrame(update);
			return;
		}

		const lastEntry = entries.value.get(entries.value.size - 1);
		if (lastEntry && lastRenderedEntryCount !== lastEntry.count) {
			lastRenderedEntryCount = lastEntry.count;
			triggerRef(entries);
		}
		requestAnimationFrame(update);
	};
	requestAnimationFrame(update);

	const execute = (command: string) => {
		const trimmedCommand = command.trim();
		if (trimmedCommand === "") return;
		alt.emit("console:execute", trimmedCommand);
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

	const transparent = ref(false);
	watch(transparent, () => {
		if (transparent.value) {
			open.value = false;
		}
	});
	useAltListener("console:forceTransparent", () => {
		transparent.value = true;
	});

	const open = ref(false);
	watch(open, () => {
		alt.emit("console:setState", open.value);
	});
	useAltListener("console:open", (state?: boolean) => {
		if (state !== undefined) {
			open.value = state;
		}
	});

	return {
		entries,
		execute,
		clear,
		open,
		transparent,
		options,
		lastEntryId: readonly(lastEntryId),
	};
}
