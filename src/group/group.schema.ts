import { type } from "arktype";
import { PersonRole } from "prisma/generated/enums";

export const GroupEntitySchema = type({
	id: "number",
	createdAt: "Date",
	updatedAt: "Date",
	title: "string",
});

export const GroupGetParamsSchema = type({
	id: "string.integer",
});

export const GroupCreateBodySchema = GroupEntitySchema.pick("title");

export const GroupInviteBodySchema = type({
	email: "string.email",
	role: type.valueOf(PersonRole),
});

export const GroupJoinBodySchema = type({
	otp: "string",
});
