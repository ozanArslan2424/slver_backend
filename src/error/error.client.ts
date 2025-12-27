import type { LanguageClient } from "@/language/language.client";
import { Core } from "@/lib/core.namespace";
import { Logger } from "@/logger/logger";
import { Prisma } from "prisma/generated/client";

export class ErrorClient {
	private readonly logger = new Logger();

	constructor(private readonly languageClient: LanguageClient) {}

	private readonly prismaStatus: Record<string, Core.Status> = {
		P2000: Core.Status.BAD_REQUEST,
		P2001: Core.Status.NOT_FOUND,
		P2002: Core.Status.CONFLICT,
		P2003: Core.Status.BAD_REQUEST,
		P2004: Core.Status.BAD_REQUEST,
		P2005: Core.Status.BAD_REQUEST,
		P2006: Core.Status.BAD_REQUEST,
		P2007: Core.Status.BAD_REQUEST,
		P2014: Core.Status.BAD_REQUEST,
		P2025: Core.Status.NOT_FOUND,
	};

	private getPrismaErrorStatus(code: string) {
		return this.prismaStatus[code] ?? Core.Status.BAD_REQUEST;
	}

	private getPrismaErrorKey(code: string) {
		return `prisma.${code}`;
	}

	async handler(err: Error) {
		let status: Core.Status = Core.Status.INTERNAL_SERVER_ERROR;
		let key = err.message;

		switch (true) {
			case err instanceof Core.Error:
				key = err.message;
				status = err.status;
				break;
			case err instanceof Prisma.PrismaClientKnownRequestError:
				key = this.getPrismaErrorKey(err.code);
				status = this.getPrismaErrorStatus(err.code);
				break;
			case err instanceof Prisma.PrismaClientInitializationError:
				key = this.getPrismaErrorKey("connection");
				break;
			case err instanceof Prisma.PrismaClientUnknownRequestError:
				key = this.getPrismaErrorKey("unknown");
				break;
			case err instanceof Prisma.PrismaClientValidationError:
				key = this.getPrismaErrorKey("validation");
				status = Core.Status.BAD_REQUEST;
				break;
			case err instanceof Prisma.PrismaClientRustPanicError:
				key = this.getPrismaErrorKey("rustPanic");
				break;
			default:
				break;
		}

		const t = await this.languageClient.makeTranslator("error");
		const message = t(key);
		if (status >= 500) {
			this.logger.error(`[${err.name}] ${message}`, err);
		}

		return new Core.Response({ message }, { status });
	}
}
