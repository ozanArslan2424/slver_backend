import type { Core } from "@/lib/core.namespace";
import { type } from "arktype";
import { PersonRole, Status } from "prisma/generated/enums";

export const MembershipSchema = type({
	role: type.valueOf(PersonRole),
	status: type.valueOf(Status),
	password: "string",
	personId: "number",
	groupId: "number",
});

export const GroupSchema = type({
	id: "number",
	createdAt: "Date",
	updatedAt: "Date",
	title: "string",
});

export type GroupData = Core.InferSchema<typeof GroupSchema>;

export const GroupCreateSchema = type({
	title: "string",
});

export type GroupCreateData = Core.InferSchema<typeof GroupCreateSchema>;

export const GroupJoinSchema = type({
	join: "string > 6",
});

export type GroupJoinData = Core.InferSchema<typeof GroupJoinSchema>;

export const GroupInviteSchema = type({
	email: "string.email",
	role: type.valueOf(PersonRole),
});

export type GroupInviteData = Core.InferSchema<typeof GroupInviteSchema>;

export const GroupRemoveSchema = type({
	personId: "number",
});

export type GroupRemoveData = Core.InferSchema<typeof GroupRemoveSchema>;
