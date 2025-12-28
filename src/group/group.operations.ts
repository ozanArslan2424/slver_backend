import type { TransactionClient } from "@/db/database.schema";
import type { Group } from "prisma/generated/client";

export interface GroupOperations {
	create(title: string, password: string, personId: number, tx?: TransactionClient): Promise<Group>;
	update(id: number, title: string, tx?: TransactionClient): Promise<Group>;
	delete(id: number, tx?: TransactionClient): Promise<void>;
	findMany(personId: number, tx?: TransactionClient): Promise<Group[]>;
	findUnique(id: number, tx?: TransactionClient): Promise<Group | null>;
}
