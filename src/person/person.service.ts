import { Core } from "@/lib/core.namespace";
import type { DBService } from "@/db/db.service";
import type { PersonCreateData, PersonData } from "@/person/person.schema";
import type { TransactionClient } from "@/db/db.schema";

export class PersonService extends Core.Service {
	constructor(private readonly db: DBService) {
		super();
	}

	include: {
		memberships: { include: { group: true }; omit: { password: true } };
	} = {
		memberships: { include: { group: true }, omit: { password: true } },
	};

	async getByUserId(userId: string): Promise<PersonData | null> {
		return await this.db.person.findUnique({
			where: { userId },
			include: this.include,
		});
	}

	async getByEmail(email: string) {
		return await this.db.person.findUnique({
			where: { email },
			include: this.include,
		});
	}

	async get(id: number) {
		return await this.db.person.findUnique({
			where: { id },
			include: this.include,
		});
	}

	async listByGroup(groupId: number) {
		return await this.db.person.findMany({
			where: {
				memberships: { some: { groupId, status: { not: "rejected" } } },
			},
			include: this.include,
		});
	}

	async create(body: PersonCreateData, tx?: TransactionClient) {
		const client = tx ?? this.db;
		return await client.person.create({
			data: { userId: body.userId, email: body.email, name: body.name },
			include: this.include,
		});
	}
}
