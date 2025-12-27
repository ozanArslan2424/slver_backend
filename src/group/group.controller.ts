import { Core } from "@/lib/core.namespace";
import {
	GroupCreateSchema,
	GroupJoinSchema,
	GroupInviteSchema,
	GroupRemoveSchema,
} from "@/group/group.schema";
import type { GroupService } from "@/group/group.service";
import { PersonDataSchema } from "@/person/person.schema";

export class GroupController extends Core.Controller {
	constructor(private readonly groupService: GroupService) {
		super("/group");
	}

	get = this.route({ method: "GET", path: "/" }, async () => {
		return await this.groupService.get();
	});

	list = this.route({ method: "GET", path: "/list" }, async (c) => {
		return await this.groupService.list(c.headers);
	});

	personList = this.route(
		{ method: "GET", path: "/person-list" },
		async (c) => {
			return await this.groupService.listPerson(c.headers);
		},
		{ response: PersonDataSchema.array() },
	);

	create = this.route(
		{ method: "POST", path: "/" },
		async (c) => {
			const body = await c.body();
			return await this.groupService.create(c.headers, body);
		},
		{ body: GroupCreateSchema },
	);

	join = this.route(
		{ method: "POST", path: "/join" },
		async (c) => {
			const body = await c.body();
			return await this.groupService.join(c.headers, body);
		},
		{ body: GroupJoinSchema },
	);

	invite = this.route(
		{ method: "POST", path: "/invite" },
		async (c) => {
			const body = await c.body();
			return await this.groupService.invite(c.headers, body);
		},
		{ body: GroupInviteSchema },
	);

	remove = this.route(
		{ method: "POST", path: "/remove" },
		async (c) => {
			const body = await c.body();
			return await this.groupService.remove(c.headers, body);
		},
		{ body: GroupRemoveSchema },
	);
}
