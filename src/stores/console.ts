import { injectContext } from "@/utils/injectContext";
import {
	computed,
	onScopeDispose,
	readonly,
	ref,
	watch,
	type ComputedRef,
	type DeepReadonly,
	type InjectionKey,
	type Ref,
} from "vue";
import { putTime } from "@/utils/put-time";
import { useSettingsStore } from "./settings";
import { useLocalization } from "./localization";

export const enum LogType {
	Info,
	Warning,
	Error,
	Debug,
}

export const logTypeByName = {
	info: LogType.Info,
	warning: LogType.Warning,
	error: LogType.Error,
	debug: LogType.Debug,
} as const satisfies Record<string, LogType>;
export type LogTypeName = keyof typeof logTypeByName;

export const logNameByType = Object.keys(logTypeByName) as LogTypeName[];

function nthIndexOf(str: string, substr: string, n: number): number {
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

function stripHtml(string: string): string {
	return string.replace(
		/[&<>"']/g,
		(match) => htmlEntities[match as keyof typeof htmlEntities],
	);
}

function convertLinksToHTML(string: string): string {
	return string.replace(
		/https?:\/\/[^\s/$.?#].[^\s]*/g,
		'<a href="$&" target="_blank">$&</a>',
	)!;
}

function getNewlinesCount(str: string): number {
	let count = 0;
	for (let i = 0; i < str.length; i++) {
		if (str[i] == "\n") {
			++count;
		}
	}
	return count;
}

const colors = Object.freeze({
	/** BLACK */ k: "#1e1e1e",
	/** LBLACK */ lk: "#666666",
	/** RED */ r: "#bd3f39",
	/** LRED */ lr: "#df5853",
	/** GREEN */ g: "#55b87f",
	/** LGREEN */ lg: "#63cd91",
	/** BLUE */ b: "#3972c2",
	/** LBLUE */ lb: "#508ee3",
	/** YELLOW */ y: "#e6e34d",
	/** LYELLOW */ ly: "#f6f366",
	/** MAGENTA */ m: "#ae4cb6",
	/** LMAGENTA */ lm: "#c978d1",
	/** CYAN */ c: "#4ba6c9",
	/** LCYAN */ lc: "#59b6d7",
	/** WHITE */ w: "#C0C0C0",
	/** LWHITE */ lw: "#FFFFFF",
});

const colorByIndex = Object.freeze(Object.values(colors));
const whiteColorIndex = 14;

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
	 * Time when the message was received represented with UTC timestamp
	 * If there are multiple identical messages, the time of the last message is used
	 */
	time: number;
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

export interface ConsoleContext {
	open: Ref<boolean>;
	transparent: Ref<boolean>;
	entries: DeepReadonly<Ref<Array<ConsoleEntry>>>;
	execute: (command: string) => void;
	clear: () => void;
}

export const ConsoleContextInjectionKey = Symbol(
	"ConsoleContext",
) as InjectionKey<ConsoleContext>;

export function createConsoleContext(options: {
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
}): ConsoleContext {
	const { maxEntries, maxMessageLength, maxMessageNewlines } = options;

	let lastEntryId = 0;
	const entries = ref<ConsoleEntry[]>([]);

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
			const hex = colorByIndex[colorIndex] ?? colors.w;
			incomingEntry.htmlBuffer += `<span style="color:${hex}">${content}</span>`;
		} else {
			incomingEntry.htmlBuffer += content;
		}
	};

	const end = (resource?: string, type: LogType = LogType.Info) => {
		if (!resource) return;
		if (incomingEntry === null) return;

		const time = Math.floor(new Date().getTime() / 1000);

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
			id: lastEntryId++,
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
		entries.value = [...entries.value, ...queue];
		queue = [];

		if (entries.value.length > maxEntries) {
			const startIndex = entries.value.length - maxEntries;
			entries.value = entries.value.slice(startIndex);
		}
	}, 16);

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
	};
}

export interface ConsoleTimeFormatContext {
	timeFormat: ComputedRef<string>;
	useFormattedTime: (timestamp: Ref<number>) => ComputedRef<string>;
}

export const ConsoleTimeFormatContextInjectionKey = Symbol(
	"ConsoleTimeFormatContext",
) as InjectionKey<ConsoleTimeFormatContext>;

export const createConsoleTimeFormatContext = (options: {
	/**
	 * Time in milliseconds after which the formatted time is removed from the cache
	 */
	cacheTime: number;
}) => {
	const settings = useSettingsStore();
	const localization = useLocalization();

	const formattedTimeCache = new Map<number, string>();
	const timeFormat = computed(() => settings.data.logTimeFormat);

	watch([timeFormat, localization.currentLocale], () => {
		formattedTimeCache.clear();
	});

	const formatTime = (timestamp: number, format: string, locale?: string) => {
		const cachedTime = formattedTimeCache.get(timestamp);
		if (cachedTime) {
			return cachedTime;
		}

		const formattedTime = putTime(new Date(timestamp * 1000), format, locale);
		formattedTimeCache.set(timestamp, formattedTime);
		setTimeout(() => {
			formattedTimeCache.delete(timestamp);
		}, options.cacheTime);
		return formattedTime;
	};

	const useFormattedTime = (timestamp: Ref<number>) => {
		return computed(() =>
			formatTime(
				timestamp.value,
				timeFormat.value,
				localization.currentLocale.intlCode,
			),
		);
	};

	return {
		timeFormat,
		useFormattedTime,
	};
};

export const useConsoleHistoryIndex = () => {
	const consoleHistory = injectContext(ConsoleHistoryContextInjectionKey);
	const historyIndex = ref(-1);

	const moveHistoryIndex = (mod: number) => {
		const newIndex = Math.min(
			Math.max(historyIndex.value + mod, -1),
			consoleHistory.entires.value.length - 1,
		);

		historyIndex.value = newIndex;
	};

	return { historyIndex, moveHistoryIndex };
};

export interface ConsoleHistoryContext {
	entires: DeepReadonly<Ref<string[]>>;
	addEntry: (entry: string) => void;
}

export const ConsoleHistoryContextInjectionKey = Symbol(
	"ConsoleHistoryContext",
) as InjectionKey<ConsoleHistoryContext>;

export function createConsoleHistoryContext(options: {
	/**
	 * Maximum number of remembered entries
	 */
	maxLength: number;
}): ConsoleHistoryContext {
	const { maxLength } = options;

	const entries = ref<string[]>([]);

	const addEntry = (entry: string) => {
		if (entries.value[0] === entry) return;
		entries.value.unshift(entry);
		while (entries.value.length > maxLength) entries.value.pop();
	};

	return {
		entires: readonly(entries),
		addEntry,
	};
}
