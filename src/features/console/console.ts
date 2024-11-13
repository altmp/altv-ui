import { LogType } from "@/stores/settings";
import {
	onScopeDispose,
	readonly,
	ref,
	watch,
	type DeepReadonly,
	type InjectionKey,
	type Ref,
} from "vue";

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

export const COLORS = Object.freeze({
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
	resource: string;
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
	/**
	 * Maximum number of newlines in a single message
	 */
	maxMessageNewlines: number;
	/**
	 * Maximum length of a single message
	 */
	maxMessageLength: number;
	/**
	 * Maximum number of entries in the console
	 */
	maxEntries: number;
	/**
	 * Interval in milliseconds to pull new entries from the queue
	 */
	pullInterval: number;
}

export interface ConsoleContext {
	open: Ref<boolean>;
	transparent: Ref<boolean>;
	entries: DeepReadonly<Ref<Array<ConsoleEntry>>>;
	execute: (command: string) => void;
	clear: () => void;
	options: ConsoleContextOptions;
	lastEntryId: Readonly<Ref<number>>;
}

export const ConsoleContextInjectionKey = Symbol(
	"ConsoleContext",
) as InjectionKey<ConsoleContext>;

const defaultConsoleContextOptions: ConsoleContextOptions = Object.freeze({
	maxEntries: 300,
	maxMessageLength: 10000,
	maxMessageNewlines: 50,
	pullInterval: 16,
});

export function createConsoleContext(
	options: Partial<ConsoleContextOptions> = {},
): ConsoleContext {
	const { maxEntries, maxMessageLength, maxMessageNewlines, pullInterval } = {
		...defaultConsoleContextOptions,
		...options,
	};

	const lastEntryId = ref(0);
	const entries = ref<ConsoleEntry[]>(Array(maxEntries));

	let queue: ConsoleEntry[] = [];
	let incomingEntry: IncomingConsoleEntry | null = null;

	const push = (colorIndex: number, value: string) => {
		if (incomingEntry === null) {
			incomingEntry = {
				messageBuffer: "",
				htmlBuffer: "",
				availableCharactersCount: maxMessageLength,
				availableNewlinesCount: maxMessageNewlines,
			};
		}

		incomingEntry.messageBuffer += value;

		if (incomingEntry.availableCharactersCount < 1) {
			return;
		}

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

		if (colorIndex !== whiteColorIndex) {
			const hex = colorByIndex[colorIndex] ?? COLORS.WHITE;
			incomingEntry.htmlBuffer += `<span style="color:${hex}">${content}</span>`;
		} else {
			incomingEntry.htmlBuffer += content;
		}
	};

	const end = (resource?: string, type: LogType = LogType.Info) => {
		if (!resource) return;
		if (incomingEntry === null) return;

		const time = new Date();

		const lastEntry = queue.length > 0 ? queue.at(-1) : entries.value.at(-1);
		if (
			lastEntry &&
			lastEntry.type === type &&
			lastEntry.resource === resource &&
			lastEntry.message === incomingEntry.messageBuffer
		) {
			lastEntry.count++;
			lastEntry.time = time;

			incomingEntry = null;
			return;
		}

		incomingEntry.htmlBuffer = convertLinksToHTML(incomingEntry.htmlBuffer);
		if (incomingEntry.availableCharactersCount < 0) {
			incomingEntry.htmlBuffer += `... ${Math.abs(
				incomingEntry.availableCharactersCount,
			)} chars more ...`;
		}

		const entry: ConsoleEntry = {
			id: lastEntryId.value++,
			type,
			resource,
			message: incomingEntry.messageBuffer,
			html: incomingEntry.htmlBuffer,
			count: 1,
			time,
		};

		queue.push(entry);
		incomingEntry = null;
	};

	const intervalId = setInterval(() => {
		if (queue.length === 0) return;
		entries.value.push(...queue);
		queue = [];

		if (entries.value.length > maxEntries) {
			entries.value.splice(0, entries.value.length - maxEntries);
		}
	}, pullInterval);

	const execute = (command: string) => {
		const trimmedCommand = command.trim();
		if (trimmedCommand === "") return;
		alt.emit("console:execute", trimmedCommand);
	};

	const clear = () => {
		entries.value = [];
		queue = [];
	};

	const reset = () => {
		incomingEntry = null;
	};

	const transparent = ref(false);
	watch(transparent, () => {
		if (transparent.value) {
			open.value = false;
		}
	});
	const enableTransparentMode = () => {
		transparent.value = true;
	};

	const open = ref(false);
	watch(open, () => {
		alt.emit("console:setState", open.value);
	});
	const setOpen = (state?: boolean) => {
		if (state !== undefined) {
			open.value = state;
		}
	};

	alt.on("console:open", setOpen);
	alt.on("console:forceTransparent", enableTransparentMode);

	alt.on("console:clear", clear);
	alt.on("console:reset", reset);
	alt.on("console:end", end);
	alt.on("console:push", push);

	onScopeDispose(() => {
		alt.off("console:open", setOpen);
		alt.off("console:forceTransparent", enableTransparentMode);

		clearInterval(intervalId);
		alt.off("console:clear", clear);
		alt.off("console:reset", reset);
		alt.off("console:end", end);
		alt.off("console:push", push);
	});

	return {
		entries: readonly(entries),
		execute,
		clear,
		open,
		transparent,
		options: {
			...defaultConsoleContextOptions,
			...options,
		},
		lastEntryId: readonly(lastEntryId),
	};
}