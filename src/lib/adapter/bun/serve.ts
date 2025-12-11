import { serve } from "bun";
import type { __Adapter_ServeOptions } from "../serve-options";

export function __Adapter_serveBun(options: __Adapter_ServeOptions) {
	return serve({
		port: options.port,
		fetch: options.fetch,
		routes: options.staticPages,
	});
}
