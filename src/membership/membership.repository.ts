import type { TransactionClient } from "@/db/database.schema";
import type { DatabaseClient } from "@/db/database.client";
import { PersonRole, Status } from "prisma/generated/enums";
import type { MembershipOperations } from "@/membership/membership.operations";

export class MembershipRepository implements MembershipOperations {
	constructor(private readonly db: DatabaseClient) {}

	include: { group: true } = { group: true };

	async findUnique(
		personId: number,
		groupId: number,
		status: Status | undefined,
		tx?: TransactionClient,
	) {
		const client = tx ?? this.db;
		return await client.membership.findUnique({
			where: { personId_groupId: { personId, groupId }, status },
			include: this.include,
		});
	}

	// TODO: Multiple groups can be joined, adjust as such
	async getPendingMembership(personId: number, password: string, tx?: TransactionClient) {
		const client = tx ?? this.db;
		return await client.membership.findFirst({
			where: {
				personId,
				password,
				status: Status.pending,
			},
			include: this.include,
		});
	}

	async update(personId: number, groupId: number, status: Status, tx?: TransactionClient) {
		const client = tx ?? this.db;
		return await client.membership.update({
			where: { personId_groupId: { personId, groupId } },
			data: { status },
			include: this.include,
		});
	}

	async create(
		password: string,
		role: PersonRole,
		groupId: number,
		personId: number,
		tx?: TransactionClient,
	) {
		const client = tx ?? this.db;
		return await client.membership.create({
			data: {
				password,
				role,
				status: Status.pending,
				groupId,
				personId,
			},
			include: this.include,
		});
	}
}
