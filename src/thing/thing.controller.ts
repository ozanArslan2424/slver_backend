import { Core } from "@/lib/core.namespace";
import {
	ThingAssignDataSchema,
	ThingCreateDataSchema,
	ThingDataSchema,
	ThingDoneDataSchema,
	ThingRemoveDataSchema,
	ThingUpdateDataSchema,
} from "@/thing/thing.schema";
import type { ThingService } from "@/thing/thing.service";

export class ThingController extends Core.Controller {
	constructor(private readonly thingService: ThingService) {
		super("/thing");
	}

	list = this.route(
		{ method: "GET", path: "/" },
		async (c) => {
			return await this.thingService.list(c.headers);
		},
		{ response: ThingDataSchema.array() },
	);

	create = this.route(
		{ method: "POST", path: "/" },
		async (c) => {
			const body = await c.body();
			return await this.thingService.create(c.headers, body);
		},
		{ body: ThingCreateDataSchema, response: ThingDataSchema },
	);

	update = this.route(
		{ method: "POST", path: "/update" },
		async (c) => {
			const body = await c.body();
			return await this.thingService.update(c.headers, body);
		},
		{ body: ThingUpdateDataSchema, response: ThingDataSchema },
	);

	remove = this.route(
		{ method: "POST", path: "/remove" },
		async (c) => {
			const body = await c.body();
			return await this.thingService.remove(c.headers, body);
		},
		{ body: ThingRemoveDataSchema },
	);

	assign = this.route(
		{ method: "POST", path: "/assign" },
		async (c) => {
			const body = await c.body();
			return await this.thingService.assign(c.headers, body);
		},
		{ body: ThingAssignDataSchema, response: ThingDataSchema },
	);

	done = this.route(
		{ method: "POST", path: "/done" },
		async (c) => {
			const body = await c.body();
			return await this.thingService.done(c.headers, body);
		},
		{ body: ThingDoneDataSchema, response: ThingDataSchema },
	);
}
