import type { TransactionClient } from "@/db/database.schema";
import type { PersonData } from "@/person/person.schema";

export interface PersonOperations {
	include: { memberships: { include: { group: true }; omit: { password: true } } };
	create(userId: string, email: string, name: string, tx?: TransactionClient): Promise<PersonData>;
	findByUserId(userId: string, tx?: TransactionClient): Promise<PersonData | null>;
	findByEmail(email: string, tx?: TransactionClient): Promise<PersonData | null>;
	findById(id: number, tx?: TransactionClient): Promise<PersonData | null>;
	findManyByGroup(groupId: number, tx?: TransactionClient): Promise<PersonData[]>;
	findByEmailOrCreate(email: string, userId: string, tx?: TransactionClient): Promise<PersonData>;
}
