import type { TransactionClient } from "@/db/database.schema";
import type { DatabaseClient } from "@/db/database.client";
import type { SeenStatusOperations } from "@/seen-status/seen-status.operations";

export class SeenStatusRepository implements SeenStatusOperations {
	constructor(private readonly db: DatabaseClient) {}

	async findManyUnseen(personId: number, tx?: TransactionClient) {
		const client = tx ?? this.db;
		return await client.seenStatus.findMany({
			where: { personId, isSeen: false },
		});
	}

	async updateMany(personId: number, thingIds: number[], isSeen: boolean, tx?: TransactionClient) {
		const client = tx ?? this.db;
		const promises = [];
		for (const thingId of thingIds) {
			promises.push(
				client.seenStatus.update({
					where: { personId_thingId: { personId, thingId }, isSeen: !isSeen },
					data: { isSeen },
				}),
			);
		}
		await Promise.all(promises);
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
