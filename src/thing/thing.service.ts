import type { GroupService } from "@/group/group.service";
import type {
	ThingCreateData,
	ThingUpdateData,
	ThingAssignData,
	ThingDoneData,
	ThingRemoveData,
} from "@/thing/thing.schema";
import { Core } from "@/lib/core.namespace";
import type { DBService } from "@/db/db.service";
import type { AuthService } from "@/auth/auth.service";
import type { Prisma } from "prisma/generated/client";
import { Status } from "prisma/generated/enums";
import type { SeenStatusService } from "@/seen-status/seen-status.service";

export class ThingService extends Core.Service {
	constructor(
		private readonly db: DBService,
		private readonly authService: AuthService,
		private readonly groupService: GroupService,
		private readonly seenStatusService: SeenStatusService,
	) {
		super();
	}

	async create(headers: Core.Headers, body: ThingCreateData) {
		const profile = await this.authService.getProfile(headers);

		return await this.db.$transaction(async (tx) => {
			const membership = await this.groupService.getMembership(profile, tx);
			const isMember = membership && membership.status === Status.accepted;

			const thing = await tx.thing.create({
				data: {
					createdById: profile.id,
					content: body.content,
					dueDate: body.dueDate,
					groupId: isMember ? membership.groupId : undefined,
					assignedToId: isMember ? undefined : profile.id,
				},
				include: { assignedTo: true },
			});

			await this.seenStatusService.onThingCreate(thing, tx);

			return thing;
		});
	}

	async update(headers: Core.Headers, body: ThingUpdateData) {
		await this.authService.getProfile(headers);

		return await this.db.thing.update({
			where: { id: body.thingId },
			data: { content: body.content, dueDate: body.dueDate },
			include: { assignedTo: true },
		});
	}

	async list(headers: Core.Headers) {
		const profile = await this.authService.getProfile(headers);
		let where: Prisma.ThingFindManyArgs["where"] = {};

		const membership = await this.groupService.getMembership(profile);
		if (membership?.status === Status.accepted) {
			where = { OR: [{ createdById: profile.id }, { groupId: membership.groupId }] };
		} else {
			where = { createdById: profile.id };
		}

		const list = await this.db.thing.findMany({
			where,
			include: { assignedTo: true },
			distinct: ["id"],
			orderBy: [{ doneDate: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
		});

		await this.seenStatusService.updateMany({ personId: profile.id, thingList: list });

		return list;
	}

	async assign(headers: Core.Headers, body: ThingAssignData) {
		await this.authService.getProfile(headers);

		return await this.db.thing.update({
			where: { id: body.thingId },
			data: { assignedToId: body.personId },
			include: { assignedTo: true },
		});
	}

	async done(headers: Core.Headers, body: ThingDoneData) {
		await this.authService.getProfile(headers);

		return await this.db.thing.update({
			where: { id: body.thingId },
			data: { isDone: body.isDone, doneDate: body.isDone ? new Date() : null },
			include: { assignedTo: true },
		});
	}

	async remove(headers: Core.Headers, body: ThingRemoveData) {
		await this.authService.getProfile(headers);

		return await this.db.thing.delete({
			where: { id: body.thingId },
		});
	}
}
