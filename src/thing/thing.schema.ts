import { PersonSchema } from "@/person/person.schema";
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

export const ThingGetParamsSchema = ThingEntitySchema.pick("id");

export const ThingListSearchSchema = ThingEntitySchema.pick("groupId", "isDone").partial();

export const ThingDataSchema = ThingEntitySchema.and({
	assignedTo: type.or(PersonSchema, "null"),
});

export const ThingCreateBodySchema = type({
	content: "string > 1",
	dueDate: "string | null",
	groupId: "number | undefined",
});

export const ThingUpdateBodySchema = ThingCreateBodySchema.omit("groupId");

export const ThingAssignBodySchema = ThingEntitySchema.pick("assignedToId");

export const ThingDoneBodySchema = ThingEntitySchema.pick("isDone");
