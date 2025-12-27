import { Config } from "@/lib/config.namespace";
import { Core } from "@/lib/core.namespace";
import { LogLevel } from "@/logger/logger.schema";
import winston from "winston";

export class Logger implements Core.Logger {
	private readonly isDevelopment = Config.isDev();
	private readonly logLevel = Config.get("LOG_LEVEL", {
		fallback: LogLevel.info,
	});
	private logger: winston.Logger;

	constructor(private readonly loggerEnabled?: boolean) {
		this.logger = this.createLogger();
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
			silent: this.loggerEnabled === false,
		});
	}

	// TODO:
	// private generateRequestId() {
	// 	return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
	// }
}
