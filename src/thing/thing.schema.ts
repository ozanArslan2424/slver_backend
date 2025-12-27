import type { Core } from "@/lib/core.namespace";
import { PersonSchema } from "@/person/person.schema";
import { type } from "arktype";

export const ThingSchema = type({
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

export const ThingDataSchema = ThingSchema.and({
	assignedTo: type.or(PersonSchema, "null"),
});

export type ThingData = Core.InferSchema<typeof ThingDataSchema>;

export const ThingCreateDataSchema = type({
	content: "string > 1",
	dueDate: type("string | null"),
});

export type ThingCreateData = Core.InferSchema<typeof ThingCreateDataSchema>;

export const ThingUpdateDataSchema = ThingCreateDataSchema.and({
	thingId: "number",
});

export type ThingUpdateData = Core.InferSchema<typeof ThingUpdateDataSchema>;

export const ThingAssignDataSchema = type({
	thingId: "number",
	personId: "number",
});

export type ThingAssignData = Core.InferSchema<typeof ThingAssignDataSchema>;

export const ThingRemoveDataSchema = type({
	thingId: "number",
});

export type ThingRemoveData = Core.InferSchema<typeof ThingRemoveDataSchema>;

export const ThingDoneDataSchema = type({
	thingId: "number",
	isDone: "boolean",
});

export type ThingDoneData = Core.InferSchema<typeof ThingDoneDataSchema>;
