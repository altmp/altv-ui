/**
 * A fixed-size buffer that wraps around when it reaches its capacity.
 */
export class CircularBuffer<T> implements Iterable<T> {
	/**
	 * @private Internal fixed-size buffer.
	 */
	readonly buffer: T[];
	/**
	 * @private Internal position of the buffer.
	 */
	position = 0;
	/**
	 * @readonly The number of elements in the buffer
	 */
	size = 0;

	private constructor(buffer: T[], size: number, position: number) {
		this.buffer = buffer;
		this.size = size;
		this.position = position;
	}

	static create<T>(capacity: number): CircularBuffer<T> {
		return new CircularBuffer(Array<T>(capacity), 0, 0);
	}

	static from<T>(iterable: Iterable<T>): CircularBuffer<T> {
		const buffer = [...iterable];
		return new CircularBuffer(buffer, buffer.length, 0);
	}

	get capacity(): number {
		return this.buffer.length;
	}

	/**
	 * Adds elements to the buffer.
	 *
	 * @example
	 * ```ts
	 * const buffer = CircularBuffer.from([1, 2, 3]);
	 * buffer.push(4, 5);  // [3, 4, 5]
	 * ```
	 */
	push(...items: T[]): this {
		const capacity = this.buffer.length;
		for (let i = Math.max(0, items.length - capacity); i < items.length; i++) {
			const index = (this.position + this.size + i) % capacity;
			this.buffer[index] = items[i]!;
		}

		const overlap = Math.max(this.size + items.length - capacity, 0);
		this.position = (this.position + overlap) % capacity;
		this.size = Math.min(this.size + items.length, capacity);

		return this;
	}

	/**
	 * Sets the element at the specified index.
	 * @throws {RangeError} If index is out of bounds
	 *
	 * @example
	 * ```ts
	 * const buffer = CircularBuffer.from([1, 2, 3]);
	 * buffer.set(1, 5);  // [1, 5, 3]
	 * ```
	 */
	set(index: number, item: T): this {
		if (index <= -this.size || index >= this.size) {
			throw new RangeError("Index out of bounds");
		}
		const boundedIndex = index < 0 ? this.size + index : index;
		this.buffer[(this.position + boundedIndex) % this.buffer.length] = item;

		return this;
	}

	/**
	 * @returns The element at the specified index, or `undefined` if index is out of bounds
	 *
	 * @example
	 * ```ts
	 * const buffer = CircularBuffer.from([1, 2, 3]);
	 * console.log(buffer.get(1));  // 2
	 * console.log(buffer.get(5));  // undefined
	 * console.log(buffer.get(-1));  // 3
	 * ```
	 */
	get(index: number): T | undefined {
		if (index <= -this.size - 1 || index >= this.size) {
			return undefined;
		}
		const boundedIndex = index < 0 ? this.size + index : index;
		return this.buffer[(this.position + boundedIndex) % this.buffer.length];
	}

	[Symbol.iterator](): Iterator<T, undefined> {
		let index = 0;
		return {
			next: () => {
				return index < this.size
					? {
							value:
								this.buffer[(this.position + index++) % this.buffer.length]!,
							done: false,
						}
					: { value: undefined, done: true };
			},
		};
	}

	clear() {
		this.position = 0;
		this.size = 0;
	}
}
