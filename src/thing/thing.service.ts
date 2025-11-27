import type { GroupService } from "@/group/group.service";
import type {
	ThingCreateData,
	ThingUpdateData,
	ThingAssignData,
	ThingDoneData,
	ThingRemoveData,
	ThingData,
} from "@/thing/thing.schema";
import { Core } from "@/lib/core.namespace";
import type { DBService } from "@/db/db.service";
import type { AuthService } from "@/auth/auth.service";
import type { Prisma, Thing } from "prisma/generated/client";
import { Status } from "prisma/generated/enums";

export class ThingService extends Core.Service {
	constructor(
		private readonly db: DBService,
		private readonly authService: AuthService,
		private readonly groupService: GroupService,
	) {
		super();
	}

	async create(headers: Core.Headers, body: ThingCreateData) {
		const profile = await this.authService.getProfile(headers);
		const membership = await this.groupService.getMembership(profile);
		const isMember = membership && membership.status === Status.accepted;
		return await this.db.thing.create({
			data: {
				createdById: profile.id,
				content: body.content,
				dueDate: body.dueDate,
				groupId: isMember ? membership.groupId : undefined,
			},
			include: { assignedTo: true },
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

		return await this.db.thing.findMany({
			where,
			include: { assignedTo: true },
			distinct: ["id"],
		});
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
