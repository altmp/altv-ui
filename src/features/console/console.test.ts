import { describe, expect, it } from "vitest";
import {
	convertLinksToHTML,
	getNewlinesCount,
	nthIndexOf,
	stripHtml,
} from "./console";

describe("nthIndexOf", () => {
	it("should return the correct index of the nth occurrence of a substring", () => {
		expect(nthIndexOf("hello world hello world", "world", 1)).toBe(6);
		expect(nthIndexOf("hello world hello world", "world", 2)).toBe(18);
		expect(nthIndexOf("hello world hello world", "world", 3)).toBe(-1);
		expect(nthIndexOf("hello world", "hello", 1)).toBe(0);
		expect(nthIndexOf("hello world", "hello", 2)).toBe(-1);
	});
});

describe("stripHtml", () => {
	it("should replace HTML entities with their corresponding characters", () => {
		expect(stripHtml("<div>Hello & World</div>")).toBe(
			"&lt;div&gt;Hello &amp; World&lt;/div&gt;",
		);
		expect(stripHtml('He said "Hello"')).toBe("He said &quot;Hello&quot;");
		expect(stripHtml("It's a test")).toBe("It&#39;s a test");
	});
});

describe("convertLinksToHTML", () => {
	it("should convert URLs to HTML anchor tags", () => {
		expect(convertLinksToHTML("Visit https://example.com")).toBe(
			'Visit <a href="https://example.com" target="_blank">https://example.com</a>',
		);
		expect(
			convertLinksToHTML("Check http://example.com and https://example.com"),
		).toBe(
			'Check <a href="http://example.com" target="_blank">http://example.com</a> and <a href="https://example.com" target="_blank">https://example.com</a>',
		);
		expect(convertLinksToHTML("No links here")).toBe("No links here");
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
