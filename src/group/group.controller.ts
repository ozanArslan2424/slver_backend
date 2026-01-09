import { Core } from "@/lib/core.namespace";
import type { GroupService } from "@/group/group.service";
import {
	GroupGetParamsSchema,
	GroupEntitySchema,
	GroupCreateBodySchema,
	GroupInviteBodySchema,
	GroupJoinBodySchema,
} from "@/group/group.schema";

export class GroupController extends Core.Controller {
	constructor(private readonly groupService: GroupService) {
		super("/group");
	}

	get = this.route(
		{ method: "GET", path: "/:id" },
		async (c) => {
			const id = parseInt(c.params.id);
			return await this.groupService.get(c.headers, id);
		},
		{ params: GroupGetParamsSchema, response: GroupEntitySchema },
	);

	list = this.route(
		{ method: "GET", path: "/" },
		async (c) => {
			return await this.groupService.list(c.headers);
		},
		{ response: GroupEntitySchema.array() },
	);

	create = this.route(
		{ method: "POST", path: "/" },
		async (c) => {
			const body = await c.body();
			return await this.groupService.create(c.headers, body);
		},
		{ body: GroupCreateBodySchema, response: GroupEntitySchema },
	);

	update = this.route(
		{ method: "POST", path: "/:id/update" },
		async (c) => {
			const body = await c.body();
			const id = parseInt(c.params.id);
			return await this.groupService.update(c.headers, id, body);
		},
		{ params: GroupGetParamsSchema, body: GroupCreateBodySchema, response: GroupEntitySchema },
	);

	invite = this.route(
		{ method: "POST", path: "/:id/invite" },
		async (c) => {
			const body = await c.body();
			const id = parseInt(c.params.id);
			await this.groupService.invite(c.headers, id, body);
		},
		{ params: GroupGetParamsSchema, body: GroupInviteBodySchema },
	);

	join = this.route(
		{ method: "POST", path: "/:id/join" },
		async (c) => {
			const body = await c.body();
			const id = parseInt(c.params.id);
			await this.groupService.join(c.headers, id, body);
		},
		{ params: GroupGetParamsSchema, body: GroupJoinBodySchema },
	);
}
