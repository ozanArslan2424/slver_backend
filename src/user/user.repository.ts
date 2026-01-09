import type { TransactionClient } from "@/db/database.schema";
import type { DatabaseClient } from "@/db/database.client";
import type { Prisma } from "prisma/generated/client";

export class UserRepository {
	constructor(private readonly db: DatabaseClient) {}

	async findByIdWithProfile(id: string, tx?: TransactionClient) {
		const client = tx ?? this.db;
		return await client.user.findUnique({
			where: { id },
			include: {
				profile: {
					include: { memberships: { include: { group: true }, omit: { password: true } } },
				},
			},
		});
	}

	async findByEmail(email: string, tx?: TransactionClient) {
		const client = tx ?? this.db;
		return await client.user.findUnique({ where: { email } });
	}

	async create(email: string, password: string, tx?: TransactionClient) {
		const client = tx ?? this.db;
		return await client.user.create({ data: { email, password } });
	}

	async update(
		id: string,
		email: string | null,
		password: string | null,
		emailVerified: boolean | null,
		tx?: TransactionClient,
	) {
		const data: Prisma.UserUpdateArgs["data"] = {};
		if (email !== null) {
			data.email = email;
		}
		if (password !== null) {
			data.password = password;
		}
		if (emailVerified !== null) {
			data.emailVerified = emailVerified;
		}

		const client = tx ?? this.db;
		return await client.user.update({ where: { id }, data });
	}
}
