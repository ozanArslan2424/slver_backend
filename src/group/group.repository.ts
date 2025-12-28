import type { TransactionClient } from "@/db/database.schema";
import type { DatabaseClient } from "@/db/database.client";
import { PersonRole, Status } from "prisma/generated/enums";
import type { GroupOperations } from "@/group/group.operations";
import type { Group } from "prisma/generated/client";

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

	async findMany(personId: number, tx?: TransactionClient) {
		const client = tx ?? this.db;
		return await client.group.findMany({
			where: { memberships: { some: { personId, status: Status.accepted } } },
		});
	}

	async findUnique(id: number, tx?: TransactionClient) {
		const client = tx ?? this.db;
		return await client.group.findUnique({
			where: { id },
			include: { memberships: { include: { person: true } } },
		});
	}
}
