import { Adapter } from "@/lib/adapter.namespace";
import "dotenv/config";
import pkgJson from "package.json";

export namespace Config {
	export const env = Adapter.getBunEnv();
	export const pkg = pkgJson;

	type Env = Adapter.BunEnv;
	type Key = keyof Env | (string & {});
	type Parser<T> = (value: string) => T;

	export function get<T = string>(key: Key, opts?: { parser?: Parser<T>; fallback?: T }): T {
		const value = env[key];
		if (value !== undefined && value !== "") {
			return opts?.parser ? opts?.parser(value) : (value as T);
		} else if (opts?.fallback !== undefined) {
			return opts?.fallback;
		} else {
			throw new Adapter.Error(`${key} doesn't exist in env`);
		}
	}

	export function isDev() {
		// Normally undefined, should be set manually in production
		return env.NODE_ENV !== "production";
	}
}
