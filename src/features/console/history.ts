import { injectContext } from "@/utils/injectContext";
import {
	readonly,
	ref,
	type DeepReadonly,
	type InjectionKey,
	type Ref,
} from "vue";

export interface ConsoleHistoryContext {
	entries: DeepReadonly<Ref<string[]>>;
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
		entries: readonly(entries),
		addEntry,
	};
}

export const useConsoleHistoryIndex = () => {
	const consoleHistory = injectContext(ConsoleHistoryContextInjectionKey);
	const historyIndex = ref(-1);

	const moveHistoryIndex = (mod: number) => {
		const newIndex = Math.min(
			Math.max(historyIndex.value + mod, -1),
			consoleHistory.entries.value.length - 1,
		);

		historyIndex.value = newIndex;
	};

	return { historyIndex, moveHistoryIndex };
};
