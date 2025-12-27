import "dotenv/config";
import pkgJson from "package.json";

export namespace Config {
	export const pkg = pkgJson;

	type Env = Bun.Env;
	type Key = keyof Env | (string & {});
	type Parser<T> = (value: string) => T;

	export function get<T = string>(key: Key, opts?: { parser?: Parser<T>; fallback?: T }): T {
		const value = process.env[key];
		if (value !== undefined && value !== "") {
			return opts?.parser ? opts?.parser(value) : (value as T);
		} else if (opts?.fallback !== undefined) {
			return opts?.fallback;
		} else {
			throw new Error(`${key} doesn't exist in env`);
		}
	}

	export function isDev() {
		// Normally undefined, should be set manually in production
		return process.env.NODE_ENV !== "production";
	}

	export function set(key: string, value: string) {
		process.env[key] = value;
	}
}
