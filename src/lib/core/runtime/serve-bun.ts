import { serve } from "bun";
import type { __Core_ServeOptions } from "../serve-options";

export function __Core_serveBun(options: __Core_ServeOptions) {
	serve({
		port: options.port,
		hostname: options.hostname,
		fetch: options.fetch,
		routes: options.staticPages,
	});
}
