import type { TransactionClient } from "@/db/database.schema";
import type { DatabaseClient } from "@/db/database.client";

export class SeenStatusRepository {
	constructor(private readonly db: DatabaseClient) {}

	async findManyUnseen(personId: number, tx?: TransactionClient) {
		const client = tx ?? this.db;
		return await client.seenStatus.findMany({
			where: { personId, isSeen: false },
		});
	}

	async updateMany(personId: number, thingIds: number[], isSeen: boolean, tx?: TransactionClient) {
		const client = tx ?? this.db;
		await client.seenStatus.updateMany({
			where: {
				personId,
				thingId: { in: thingIds },
				isSeen: !isSeen,
			},
			data: { isSeen },
		});
	}

	async createMany(thingId: number, personIds: number[], tx?: TransactionClient) {
		const client = tx ?? this.db;
		const promises = [];
		for (const personId of personIds) {
			promises.push(
				client.seenStatus.create({
					data: { personId, thingId, isSeen: false },
				}),
			);
		}
		await Promise.all(promises);
	}

	async count(personId: number, tx?: TransactionClient) {
		const client = tx ?? this.db;
		return await client.seenStatus.count({ where: { personId } });
	}
}
