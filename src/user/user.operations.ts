import type { TransactionClient } from "@/db/database.schema";
import type { PersonData } from "@/person/person.schema";
import type { User } from "prisma/generated/client";

type UserWithProfile = User & { profile: PersonData | null };

export interface UserOperations {
	findByIdWithProfile(id: string, tx?: TransactionClient): Promise<UserWithProfile | null>;
	findByEmail(email: string, tx?: TransactionClient): Promise<User | null>;
	create(email: string, password: string, tx?: TransactionClient): Promise<User>;
	update(
		id: string,
		email: string | null,
		password: string | null,
		emailVerified: boolean | null,
		tx?: TransactionClient,
	): Promise<User>;
}
