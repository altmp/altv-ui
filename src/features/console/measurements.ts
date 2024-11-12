import { watch, type InjectionKey } from "vue";
import type { ConsoleContext } from "./console";
import type { VirtualItem } from "@tanstack/vue-virtual";

interface ConsoleElementMeasurementsContext {
	measureElement: (element: Element) => number;
	getMeasurementsCache: () => VirtualItem[];
	setMeasurementsCache: (cache: VirtualItem[]) => void;
	clearMeasurementsCache: () => void;
}

export const ConsoleElementMeasurementsContextInjectionKey = Symbol(
	"ConsoleElementMeasurementsContext",
) as InjectionKey<ConsoleElementMeasurementsContext>;

class CircularBuffer {
	public buffer: Float32Array;
	public size: number;
	public pos = 0;

	constructor(public readonly capacity: number) {
		this.buffer = new Float32Array(capacity);
		this.head = 0;
		this.tail = 0;
	}

	get(index: number): number | undefined {
		if (index >= this.size()) return;
		return this.buffer[(this.head + index) % this.buffer.length]!;
	}

	add(value: number) {
		this.buffer[this.tail] = value;
		this.tail = (this.tail + 1) % this.buffer.length;
		if (this.tail === this.head) {
			this.head = (this.head + 1) % this.buffer.length;
		}
	}

	shift(count: number) {
		const size = this.size();
		if (size === 0) return;
		this.head = (this.head + Math.min(count, size)) % this.buffer.length;
	}

	clear() {
		this.head = 0;
		this.tail = 0;
	}
}

export function createConsoleElementMeasurementsContext(
	consoleContext: ConsoleContext,
): ConsoleElementMeasurementsContext {
	const { options } = consoleContext;

	/**
	 * We keep the cached virtual items in this context to not recompute them on every console open.
	 */
	let measurementsCache: VirtualItem[] = [];
	const setMeasurementsCache = (cache: VirtualItem[]) => {
		measurementsCache = cache;
	};
	const getMeasurementsCache = () => measurementsCache;

	const entryHeightById = new CircularBuffer(20);
	let lastId = 0;

	const measureElement = (element: Element) => {
		const id = parseInt(element.getAttribute("data-id")!);

		if (id <= lastId) {
			const cachedHeight = entryHeightById.get(id % 20);
			if (cachedHeight) return cachedHeight;
		}

		const size = element.clientHeight;
		entryHeightById.add(size);
		console.log("calculate height for", id);
		lastId = id;
		console.log(
			Array.from(entryHeightById.buffer),
			entryHeightById.head,
			entryHeightById.tail,
		);
		return size;
	};

	const clearMeasurementsCache = () => {
		measurementsCache = [];
		entryHeightById.clear();
	};

	return {
		measureElement,
		getMeasurementsCache,
		setMeasurementsCache,
		clearMeasurementsCache,
	};
}
