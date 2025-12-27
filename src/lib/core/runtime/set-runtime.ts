import { Config } from "@/lib/config.namespace";
import { __Core_runtimeEnvKey } from "@/lib/core/runtime/runtime-env-key";

export function __Core_setRuntime(value: "bun" | "node") {
	return Config.set(__Core_runtimeEnvKey, value);
}
