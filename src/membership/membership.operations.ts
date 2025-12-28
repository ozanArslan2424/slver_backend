import type { TransactionClient } from "@/db/database.schema";
import type { Membership } from "prisma/generated/client";
import { PersonRole, Status } from "prisma/generated/enums";

export interface MembershipOperations {
	findUnique(
		personId: number,
		groupId: number,
		status: Status | null,
		role: PersonRole | null,
		tx?: TransactionClient,
	): Promise<Membership | null>;
	getPendingMembership(
		personId: number,
		groupId: number,
		tx?: TransactionClient,
	): Promise<Membership | null>;
	update(
		personId: number,
		groupId: number,
		status: Status,
		tx?: TransactionClient,
	): Promise<Membership | null>;
	create(
		personId: number,
		groupId: number,
		role: PersonRole,
		password: string,
		tx?: TransactionClient,
	): Promise<Membership>;
}
