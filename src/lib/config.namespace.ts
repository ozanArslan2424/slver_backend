import { Adapter } from "@/lib/adapter.namespace";
import pkgJson from "package.json";
import "dotenv/config";

declare module "bun" {
	interface Env {
		PORT: string;
		APP_NAME: string;
		BASE_URL: string;
		CLIENT_URL: string;
		DATABASE_URL: string;
		JWT_REFRESH_SECRET: string;
		JWT_ACCESS_SECRET: string;
		SMTP_FROM: string;
		SMTP_HOST: string;
		SMTP_PORT: string;
		SMTP_USER: string;
		SMTP_PASS: string;
		LOG_LEVEL: string;
	}
}

export namespace Config {
	export const env = Bun.env;
	export const cwd = process.cwd;
	export const pkg = pkgJson;

	type Env = Adapter.Env;
	type Key = keyof Env | (string & {});
	type Parser<T> = (value: string) => T;

	export function get<T = string>(key: Key, opts?: { parser?: Parser<T>; fallback?: T }): T {
		const value = env[key];
		if (value !== undefined && value !== "") {
			return opts?.parser ? opts?.parser(value) : (value as T);
		} else if (opts?.fallback !== undefined) {
			return opts?.fallback;
		} else {
			throw new Adapter.Err(`${key} doesn't exist in env`);
		}
	}

	export function isDev() {
		// Normally undefined, should be set manually in production
		return env.NODE_ENV !== "production";
	}
}
