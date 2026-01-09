import type { TransactionClient } from "@/client/database.schema";
import type { DatabaseClient } from "@/client/database.client";
import type { JwtPayload } from "jsonwebtoken";

export class RefreshTokenRepository {
	constructor(private readonly db: DatabaseClient) {}

	async deleteExpiredTokens(tx?: TransactionClient) {
		const client = tx ?? this.db;
		await client.refreshToken.deleteMany({
			where: {
				OR: [
					{ expiresAt: { lt: new Date() } }, // Expired
					{ isValid: false }, // Or already invalidated
				],
			},
		});
	}

	async create(userId: string, expiresAt: Date, tx?: TransactionClient) {
		const client = tx ?? this.db;
		const { id } = await client.refreshToken.create({
			data: { userId, expiresAt, isValid: true },
			select: { id: true },
		});
		return id;
	}

	async invalidate(id: string, userId: string, tx?: TransactionClient) {
		const client = tx ?? this.db;
		await client.refreshToken.update({
			where: { id, userId, isValid: true },
			data: { isValid: false },
		});
	}

	async delete(id: string, tx?: TransactionClient) {
		const client = tx ?? this.db;
		await client.refreshToken.delete({ where: { id } });
	}

	async findUnique(payload: JwtPayload, tx?: TransactionClient) {
		const client = tx ?? this.db;
		return await client.refreshToken.findUnique({
			where: {
				id: payload.jti,
				userId: payload.userId,
				isValid: true,
				expiresAt: { gt: new Date() },
			},
			include: { user: true },
		});
	}
}
