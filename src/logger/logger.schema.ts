export enum LogLevel {
	error = "error",
	warn = "warn",
	info = "info",
	debug = "debug",
}

export type RequestData = {
	id: string;
	start: number;
	url: string;
	method: string;
	userAgent: string;
};
