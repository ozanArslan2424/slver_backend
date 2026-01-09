import type { Core } from "@/lib/core.namespace";
import type { PersonData } from "@/person/person.schema";
import type { ThingDataSchema } from "@/thing/thing.schema";

export type SeenStatusUpdateManyData = {
	personId: PersonData["id"];
	thingList: Core.InferSchema<typeof ThingDataSchema>[];
};
