import type { TransactionClient } from "@/db/database.schema";
import type { SeenStatus } from "prisma/generated/browser";

export interface SeenStatusOperations {
	findManyUnseen(personId: number, tx?: TransactionClient): Promise<SeenStatus[]>;
	updateMany(
		personId: number,
		thingIds: number[],
		isSeen: boolean,
		tx?: TransactionClient,
	): Promise<void>;
	createMany(thingId: number, personIds: number[], tx?: TransactionClient): Promise<void>;
	count(personId: number, tx?: TransactionClient): Promise<number>;
}
