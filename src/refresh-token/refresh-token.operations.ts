import type { TransactionClient } from "@/db/database.schema";
import type { JwtPayload } from "jsonwebtoken";
import type { RefreshToken } from "prisma/generated/client";

export interface RefreshTokenOperations {
	deleteExpiredTokens(tx?: TransactionClient): Promise<void>;
	create(userId: string, expiresAt: Date, tx?: TransactionClient): Promise<string>;
	invalidate(id: string, userId: string, tx?: TransactionClient): Promise<void>;
	delete(id: string, tx?: TransactionClient): Promise<void>;
	findUnique(payload: JwtPayload, tx?: TransactionClient): Promise<RefreshToken | null>;
}
