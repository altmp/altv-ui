import { expect, describe, it } from "vitest";
import { RingBuffer } from "./ring-buffer";

describe("RingBuffer", () => {
	it("should add items to the buffer", () => {
		const buffer = new RingBuffer<number>(3);
		buffer.add(1, 2);
		expect(Array.from(buffer)).toEqual([1, 2]);

		buffer.add(3, 4);
		expect(Array.from(buffer)).toEqual([2, 3, 4]);
	});

	it("should get items from the buffer", () => {
		const buffer = new RingBuffer<number>(3);

		buffer.add(1, 2, 3);
		expect(buffer.get(0)).toBe(1);
		expect(buffer.get(1)).toBe(2);
		expect(buffer.get(2)).toBe(3);

		buffer.add(4);
		expect(buffer.get(0)).toBe(2);
		expect(buffer.get(1)).toBe(3);
		expect(buffer.get(2)).toBe(4);
	});

	it("should handle negative index", () => {
		const buffer = new RingBuffer<number>(3);
		buffer.add(1, 2, 3);
		expect(buffer.get(-1)).toBe(3);
		expect(buffer.get(-2)).toBe(2);
		expect(buffer.get(-3)).toBe(1);
	});

	it("should return undefined for out of bounds index", () => {
		const buffer = new RingBuffer<number>(3);
		buffer.add(1, 2, 3);
		expect(buffer.get(3)).toBe(undefined);
		expect(buffer.get(-4)).toBe(undefined);
	});

	it("should clear the buffer", () => {
		const buffer = new RingBuffer<number>(3);
		buffer.add(1, 2, 3);
		buffer.clear();
		expect(Array.from(buffer)).toEqual([]);
	});

	it("should handle adding more items than its capacity", () => {
		const buffer = new RingBuffer<number>(3);
		buffer.add(1, 2, 3, 4, 5);
		expect(Array.from(buffer)).toEqual([3, 4, 5]);
	});

	it("should handle adding items after clearing the buffer", () => {
		const buffer = new RingBuffer<number>(3);
		buffer.add(1, 2, 3);
		buffer.clear();
		buffer.add(4, 5);
		expect(buffer.get(0)).toBe(4);
		expect(buffer.get(1)).toBe(5);
		expect(buffer.get(2)).toBe(undefined);
		expect(Array.from(buffer)).toEqual([4, 5]);
	});
});
