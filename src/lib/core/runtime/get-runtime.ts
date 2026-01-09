import { Config } from "@/lib/config.namespace";
import { __Core_runtimeEnvKey } from "@/lib/core/runtime/runtime-env-key";

export function __Core_getRuntime() {
	return Config.get(__Core_runtimeEnvKey, { fallback: "bun" });
}
