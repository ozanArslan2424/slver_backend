import type { TransactionClient } from "@/db/database.schema";
import type { DatabaseClient } from "@/db/database.client";

export class VerificationTokenRepository {
	constructor(private readonly db: DatabaseClient) {}

	async delete(userId: string, value: string, tx?: TransactionClient) {
		const client = tx ?? this.db;
		await client.verification.delete({ where: { userId_value: { userId, value } } });
	}

	async findUnique(userId: string, value: string, tx?: TransactionClient) {
		const client = tx ?? this.db;
		return await client.verification.findUnique({ where: { userId_value: { userId, value } } });
	}
}
