export class RingBuffer<T> implements Iterable<T> {
	private _buffer: T[];
	private _size = 0;
	private _position = 0;

	constructor(capacity: number) {
		this._buffer = new Array<T>(capacity);
	}

	get size(): number {
		return this._size;
	}

	get capacity(): number {
		return this._buffer.length;
	}

	get position(): number {
		return this._position;
	}

	public push(...items: T[]): void {
		const capacity = this._buffer.length;
		for (let i = 0; i < items.length; i++) {
			const index = (this._position + this._size + i) % capacity;
			this._buffer[index] = items[i]!;
		}

		const overlap = Math.max(this._size + items.length - capacity, 0);
		this._position = (this._position + overlap) % capacity;
		this._size = Math.min(this.size + items.length, capacity);
	}

	public set(index: number, item: T): void {
		if (index < 0 || index >= this._size) {
			throw new Error("Index out of bounds");
		}
		this._buffer[(this._position + index) % this._buffer.length] = item;
	}

	public get(index: number): T | undefined {
		if (index < 0 || index >= this._size) {
			return undefined;
		}
		return this._buffer[(this._position + index) % this._buffer.length];
	}

	[Symbol.iterator](): Iterator<T, undefined> {
		let index = 0;
		return {
			next: () => {
				if (index < this._size) {
					return { value: this.get(index++)!, done: false };
				}
				return { value: undefined, done: true };
			},
		};
	}

	public clear(): void {
		this._position = 0;
		this._size = 0;
	}
}
