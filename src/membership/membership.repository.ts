import type { TransactionClient } from "@/client/database.schema";
import type { DatabaseClient } from "@/client/database.client";
import { PersonRole, Status } from "prisma/generated/enums";
import type { Prisma } from "prisma/generated/browser";

export class MembershipRepository {
	constructor(private readonly db: DatabaseClient) {}

	include: { group: true; person: true } = { group: true, person: true };

	async findMany(personId: number, groupId: number, tx?: TransactionClient) {
		const client = tx ?? this.db;

		const isMember = await client.membership.findFirst({
			where: {
				personId,
				groupId,
				status: Status.accepted,
			},
		});

		if (!isMember) return null;

		const memberships = await client.membership.findMany({
			where: { groupId },
			include: { person: true },
		});

		return memberships;
	}

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
