import type { TransactionClient } from "@/db/database.schema";
import type { Membership } from "prisma/generated/client";
import { PersonRole, Status } from "prisma/generated/enums";

export interface MembershipOperations {
	findUnique(
		personId: number,
		groupId: number,
		status: Status | undefined,
		tx?: TransactionClient,
	): Promise<Membership | null>;
	// TODO: Multiple groups can be joined, adjust as such
	getPendingMembership(
		personId: number,
		password: string,
		tx?: TransactionClient,
	): Promise<Membership | null>;
	update(
		personId: number,
		groupId: number,
		status: Status,
		tx?: TransactionClient,
	): Promise<Membership | null>;
	create(
		password: string,
		role: PersonRole,
		groupId: number,
		personId: number,
		tx?: TransactionClient,
	): Promise<Membership>;
}
