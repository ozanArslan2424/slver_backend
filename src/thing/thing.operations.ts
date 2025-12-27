import type { TransactionClient } from "@/db/database.schema";
import type { ThingData } from "@/thing/thing.schema";

export interface ThingOperations {
	include: { assignedTo: true };
	create(
		content: string,
		dueDate: Date | null,
		groupId: number | undefined,
		createdById: number,
		assignedToId: number | undefined,
		tx?: TransactionClient,
	): Promise<ThingData>;
	update(
		id: number,
		content: string | null,
		dueDate: Date | null,
		groupId: number | undefined | null,
		assignedToId: number | undefined | null,
		isDone: boolean | null,
		tx?: TransactionClient,
	): Promise<ThingData>;
	findMany(
		createdById: number,
		groupId: number | null,
		tx?: TransactionClient,
	): Promise<ThingData[]>;
	delete(id: number, tx?: TransactionClient): Promise<void>;
}
