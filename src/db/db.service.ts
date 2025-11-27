import { Adapter } from "@/lib/adapter.namespace";
import { Config } from "@/lib/config.namespace";
import type { LoggerService } from "@/logger/logger.service";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "prisma/generated/client";

export class DBService extends PrismaClient implements Adapter.DBClientInterface {
	constructor(private readonly loggerService: LoggerService) {
		const connectionString = Config.get("DATABASE_URL");
		const adapter = new PrismaPg({ connectionString });
		super({ adapter });
	}

	async connect(): Promise<void> {
		await this.$connect();
		this.loggerService.log("✅ DB Client Connected");
	}

	async disconnect(): Promise<void> {
		await this.$disconnect();
		this.loggerService.log("❌ DB Client Disconnected");
	}
}
