import type { TransactionClient } from "@/db/database.schema";
import type { Thing } from "prisma/generated/client";

export interface ThingOperations {
	include: { assignedTo: true };
	create(
		content: string,
		dueDate: Date | null,
		groupId: number | undefined,
		createdById: number,
		assignedToId: number | undefined,
		tx?: TransactionClient,
	): Promise<Thing>;
	update(
		id: number,
		content: string | null,
		dueDate: Date | null,
		groupId: number | undefined | null,
		assignedToId: number | undefined | null,
		isDone: boolean | null,
		tx?: TransactionClient,
	): Promise<Thing>;
	findMany(
		createdById: number,
		groupId: number | null,
		isDone: boolean | null,
		tx?: TransactionClient,
	): Promise<Thing[]>;
	delete(id: number, tx?: TransactionClient): Promise<void>;
}
