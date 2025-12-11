import { Config } from "@/lib/config.namespace";
import type { Core } from "@/lib/core.namespace";
import { Help } from "@/lib/help.namespace";
import type { LoggerService } from "@/logger/logger.service";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "prisma/generated/client";

export class DBService extends PrismaClient implements Core.DBClientInterface {
	constructor(private readonly loggerService: LoggerService) {
		const connectionString = Config.get("DATABASE_URL");
		const adapter = new PrismaNeon({ connectionString });
		super({ adapter });
	}

	async connect(): Promise<void> {
		const maxAttempts = 3;
		const baseDelay = Help.milliseconds["1s"];

		for (let attempt = 1; attempt <= maxAttempts; attempt++) {
			try {
				await this.$connect();
				this.loggerService.log("✅ DB Client Connected");
				return;
			} catch (err) {
				const error = err as Error;
				this.loggerService.warn(
					`❌ DB Connection attempt ${attempt}/${maxAttempts} failed: ${error.message}`,
				);

				if (attempt === maxAttempts) {
					throw new Error(
						`Failed to connect to database after ${maxAttempts} attempts: ${error.message}`,
					);
				}

				const delay = baseDelay * Math.pow(2, attempt - 1);
				this.loggerService.log(`Retrying in ${delay}ms...`);
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}
	}

	async disconnect(): Promise<void> {
		await this.$disconnect();
		this.loggerService.log("❌ DB Client Disconnected");
	}
}
