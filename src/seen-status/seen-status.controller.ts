import { Core } from "@/lib/core.namespace";
import type { SeenStatusService } from "@/seen-status/seen-status.service";

export class SeenStatusController extends Core.Controller {
	constructor(private readonly seenStatusService: SeenStatusService) {
		super("/seen-status");
	}

	getCount = this.route({ method: "GET", path: "/count" }, async (c) => {
		return await this.seenStatusService.getCount(c.headers);
	});
}
