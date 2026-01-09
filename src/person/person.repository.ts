import type { TransactionClient } from "@/client/database.schema";
import type { DatabaseClient } from "@/client/database.client";
import { Status } from "prisma/generated/enums";

export class PersonRepository {
	constructor(private readonly db: DatabaseClient) {}

	include = { memberships: { include: { group: true }, omit: { password: true } } } as const;

	async create(userId: string, email: string, name: string, tx?: TransactionClient) {
		const client = tx ?? this.db;
		return await client.person.create({
			data: { userId, email, name },
			include: this.include,
		});
	}

	async findByUserId(userId: string, tx?: TransactionClient) {
		const client = tx ?? this.db;
		return await client.person.findUnique({
			where: { userId },
			include: this.include,
		});
	}

	async findByEmail(email: string, tx?: TransactionClient) {
		const client = tx ?? this.db;
		return await client.person.findUnique({
			where: { email },
			include: this.include,
		});
	}

	async findById(id: number, tx?: TransactionClient) {
		const client = tx ?? this.db;
		return await client.person.findUnique({
			where: { id },
			include: this.include,
		});
	}

	async findManyByGroup(groupId: number, tx?: TransactionClient) {
		const client = tx ?? this.db;
		return await client.person.findMany({
			where: {
				memberships: { some: { groupId, status: { not: Status.rejected } } },
			},
			include: this.include,
		});
	}

	async findByEmailOrCreate(email: string, userId: string, tx?: TransactionClient) {
		const person = await this.findByEmail(email, tx);
		if (person) return person;

		return await this.create(userId, email, email.split("@")[0] ?? email);
	}
}
