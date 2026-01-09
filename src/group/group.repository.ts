import type { TransactionClient } from "@/client/database.schema";
import type { DatabaseClient } from "@/client/database.client";
import { PersonRole, Status } from "prisma/generated/enums";
import type { Group } from "prisma/generated/client";

export class GroupRepository {
	constructor(private readonly db: DatabaseClient) {}

	async create(
		title: string,
		password: string,
		personId: number,
		tx?: TransactionClient,
	): Promise<Group> {
		const client = tx ?? this.db;
		return await client.group.create({
			data: {
				title,
				memberships: {
					create: {
						personId,
						role: PersonRole.admin,
						status: Status.accepted,
						password,
					},
				},
			},
		});
	}

	async update(id: number, title: string, tx?: TransactionClient): Promise<Group> {
		const client = tx ?? this.db;
		return await client.group.update({
			where: { id },
			data: { title },
		});
	}

	async delete(id: number, tx?: TransactionClient): Promise<void> {
		const client = tx ?? this.db;
		await client.group.delete({ where: { id } });
	}

	async findMany(personId: number, tx?: TransactionClient): Promise<Group[]> {
		const client = tx ?? this.db;
		const personMemberships = await client.membership.findMany({
			where: { personId, status: Status.accepted },
			include: { group: true },
		});
		const groups = personMemberships.map((m) => m.group);
		return groups;
	}

	async findUnique(id: number, tx?: TransactionClient) {
		const client = tx ?? this.db;
		return await client.group.findUnique({
			where: { id },
			include: { memberships: { include: { person: true } } },
		});
	}
}
