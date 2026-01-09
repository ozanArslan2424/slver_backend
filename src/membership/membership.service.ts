import type { AuthService } from "@/auth/auth.service";
import type { DatabaseClient } from "@/db/database.client";
import { Core } from "@/lib/core.namespace";
import type { MembershipRepository } from "@/membership/membership.repository";

export class MembershipService extends Core.Service {
	constructor(
		private readonly db: DatabaseClient,
		private readonly authService: AuthService,
		private readonly membershipRepository: MembershipRepository,
	) {
		super();
	}

	async list(headers: Core.Headers, groupId: number) {
		return await this.db.$transaction(async (tx) => {
			const profile = await this.authService.getProfile(headers, tx);
			const members = await this.membershipRepository.findMany(profile.id, groupId, tx);
			if (members == null) {
				throw new Core.Error("group.notMember", Core.Status.FORBIDDEN);
			}
			return members.map((m) => ({ ...m.person, status: m.status }));
		});
	}
}
