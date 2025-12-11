import type { Env } from "bun";

export type __Adapter_BunEnv = Env;

export function __Adapter_getBunEnv() {
	return Bun.env;
}
