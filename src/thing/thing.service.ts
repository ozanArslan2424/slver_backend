import type {
	ThingAssignBodySchema,
	ThingCreateBodySchema,
	ThingDoneBodySchema,
	ThingListSearchSchema,
	ThingUpdateBodySchema,
} from "@/thing/thing.schema";
import { Core } from "@/lib/core.namespace";
import type { DatabaseClient } from "@/db/database.client";
import type { AuthService } from "@/auth/auth.service";
import { Status } from "prisma/generated/enums";
import type { SeenStatusRepository } from "@/seen-status/seen-status.repository";
import type { ThingRepository } from "@/thing/thing.repository";
import type { MembershipRepository } from "@/membership/membership.repository";

export class ThingService extends Core.Service {
	constructor(
		private readonly db: DatabaseClient,
		private readonly authService: AuthService,
		private readonly thingRepository: ThingRepository,
		private readonly membershipRepository: MembershipRepository,
		private readonly seenStatusRepository: SeenStatusRepository,
	) {
		super();
	}

	async create(headers: Core.Headers, body: Core.InferSchema<typeof ThingCreateBodySchema>) {
		return await this.db.$transaction(async (tx) => {
			const profile = await this.authService.getProfile(headers, tx);
			const groupId = body.groupId;
			const createdById = profile.id;
			const isMember = groupId
				? await this.membershipRepository.findUnique(
						createdById,
						groupId,
						Status.accepted,
						null,
						tx,
					)
				: false;
			const content = body.content;
			const dueDate = body.dueDate ? new Date(body.dueDate) : null;
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

	async update(
		headers: Core.Headers,
		thingId: number,
		body: Core.InferSchema<typeof ThingUpdateBodySchema>,
	) {
		await this.authService.getProfile(headers);
		const content = body.content;
		const dueDate = body.dueDate ? new Date(body.dueDate) : null;
		return await this.thingRepository.update(thingId, content, dueDate, null, null, null);
	}

	async list(headers: Core.Headers, search: Core.InferSchema<typeof ThingListSearchSchema>) {
		return await this.db.$transaction(async (tx) => {
			const profile = await this.authService.getProfile(headers, tx);

			const list = await this.thingRepository.findMany(
				profile.id,
				search.groupId ?? null,
				search.isDone ?? null,
				tx,
			);

			await this.seenStatusRepository.updateMany(
				profile.id,
				list.map((t) => t.id),
				true,
				tx,
			);

			return list;
		});
	}

	async assign(
		headers: Core.Headers,
		thingId: number,
		body: Core.InferSchema<typeof ThingAssignBodySchema>,
	) {
		await this.authService.getProfile(headers);
		const assignedToId = body.assignedToId;
		return await this.thingRepository.update(thingId, null, null, null, assignedToId, null);
	}

	async done(
		headers: Core.Headers,
		thingId: number,
		body: Core.InferSchema<typeof ThingDoneBodySchema>,
	) {
		await this.authService.getProfile(headers);
		const isDone = body.isDone;
		return await this.thingRepository.update(thingId, null, null, null, null, isDone);
	}

	async remove(headers: Core.Headers, thingId: number) {
		await this.authService.getProfile(headers);
		return await this.thingRepository.delete(thingId);
	}
}
