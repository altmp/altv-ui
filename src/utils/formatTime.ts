import { useLocalization } from "@/stores/localization";

const locale = useLocalization();

export function formatTime(timestamp: number) {
	if (timestamp === 0) {
		return locale.t("SOME_TIME_AGO");
	}
	let value = Date.now() / 1000 - timestamp;
	let units: Intl.RelativeTimeFormatUnit = "seconds";

	if (value > 59) {
		value /= 60;
		units = "minutes";

		if (value > 59) {
			value /= 60;
			units = "hours";

			if (value > 23) {
				value /= 24;
				units = "days";

				if (value > 30) {
					value /= 30;
					units = "months";

					if (value > 11) {
						value /= 12;
						units = "years";
					}
				}
			}
		}
	}

	return new Intl.RelativeTimeFormat(locale.currentLocale.intlCode).format(
		-Math.round(value),
		units,
	);
}
