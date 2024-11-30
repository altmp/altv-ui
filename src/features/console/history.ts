import {
	computed,
	readonly,
	ref,
	type DeepReadonly,
	type InjectionKey,
	type Ref,
} from "vue";

export interface ConsoleHistoryContext {
	entries: DeepReadonly<Ref<string[]>>;
	current: Ref<string>;
	currentIndex: Readonly<Ref<number>>;
	go: (delta: number) => void;
	push: (command: string) => void;
}

export const ConsoleHistoryContextInjectionKey = Symbol(
	"ConsoleHistoryContext",
) as InjectionKey<ConsoleHistoryContext>;

export function createConsoleHistoryContext(options: {
	maxLength: number;
}): ConsoleHistoryContext {
	const entries = ref<string[]>([""]);
	const currentIndex = ref(0);

	const go = (delta: number) => {
		currentIndex.value = Math.min(
			Math.max(currentIndex.value + delta, 0),
			entries.value.length - 1,
		);
	};

	const push = (command: string) => {
		// Avoid duplicating the most recent entry in history
		if (entries.value.length > 1 && command === entries.value[1]) {
			currentIndex.value = 0;
			entries.value[0] = "";
			return;
		}

		currentIndex.value = 0;
		entries.value[0] = command;
		entries.value.unshift("");
		while (entries.value.length > options.maxLength) {
			entries.value.pop();
		}

		console.log(entries.value);
	};

	const current = computed({
		get: () => {
			return entries.value[currentIndex.value]!;
		},
		set: (newValue) => {
			if (currentIndex.value > 0) {
				currentIndex.value = 0;
				entries.value[0] = newValue;
			} else {
				entries.value[currentIndex.value] = newValue;
			}
		},
	});

	return {
		current,
		currentIndex: readonly(currentIndex),
		entries: readonly(entries),
		go,
		push,
	};
}
