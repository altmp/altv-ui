const pad = (num: number, length: number) => {
	return num.toString().padStart(length, "0");
};

function getTimezoneOffset(date: Date): string {
	const offset = date.getTimezoneOffset();
	const sign = offset > 0 ? "-" : "+";
	const absOffset = Math.abs(offset);
	const hours = Math.floor(absOffset / 60);
	const minutes = absOffset % 60;
	return `${sign}${pad(hours, 2)}${pad(minutes, 2)}`;
}

const ONE_DAY = 86400000;
const ONE_WEEK = 604800000;

function getDayOfYear(date: Date): number {
	const startOfYear = new Date(date.getFullYear(), 0, 0);
	const diff = date.getTime() - startOfYear.getTime();
	return Math.ceil(diff / ONE_DAY);
}

function getWeekNumberFromSunday(date: Date): number {
	const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
	return Math.floor((date.getTime() - firstDayOfYear.getTime()) / ONE_WEEK);
}

function getWeekNumberFromMonday(date: Date): number {
	const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
	return Math.floor(
		(date.getTime() -
			firstDayOfYear.getTime() +
			ONE_DAY * (7 - firstDayOfYear.getDay())) /
			ONE_WEEK,
	);
}

function getReplacement(date: Date, match: string): string {
	switch (match) {
		case "%Y":
			// Year with century (e.g., 2024)
			return date.getFullYear().toString();
		case "%y":
			// Year without century, zero-padded (e.g., 24)
			return pad(date.getFullYear() % 100, 2);
		case "%m":
			// Month [01,12]
			return pad(date.getMonth() + 1, 2);
		case "%d":
			// Day of the month [01,31]
			return pad(date.getDate(), 2);
		case "%H":
			// Hour in 24h format [00,23]
			return pad(date.getHours(), 2);
		case "%I":
			// Hour in 12h format [01,12]
			return pad(date.getHours() % 12 || 12, 2);
		case "%M":
			// Minute [00,59]
			return pad(date.getMinutes(), 2);
		case "%S":
			// Second [00,61]
			return pad(date.getSeconds(), 2);
		case "%p":
			// AM or PM
			return date.getHours() < 12 ? "AM" : "PM";
		case "%z":
			// UTC offset in the form +HHMM or -HHMM
			return getTimezoneOffset(date);
		case "%a":
			// Abbreviated weekday name (e.g., Mon)
			return date.toLocaleString("en-US", { weekday: "short" });
		case "%A":
			// Full weekday name (e.g., Monday)
			return date.toLocaleString("en-US", { weekday: "long" });
		case "%b":
			// Abbreviated month name (e.g., Jan)
			return date.toLocaleString("en-US", { month: "short" });
		case "%B":
			// Full month name (e.g., January)
			return date.toLocaleString("en-US", { month: "long" });
		case "%j":
			// Day of the year [001,366]
			return pad(getDayOfYear(date), 3);
		case "%U":
			// Week number with Sunday as first day [00,53]
			return pad(getWeekNumberFromSunday(date), 2);
		case "%W":
			// Week number with Monday as first day [00,53]
			return pad(getWeekNumberFromMonday(date), 2);
		default:
			return match;
	}
}

/**
 * Implementation of C++ `std::put_time` function.
 * @see https://cplusplus.com/reference/iomanip/put_time/
 */
export function putTime(date: Date, format: string): string {
	return format.replace(/%[a-zA-Z]/g, (match) => getReplacement(date, match));
}
