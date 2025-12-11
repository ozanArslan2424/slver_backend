import type { __Adapter_HTMLBundle } from "./onlybun-html-bundle";

export interface __Adapter_ServeOptions {
	port: number;
	fetch: (request: Request) => Promise<Response>;
	staticPages?: Record<string, __Adapter_HTMLBundle>;
}
