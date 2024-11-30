import { describe, it, expect } from "vitest";
import { createConsoleHistoryContext } from "./history";

describe("createConsoleHistoryContext", () => {
	it("should initialize with an empty history", () => {
		const history = createConsoleHistoryContext({ maxLength: 5 });
		expect(history.entries.value).toEqual([""]);
		expect(history.current.value).toBe("");
	});

	it("should push a command into history", () => {
		const history = createConsoleHistoryContext({ maxLength: 5 });

		history.push("command1");
		expect(history.entries.value).toEqual(["", "command1"]);
		expect(history.current.value).toBe("");

		history.push("command2");
		expect(history.entries.value).toEqual(["", "command2", "command1"]);
		expect(history.current.value).toBe("");
	});

	it("should navigate history with go()", () => {
		const history = createConsoleHistoryContext({ maxLength: 5 });
		history.push("command1");
		history.push("command2");

		history.go(1);
		expect(history.currentIndex.value).toBe(1);
		history.go(1);
		expect(history.currentIndex.value).toBe(2);
		history.go(1);
		expect(history.currentIndex.value).toBe(2);

		history.go(-1);
		expect(history.currentIndex.value).toBe(1);
		history.go(-1);
		expect(history.currentIndex.value).toBe(0);
		history.go(-1);
		expect(history.currentIndex.value).toBe(0);
	});

	it("shouldn't push the entry if it's a dublicate of previous command", () => {
		const history = createConsoleHistoryContext({ maxLength: 5 });
		history.push("command1");
		history.push("command1");
		history.push("command1");

		expect(history.entries.value).toEqual(["", "command1"]);
	});
});
