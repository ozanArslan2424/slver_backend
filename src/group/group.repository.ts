import type { TransactionClient } from "@/db/database.schema";
import type { DatabaseClient } from "@/db/database.client";
import { PersonRole, Status } from "prisma/generated/enums";
import type { GroupOperations } from "@/group/group.operations";

export class GroupRepository implements GroupOperations {
	constructor(private readonly db: DatabaseClient) {}

	async create(title: string, password: string, personId: number, tx?: TransactionClient) {
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

	async findMany(personId: number, tx?: TransactionClient) {
		const client = tx ?? this.db;
		return await client.group.findMany({
			where: { memberships: { some: { personId, status: Status.accepted } } },
		});
	}

	async findUnique(id: number, tx?: TransactionClient) {
		const client = tx ?? this.db;
		return await client.group.findUnique({ where: { id } });
	}
}
