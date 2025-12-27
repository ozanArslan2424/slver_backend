import type { Core } from "@/lib/core.namespace";
import { PersonDataSchema } from "@/person/person.schema";
import { type } from "arktype";

export const LoginSchema = type({
	email: "string.email",
	password: "string >= 8",
});

export type LoginData = Core.InferSchema<typeof LoginSchema>;

export const RegisterSchema = LoginSchema.and({
	name: "string > 1",
});

export type RegisterData = Core.InferSchema<typeof RegisterSchema>;

export const VerifySchema = type({
	email: "string.email",
	code: "string",
});

export type VerifyData = Core.InferSchema<typeof VerifySchema>;

export const RefreshSchema = type({
	"refreshToken?": "string",
});

export type RefreshData = Core.InferSchema<typeof RefreshSchema>;

export const AuthResponseSchema = type({
	profile: PersonDataSchema,
	accessToken: "string",
	refreshToken: "string",
});

export type AuthResponseData = Core.InferSchema<typeof AuthResponseSchema>;

export const ProfileSchema = PersonDataSchema.and({
	emailVerified: "boolean",
});

export type ProfileData = Core.InferSchema<typeof ProfileSchema>;
