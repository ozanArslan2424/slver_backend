import { PersonDataSchema } from "@/person/person.schema";
import z from "zod";

export const LoginSchema = z.object({
	email: z.email(),
	password: z.string().min(8),
});

export type LoginData = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
	name: z.string().min(1),
	email: z.email(),
	password: z.string().min(8),
});

export type RegisterData = z.infer<typeof RegisterSchema>;

export const VerifySchema = z.object({
	email: z.email(),
	code: z.string(),
});

export type VerifyData = z.infer<typeof VerifySchema>;

export const RefreshSchema = z.object({
	refreshToken: z.string().optional(),
});

export type RefreshData = z.infer<typeof RefreshSchema>;

export const AuthResponseSchema = z.object({
	profile: PersonDataSchema,
	accessToken: z.string(),
	refreshToken: z.string(),
});

export type AuthResponseData = z.infer<typeof AuthResponseSchema>;

export const AuthCookieSchema = z.object({
	auth: z.string().nullish(),
});

export const ProfileSchema = PersonDataSchema.extend({
	emailVerified: z.boolean(),
});

export type ProfileData = z.infer<typeof ProfileSchema>;
