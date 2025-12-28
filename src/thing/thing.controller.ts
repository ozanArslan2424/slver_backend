import { Core } from "@/lib/core.namespace";
import {
	ThingAssignBodySchema,
	ThingCreateBodySchema,
	ThingDataSchema,
	ThingDoneBodySchema,
	ThingGetParamsSchema,
	ThingListSearchSchema,
	ThingUpdateBodySchema,
} from "@/thing/thing.schema";
import type { ThingService } from "@/thing/thing.service";

export class ThingController extends Core.Controller {
	constructor(private readonly thingService: ThingService) {
		super("/thing");
	}

	list = this.route(
		{ method: "GET", path: "/" },
		async (c) => {
			return await this.thingService.list(c.headers, c.search);
		},
		{ search: ThingListSearchSchema, response: ThingDataSchema.array() },
	);

	create = this.route(
		{ method: "POST", path: "/" },
		async (c) => {
			const body = await c.body();
			return await this.thingService.create(c.headers, body);
		},
		{ body: ThingCreateBodySchema, response: ThingDataSchema },
	);

	update = this.route(
		{ method: "POST", path: "/:id/update" },
		async (c) => {
			const body = await c.body();
			return await this.thingService.update(c.headers, c.params.id, body);
		},
		{ params: ThingGetParamsSchema, body: ThingUpdateBodySchema, response: ThingDataSchema },
	);

	remove = this.route(
		{ method: "POST", path: "/:id/remove" },
		async (c) => {
			return await this.thingService.remove(c.headers, c.params.id);
		},
		{ params: ThingGetParamsSchema },
	);

	assign = this.route(
		{ method: "POST", path: "/:id/assign" },
		async (c) => {
			const body = await c.body();
			return await this.thingService.assign(c.headers, c.params.id, body);
		},
		{ params: ThingGetParamsSchema, body: ThingAssignBodySchema, response: ThingDataSchema },
	);

	done = this.route(
		{ method: "POST", path: "/:id/done" },
		async (c) => {
			const body = await c.body();
			return await this.thingService.done(c.headers, c.params.id, body);
		},
		{ params: ThingGetParamsSchema, body: ThingDoneBodySchema, response: ThingDataSchema },
	);
}
