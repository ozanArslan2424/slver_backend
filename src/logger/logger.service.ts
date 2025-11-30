import winston from "winston";
import { LogLevel, type RequestData } from "@/logger/logger.schema";
import { Core } from "@/lib/core.namespace";
import type { Adapter } from "@/lib/adapter.namespace";
import { Config } from "@/lib/config.namespace";

export class LoggerService extends Core.Service implements Adapter.Logger {
	private readonly loggerEnabled = true;
	private readonly isDevelopment = Config.isDev();
	private readonly logLevel = Config.get("LOG_LEVEL", {
		fallback: LogLevel.info,
	});
	private logger: winston.Logger;

	constructor() {
		super();
		this.logger = this.createLogger();
		// if (this.loggerEnabled) {
		// 	this.error = console.error;
		// 	this.warn = console.warn;
		// 	this.log = console.log;
		// 	this.debug = console.debug;
		// } else {
		// 	this.error = () => {};
		// 	this.warn = () => {};
		// 	this.log = () => {};
		// 	this.debug = () => {};
		// }
	}

	error(msg: string, ...args: any[]) {
		this.logger.log(LogLevel.error, msg, ...args);
	}
	warn(msg: string, ...args: any[]) {
		this.logger.log(LogLevel.warn, msg, ...args);
	}
	log(msg: string, ...args: any[]) {
		this.logger.log(LogLevel.info, msg, ...args);
	}
	debug(msg: string, ...args: any[]) {
		this.logger.log(LogLevel.debug, msg, ...args);
	}

	onRequest = this.makeMiddlewareHandler((c) => {
		const isOpenAPIRequest = c.url.origin.includes("ely.sia");
		const path = c.url.pathname;

		if (!isOpenAPIRequest) {
			this.log(`[${c.req.method}] ${path}`);
		}
	});

	onAfterResponse(requestData: RequestData) {
		this.log(`[${requestData.method}] ${requestData.url}:`, {
			id: requestData.id,
			userAgent: requestData.userAgent,
			time: `${Math.round(performance.now() - requestData.start)}ms`,
		});
	}

	onError(error: Adapter.Err) {
		if (error instanceof Core.Err) {
			if (error.status >= 500) {
				this.error(error.name, error);
			}
		} else {
			this.error(error.name, error);
		}
	}

	private createLogger(): winston.Logger {
		const formats = this.isDevelopment
			? winston.format.combine(
					winston.format.errors({ stack: true }),
					winston.format.timestamp(),
					winston.format.colorize(),
					winston.format.printf(
						({ timestamp, level, message, stack, ...meta }) =>
							`${timestamp} [${level}]: ${message}${Object.keys(meta).length > 0 ? `\n${JSON.stringify(meta, null, 2)}` : ""}${stack ? `\n${JSON.stringify(stack, null, 2)}` : ""}`,
					),
				)
			: winston.format.combine(
					winston.format.errors({ stack: true }),
					winston.format.timestamp(),
					winston.format.json(),
				);

		const transports: winston.transport[] = [
			new winston.transports.Console({
				level: this.logLevel,
				format: formats,
			}),
		];

		if (!this.isDevelopment) {
			transports.push(
				new winston.transports.File({
					filename: "logs/error.log",
					level: LogLevel.error,
					format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
				}),
				new winston.transports.File({
					filename: "logs/combined.log",
					level: this.logLevel,
					format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
				}),
			);
		}

		return winston.createLogger({
			level: this.logLevel,
			transports,
			silent: !this.loggerEnabled,
		});
	}

	// TODO:
	// private generateRequestId() {
	// 	return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
	// }
}
