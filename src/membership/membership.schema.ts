import { type } from "arktype";
import { PersonRole, Status } from "prisma/generated/enums";

export const MembershipEntitySchema = type({
	role: type.valueOf(PersonRole),
	status: type.valueOf(Status),
	password: "string",
	personId: "number",
	groupId: "number",
});

export const MembershipListParamsSchema = type({
	groupId: "string.integer",
});
