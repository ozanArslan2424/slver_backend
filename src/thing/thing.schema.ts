import { PersonEntitySchema } from "@/person/person.schema";
import { type } from "arktype";

export const ThingEntitySchema = type({
	id: "number",
	createdAt: "Date",
	updatedAt: "Date",
	content: "string",
	isDone: "boolean",
	doneDate: "Date | null",
	dueDate: "Date | null",
	assignedToId: "number | null",
	createdById: "number",
	groupId: "number | null",
});

// TODO: There must be a way to infer the out type from .pipe
// but right now it breaks the entire parsing system
export const ThingGetParamsSchema = type({
	id: "string.integer",
});

// TODO: There must be a way to infer the out type from .pipe
// but right now it breaks the entire parsing system
export const ThingListSearchSchema = type({
	groupId: "string.integer",
});

export const ThingDataSchema = ThingEntitySchema.and({
	assignedTo: type.or(PersonEntitySchema, "null"),
});

export const ThingCreateBodySchema = type({
	content: "string > 1",
	dueDate: "string | null",
	groupId: "number | undefined",
});

export const ThingUpdateBodySchema = ThingCreateBodySchema.omit("groupId");

export const ThingAssignBodySchema = ThingEntitySchema.pick("assignedToId");

export const ThingDoneBodySchema = ThingEntitySchema.pick("isDone");
