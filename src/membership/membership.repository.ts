import type { TransactionClient } from "@/db/database.schema";
import type { DatabaseClient } from "@/db/database.client";
import { PersonRole, Status } from "prisma/generated/enums";
import type { MembershipOperations } from "@/membership/membership.operations";
import type { Prisma } from "prisma/generated/browser";

export class MembershipRepository implements MembershipOperations {
	constructor(private readonly db: DatabaseClient) {}

	include: { group: true } = { group: true };

	async findUnique(
		personId: number,
		groupId: number,
		status: Status | null,
		role: PersonRole | null,
		tx?: TransactionClient,
	) {
		const client = tx ?? this.db;
		const where: Prisma.MembershipFindUniqueArgs["where"] = {
			personId_groupId: { personId, groupId },
		};
		if (status !== null) {
			where.status = status;
		}
		if (role !== null) {
			where.role = role;
		}
		return await client.membership.findUnique({ where, include: this.include });
	}

	async getPendingMembership(personId: number, groupId: number, tx?: TransactionClient) {
		const client = tx ?? this.db;
		return await client.membership.findFirst({
			where: {
				groupId,
				personId,
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
		personId: number,
		groupId: number,
		role: PersonRole,
		password: string,
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
