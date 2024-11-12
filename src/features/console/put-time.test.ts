import { expect, describe, it } from "vitest";
import {
	getDayOfYear,
	getTimezoneOffset,
	getWeekOfYear,
	Day,
	putTime,
} from "./put-time";

describe("getDayOfYear", () => {
	it("should return 1 for January 1st", () => {
		const date = new Date("2024-01-01T00:00:00Z");
		expect(getDayOfYear(date)).toBe(1);
	});

	it("should return 61 for March 1st", () => {
		const date = new Date("2024-03-01T00:00:00Z");
		expect(getDayOfYear(date)).toBe(61);
	});

	it("should return 365 for December 30th", () => {
		const date = new Date("2024-12-30T00:00:00Z");
		expect(getDayOfYear(date)).toBe(365);
	});

	it("should return 366 for December 31st in a leap year", () => {
		const date = new Date("2024-12-31T00:00:00Z");
		expect(getDayOfYear(date)).toBe(366);
	});
});

describe("getTimezoneOffset", () => {
	it("should return +0000 for UTC time", () => {
		const date = new Date("2024-01-01");
		date.getTimezoneOffset = () => 0;
		expect(getTimezoneOffset(date)).toBe("+0000");
	});

	it("should return -0800 for PST time", () => {
		const date = new Date("2024-01-01");
		// Mocking the timezone offset to simulate PST (-8 hours from UTC)
		date.getTimezoneOffset = () => 480; // 8 hours * 60 minutes
		expect(getTimezoneOffset(date)).toBe("-0800");
	});

	it("should return +0530 for IST time", () => {
		const date = new Date("2024-01-01");
		// Mocking the timezone offset to simulate IST (+5:30 hours from UTC)
		date.getTimezoneOffset = () => -330; // -5 hours and -30 minutes * 60
		expect(getTimezoneOffset(date)).toBe("+0530");
	});
});

describe("getWeekOfYear", () => {
	it("should return 0 for January 1st", () => {
		const date = new Date("2023-01-01");
		expect(getWeekOfYear(date)).toBe(0);
	});

	it("should return 1 for January 2nd", () => {
		const date = new Date("2023-01-02");
		expect(getWeekOfYear(date)).toBe(1);
	});

	it("should return 2 for January 9th", () => {
		const date = new Date("2023-01-09");
		expect(getWeekOfYear(date)).toBe(2);
	});

	it("should return 52 for December 31st", () => {
		const date = new Date("2023-12-31");
		expect(getWeekOfYear(date)).toBe(52);
	});

	it("should return 1 for January 1st (starting from sunday)", () => {
		const date = new Date("2023-01-01");
		expect(getWeekOfYear(date, Day.Sun)).toBe(1);
	});

	it("should return 2 for January 8st (starting from sunday)", () => {
		const date = new Date("2023-01-08");
		expect(getWeekOfYear(date, Day.Sun)).toBe(2);
	});
});

describe("putTime", () => {
	it("should replace %Y with the full year", () => {
		const date = new Date("2024-01-01");
		expect(putTime(date, "%Y")).toBe("2024");
	});

	it("should replace %y with the year without century", () => {
		const date = new Date("2024-01-01");
		expect(putTime(date, "%y")).toBe("24");
	});

	it("should replace %m with the month", () => {
		const date = new Date("2024-01-01");
		expect(putTime(date, "%m")).toBe("01");
	});

	it("should replace %d with the day", () => {
		const date = new Date("2024-01-01");
		expect(putTime(date, "%d")).toBe("01");
	});

	it("should replace %H with the hour", () => {
		const date = new Date("2024-01-01T12:34:56");
		expect(putTime(date, "%H")).toBe("12");
	});

	it("should replace %M with the minute", () => {
		const date = new Date("2024-01-01T12:34:56");
		expect(putTime(date, "%M")).toBe("34");
	});

	it("should replace %S with the second", () => {
		const date = new Date("2024-01-01T12:34:56");
		expect(putTime(date, "%S")).toBe("56");
	});

	it("should replace %p with AM or PM", () => {
		const date = new Date("2024-01-01T12:34:56");
		expect(putTime(date, "%p")).toBe("PM");
	});

	it("should replace %z with the timezone offset", () => {
		const date = new Date("2024-01-01");
		date.getTimezoneOffset = () => 0;
		expect(putTime(date, "%z")).toBe("+0000");
	});

	it("should replace %a with the abbreviated weekday name", () => {
		const date = new Date("2024-01-01");
		expect(putTime(date, "%a")).toBe("Mon");
	});

	it("should replace %A with the full weekday name", () => {
		const date = new Date("2024-01-01");
		expect(putTime(date, "%A")).toBe("Monday");
	});

	it("should replace %b with the abbreviated month name", () => {
		const date = new Date("2024-01-01");
		expect(putTime(date, "%b")).toBe("Jan");
	});

	it("should replace %B with the full month name", () => {
		const date = new Date("2024-01-01");
		expect(putTime(date, "%B")).toBe("January");
	});

	it("should replace %j with the day of the year", () => {
		const date = new Date("2024-01-01");
		expect(putTime(date, "%j")).toBe("001");
	});

	it("should replace %U with the week number starting from Sunday", () => {
		const date = new Date("2024-01-01");
		expect(putTime(date, "%U")).toBe("00");
	});

	it("should replace %W with the week number starting from Monday", () => {
		const date = new Date("2024-01-01");
		expect(putTime(date, "%W")).toBe("01");
	});

	it("should return the same string if the format is empty", () => {
		const date = new Date("2024-01-01");
		expect(putTime(date, "")).toBe("");
	});

	it("should return the same string if there are no replacements", () => {
		const date = new Date("2024-01-01");
		expect(putTime(date, "Hello, world!")).toBe("Hello, world!");
	});

	it("should replace multiple formats", () => {
		const date = new Date("2024-01-01T12:34:56");
		expect(putTime(date, "%H:%M:%S %p")).toBe("12:34:56 PM");
	});
});
