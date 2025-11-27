import { PersonDataSchema } from "@/person/person.schema";
import z from "zod";

declare module "jsonwebtoken" {
	interface JwtPayload {
		userId: string;
	}
}

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

export const AuthResponseSchema = z.object({
	profile: PersonDataSchema,
	accessToken: z.string(),
});

export type AuthResponseData = z.infer<typeof AuthResponseSchema>;

export const AuthCookieSchema = z.object({
	auth: z.string().nullish(),
});

export const ProfileSchema = PersonDataSchema.extend({
	emailVerified: z.boolean(),
});

export type ProfileData = z.infer<typeof ProfileSchema>;
