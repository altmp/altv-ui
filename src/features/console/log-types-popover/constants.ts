import { LogType } from "@/stores/settings";

export const LOG_TYPE_BY_NAME = Object.freeze({
	info: LogType.Info,
	warning: LogType.Warning,
	error: LogType.Error,
	debug: LogType.Debug,
} satisfies Record<string, LogType>);
export type LogTypeName = keyof typeof LOG_TYPE_BY_NAME;

export const LOG_TYPES = Object.freeze(
	Object.values(LOG_TYPE_BY_NAME),
) as Readonly<LogType[]>;
export const LOG_NAME_BY_TYPE = Object.freeze(
	Object.keys(LOG_TYPE_BY_NAME),
) as Readonly<LogTypeName[]>;
