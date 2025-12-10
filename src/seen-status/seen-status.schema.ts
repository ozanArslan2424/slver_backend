import type { PersonData } from "@/person/person.schema";
import type { ThingData } from "@/thing/thing.schema";

export type SeenStatusUpdateManyData = {
	personId: PersonData["id"];
	thingList: ThingData[];
};
