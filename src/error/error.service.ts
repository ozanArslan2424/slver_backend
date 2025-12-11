import type { LanguageService } from "@/language/language.service";
import type { Adapter } from "@/lib/adapter.namespace";
import { Core } from "@/lib/core.namespace";
import type { LoggerService } from "@/logger/logger.service";
import { Prisma } from "prisma/generated/client";

export class ErrorService extends Core.Service {
	constructor(
		private readonly logger: LoggerService,
		private readonly languageService: LanguageService,
	) {
		super();
	}

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

	async handler(err: Adapter.Error) {
		this.logger.onError(err);

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

		const t = await this.languageService.makeTranslator("error");

		return new Core.Response({ message: t(key) }, { status });
	}
}
