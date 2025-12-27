import { MembershipSchema, GroupSchema } from "@/group/group.schema";
import type { Core } from "@/lib/core.namespace";
import { type } from "arktype";
import { PersonRole } from "prisma/generated/enums";

export const PersonSchema = type({
	id: "number",
	createdAt: "Date",
	updatedAt: "Date",
	name: "string",
	email: "string",
	image: "string | null",
	role: type.valueOf(PersonRole),
	userId: "string",
});

export const PersonDataSchema = PersonSchema.and({
	memberships: MembershipSchema.omit("password").and({ group: GroupSchema }).array(),
});

export type PersonData = Core.InferSchema<typeof PersonDataSchema>;

export const PersonCreateSchema = type({
	userId: "string",
	email: "string.email",
	name: "string",
});

export type PersonCreateData = Core.InferSchema<typeof PersonCreateSchema>;
