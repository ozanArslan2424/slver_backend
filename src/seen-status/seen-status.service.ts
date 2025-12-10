import type { AuthService } from "@/auth/auth.service";
import type { TransactionClient } from "@/db/db.schema";
import type { DBService } from "@/db/db.service";
import { Core } from "@/lib/core.namespace";
import type { SeenStatusUpdateManyData } from "@/seen-status/seen-status.schema";
import type { ThingData } from "@/thing/thing.schema";

export class SeenStatusService extends Core.Service {
	constructor(
		private readonly db: DBService,
		private readonly authService: AuthService,
	) {
		super();
	}

	getRelatedThings(personId: number, list: ThingData[]) {
		return list.filter(
			(thing) => thing.assignedToId === personId || thing.createdById === personId,
		);
	}

	async updateMany(data: SeenStatusUpdateManyData) {
		const promises = [];
		const unseenRelatedThings = await this.db.seenStatus.findMany({
			where: { personId: data.personId, isSeen: false },
		});

		for (const status of unseenRelatedThings) {
			if (data.thingList.find((t) => t.id === status.thingId)) {
				promises.push(
					this.db.seenStatus.update({
						where: { personId_thingId: { personId: status.personId, thingId: status.thingId } },
						data: { isSeen: true },
					}),
				);
			}
		}

		await Promise.all(promises);
	}

	async onThingCreate(thing: ThingData, tx?: TransactionClient) {
		const client = tx ?? this.db;
		const promises = [];

		promises.push(
			client.seenStatus.create({
				data: {
					personId: thing.createdById,
					thingId: thing.id,
					isSeen: false,
				},
			}),
		);

		if (thing.assignedToId) {
			promises.push(
				client.seenStatus.create({
					data: {
						personId: thing.assignedToId,
						thingId: thing.id,
						isSeen: false,
					},
				}),
			);
		}

		await Promise.all(promises);
	}

	async getCount(headers: Core.Headers) {
		const profile = await this.authService.getProfile(headers);
		return await this.db.seenStatus.count({ where: { personId: profile.id } });
	}
}
