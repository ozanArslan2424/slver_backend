import { PersonRole, Status } from "prisma/generated/enums";
import z from "zod";

export const MembershipSchema = z.object({
	role: z.enum(PersonRole),
	status: z.enum(Status),
	password: z.string(),
	personId: z.number().int(),
	groupId: z.number().int(),
});

export const GroupSchema = z.object({
	id: z.number(),
	createdAt: z.date(),
	updatedAt: z.date(),
	title: z.string(),
});

export const GroupDataSchema = GroupSchema;

export type GroupData = z.infer<typeof GroupDataSchema>;

export const GroupCreateSchema = z.object({
	title: z.string(),
});

export type GroupCreateData = z.infer<typeof GroupCreateSchema>;

export const GroupJoinSchema = z.object({
	join: z.string().min(6),
});

export type GroupJoinData = z.infer<typeof GroupJoinSchema>;

export const GroupInviteSchema = z.object({
	email: z.email(),
	role: z.enum(PersonRole),
});

export type GroupInviteData = z.infer<typeof GroupInviteSchema>;

export const GroupRemoveSchema = z.object({
	personId: z.number(),
});

export type GroupRemoveData = z.infer<typeof GroupRemoveSchema>;
