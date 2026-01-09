import { __Core_serveBun } from "@/lib/core/runtime/serve-bun";
import { __Core_getRuntime } from "@/lib/core/runtime/get-runtime";
import { __Core_serveNodeHTTP } from "@/lib/core/runtime/serve-nodehttp";
import type { __Core_ServeOptions } from "@/lib/core/serve-options";

export type __Core_ServeFn = (options: __Core_ServeOptions) => void;

export const __Core_serve: __Core_ServeFn = (options) => {
	const runtime = __Core_getRuntime();

	switch (runtime) {
		case "bun":
			return __Core_serveBun(options);
		case "node":
			return __Core_serveNodeHTTP(options);
		default:
			throw new Error(`Unsupported runtime: ${runtime}`);
	}
};
