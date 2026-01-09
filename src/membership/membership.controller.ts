import { Core } from "@/lib/core.namespace";
import { MembershipListParamsSchema } from "@/membership/membership.schema";
import type { MembershipService } from "@/membership/membership.service";
import { PersonEntitySchema } from "@/person/person.schema";

export class MembershipController extends Core.Controller {
	constructor(private readonly membershipService: MembershipService) {
		super("/membership");
	}

	list = this.route(
		{ method: "GET", path: "/:groupId" },
		async (c) => {
			const groupId = parseInt(c.params.groupId);
			return await this.membershipService.list(c.headers, groupId);
		},
		{ params: MembershipListParamsSchema, response: PersonEntitySchema.array() },
	);
}
