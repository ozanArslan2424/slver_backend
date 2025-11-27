import { PersonSchema } from "@/person/person.schema";
import z from "zod";

export const ThingSchema = z.object({
	id: z.number(),
	createdAt: z.date(),
	updatedAt: z.date(),
	content: z.string(),
	isDone: z.boolean(),
	doneDate: z.date().nullable(),
	dueDate: z.date().nullable(),
	assignedToId: z.number().nullable(),
	createdById: z.number(),
	groupId: z.number().nullable(),
});

export const ThingDataSchema = ThingSchema.extend({
	assignedTo: PersonSchema.nullable(),
});

export type ThingData = z.infer<typeof ThingDataSchema>;

export const ThingCreateDataSchema = z.object({
	content: z.string().min(1, "Everything must have some content"),
	dueDate: z
		.string()
		.nullable()
		.transform((v) => (v ? new Date(v) : null)),
});

export type ThingCreateData = z.infer<typeof ThingCreateDataSchema>;

export const ThingUpdateDataSchema = ThingCreateDataSchema.extend({
	thingId: z.number(),
});

export type ThingUpdateData = z.infer<typeof ThingUpdateDataSchema>;

export const ThingAssignDataSchema = z.object({
	thingId: z.number(),
	personId: z.number(),
});

export type ThingAssignData = z.infer<typeof ThingAssignDataSchema>;

export const ThingRemoveDataSchema = z.object({
	thingId: z.number(),
});

export type ThingRemoveData = z.infer<typeof ThingRemoveDataSchema>;

export const ThingDoneDataSchema = z.object({
	thingId: z.number(),
	isDone: z.boolean(),
});

export type ThingDoneData = z.infer<typeof ThingDoneDataSchema>;
