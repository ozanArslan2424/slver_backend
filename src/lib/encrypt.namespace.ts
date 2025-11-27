import crypto from "crypto";
import jwt from "jsonwebtoken";

export namespace Encrypt {
	export const hash = crypto.hash;

	export function sha256(input: string) {
		return hash("sha256", input);
	}

	export function getRandomBytes() {
		return crypto.randomBytes(16).toString("hex");
	}

	type UUIDOptions = crypto.RandomUUIDOptions;

	export function uuid(options?: UUIDOptions): string {
		return crypto.randomUUID(options);
	}

	export async function hashPassword(password: string) {
		return await Bun.password.hash(password);
	}

	export async function verifyPassword(password: string, hashedPassword: string) {
		return await Bun.password.verify(password, hashedPassword);
	}

	export const signJwt = jwt.sign;
	export const verifyJwt = jwt.verify;
	export type JwtPayload = jwt.JwtPayload;
}
