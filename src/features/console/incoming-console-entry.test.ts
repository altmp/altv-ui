import { describe, expect, it } from "vitest";
import {
	transformUrlsToHtmlAnchors,
	getNewlinesCount,
	nthIndexOf,
	escapeHtml,
	IncomingConsoleEntry,
	type IncomingConsoleEntrySettings,
} from "./incoming-console-entry";

describe("nthIndexOf", () => {
	it("should return the correct index of the nth occurrence of a substring", () => {
		expect(nthIndexOf("hello world hello world", "world", 1)).toBe(6);
		expect(nthIndexOf("hello world hello world", "world", 2)).toBe(18);
		expect(nthIndexOf("hello world hello world", "world", 3)).toBe(-1);
		expect(nthIndexOf("hello world", "hello", 1)).toBe(0);
		expect(nthIndexOf("hello world", "hello", 2)).toBe(-1);
	});
});

describe("escapeHtml", () => {
	it("should replace HTML entities with their corresponding characters", () => {
		expect(escapeHtml("<div>Hello & World</div>")).toBe(
			"&lt;div&gt;Hello &amp; World&lt;/div&gt;",
		);
		expect(escapeHtml('He said "Hello"')).toBe("He said &quot;Hello&quot;");
		expect(escapeHtml("It's a test")).toBe("It&#39;s a test");
	});
});

describe("transformUrlsToHtmlAnchors", () => {
	it("should convert URLs to HTML anchor tags", () => {
		expect(transformUrlsToHtmlAnchors("Visit https://example.com")).toBe(
			'Visit <a href="https://example.com" target="_blank">https://example.com</a>',
		);
		expect(
			transformUrlsToHtmlAnchors(
				"Check http://example.com and https://example.com",
			),
		).toBe(
			'Check <a href="http://example.com" target="_blank">http://example.com</a> and <a href="https://example.com" target="_blank">https://example.com</a>',
		);
		expect(transformUrlsToHtmlAnchors("No links here")).toBe("No links here");
	});
});

describe("getNewlinesCount", () => {
	it("should return the correct number of newlines in a string", () => {
		expect(getNewlinesCount("Hello\nWorld")).toBe(1);
		expect(getNewlinesCount("Hello\nWorld\n")).toBe(2);
		expect(getNewlinesCount("Hello World")).toBe(0);
		expect(getNewlinesCount("\n\n\n")).toBe(3);
	});
});

describe("IncomingConsoleEntry", () => {
	const defaultSettings: IncomingConsoleEntrySettings = {
		colorByIndex: ["#000", "#fff"],
		defaultColorIndex: 0,
		maxFormattedMessageLength: Infinity,
		maxFormattedMessageNewlines: Infinity,
		truncationSuffix: (count) => `... ${count} chars more ...`,
	};

	it("should append message fragments with correct color formatting", () => {
		const entry = IncomingConsoleEntry.create({
			...defaultSettings,
			colorByIndex: ["#000", "#fff"],
			defaultColorIndex: 0,
		});

		entry.push("Hello ", 0);
		entry.push("World", 1);

		expect(entry.originalMessage).toBe("Hello World");
		expect(entry.formattedMessage).toBe(
			'Hello <span style="color:#fff">World</span>',
		);
	});

	it("should handle HTML special characters", () => {
		const entry = IncomingConsoleEntry.create(defaultSettings);
		entry.push("<div>&test</div>", 0);

		expect(entry.originalMessage).toBe("<div>&test</div>");
		expect(entry.formattedMessage).toBe("&lt;div&gt;&amp;test&lt;/div&gt;");
	});

	it("should count newlines correctly", () => {
		const entry = IncomingConsoleEntry.create(defaultSettings);
		entry.push("line1\nline2\nline3", 0);

		expect(entry.formattedMessageNewlines).toBe(2);
	});

	it("should truncate message when exceeding length limit", () => {
		const entry = IncomingConsoleEntry.create({
			...defaultSettings,
			maxFormattedMessageLength: 10,
		});

		const message = "This is a very long message";
		entry.push(message, 0);

		const { formattedMessage } = entry.end();
		expect(formattedMessage).toBe(
			message.slice(0, 10) + `... ${message.slice(10).length} chars more ...`,
		);
	});

	it("should truncate message when exceeding newline limit", () => {
		const entry = IncomingConsoleEntry.create({
			...defaultSettings,
			maxFormattedMessageNewlines: 2,
		});
		const input = "line1\nline2\nline3\nline4\nline5";
		entry.push(input, 0);

		const { formattedMessage, originalMessage } = entry.end();

		expect(originalMessage).toBe(input);
		expect(formattedMessage).toBe(
			`line1\nline2... ${"\nline3\nline4\nline5".length} chars more ...`,
		);
	});

	it("should transform URLs to HTML anchors", () => {
		const entry = IncomingConsoleEntry.create(defaultSettings);
		entry.push("Visit https://example.com and http://google.com", 0);
		const { formattedMessage } = entry.end();

		expect(formattedMessage).toBe(
			'Visit <a href="https://example.com" target="_blank">https://example.com</a> and ' +
				'<a href="http://google.com" target="_blank">http://google.com</a>',
		);
	});

	it("should handle empty message fragments", () => {
		const entry = IncomingConsoleEntry.create(defaultSettings);
		entry.push("", 0);
		const { formattedMessage, originalMessage } = entry.end();

		expect(originalMessage).toBe("");
		expect(formattedMessage).toBe("");
	});

	it("should handle messages with only newlines", () => {
		const entry = IncomingConsoleEntry.create(defaultSettings);
		entry.push("\n\n\n", 0);

		expect(entry.formattedMessageNewlines).toBe(3);
	});

	it("should handle invalid color indices gracefully", () => {
		const entry = IncomingConsoleEntry.create(defaultSettings);
		entry.push("Test", 999); // Invalid color index

		expect(entry.end().formattedMessage).toBe("Test"); // Should use default color
	});
});
