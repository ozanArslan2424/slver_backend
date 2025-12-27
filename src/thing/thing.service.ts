import type { GroupService } from "@/group/group.service";
import type {
	ThingCreateData,
	ThingUpdateData,
	ThingAssignData,
	ThingDoneData,
	ThingRemoveData,
} from "@/thing/thing.schema";
import { Core } from "@/lib/core.namespace";
import type { DatabaseClient } from "@/db/database.client";
import type { AuthService } from "@/auth/auth.service";
import { Status } from "prisma/generated/enums";
import type { SeenStatusRepository } from "@/seen-status/seen-status.repository";
import type { ThingRepository } from "@/thing/thing.repository";

export class ThingService extends Core.Service {
	constructor(
		private readonly database: DatabaseClient,
		private readonly authService: AuthService,
		private readonly groupService: GroupService,
		private readonly thingRepository: ThingRepository,
		private readonly seenStatusRepository: SeenStatusRepository,
	) {
		super();
	}

	async create(headers: Core.Headers, body: ThingCreateData) {
		const profile = await this.authService.getProfile(headers);

		return await this.database.$transaction(async (tx) => {
			const membership = await this.groupService.getMembership(profile, tx);

			const isMember = membership && membership.status === Status.accepted;
			const createdById = profile.id;
			const content = body.content;
			const dueDate = body.dueDate ? new Date(body.dueDate) : null;
			const groupId = isMember ? membership.groupId : undefined;
			const assignedToId = isMember ? undefined : profile.id;

			const thing = await this.thingRepository.create(
				content,
				dueDate,
				groupId,
				createdById,
				assignedToId,
				tx,
			);

			await this.seenStatusRepository.createMany(thing.id, [profile.id], tx);

			return thing;
		});
	}

	async update(headers: Core.Headers, body: ThingUpdateData) {
		await this.authService.getProfile(headers);
		const id = body.thingId;
		const content = body.content;
		const dueDate = body.dueDate ? new Date(body.dueDate) : null;
		return await this.thingRepository.update(id, content, dueDate, null, null, null);
	}

	async list(headers: Core.Headers) {
		const profile = await this.authService.getProfile(headers);
		const membership = await this.groupService.getMembership(profile);

		const list = await this.thingRepository.findMany(
			profile.id,
			membership?.status === Status.accepted ? membership.groupId : null,
		);

		await this.seenStatusRepository.updateMany(
			profile.id,
			list.map((t) => t.id),
			true,
		);

		return list;
	}

	async assign(headers: Core.Headers, body: ThingAssignData) {
		await this.authService.getProfile(headers);
		const id = body.thingId;
		const assignedToId = body.personId;
		return await this.thingRepository.update(id, null, null, null, assignedToId, null);
	}

	async done(headers: Core.Headers, body: ThingDoneData) {
		await this.authService.getProfile(headers);
		const id = body.thingId;
		const isDone = body.isDone;
		return await this.thingRepository.update(id, null, null, null, null, isDone);
	}

	async remove(headers: Core.Headers, body: ThingRemoveData) {
		await this.authService.getProfile(headers);
		const id = body.thingId;
		return await this.thingRepository.delete(id);
	}
}
