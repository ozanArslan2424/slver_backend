import { MembershipSchema, GroupSchema } from "@/group/group.schema";
import { PersonRole } from "prisma/generated/enums";
import z from "zod";

export const PersonSchema = z.object({
	id: z.number().int(),
	createdAt: z.date(),
	updatedAt: z.date(),
	name: z.string(),
	email: z.string(),
	image: z.string().nullable(),
	role: z.enum(PersonRole).default("user"),
	userId: z.string(),
});

export const PersonDataSchema = PersonSchema.extend({
	memberships: z.array(
		MembershipSchema.omit({
			password: true,
		}).extend({
			group: GroupSchema,
		}),
	),
});

export type PersonData = z.infer<typeof PersonDataSchema>;

export const PersonCreateSchema = z.object({
	userId: z.string(),
	email: z.email(),
	name: z.string(),
});

export type PersonCreateData = z.infer<typeof PersonCreateSchema>;
