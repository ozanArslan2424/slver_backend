import type { TransactionClient } from "@/db/database.schema";
import type { Verification } from "prisma/generated/client";

export interface VerificationTokenOperations {
	delete(userId: string, value: string, tx?: TransactionClient): Promise<void>;
	findUnique(userId: string, value: string, tx?: TransactionClient): Promise<Verification | null>;
}
