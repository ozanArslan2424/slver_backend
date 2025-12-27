import type { __Core_OnlyBun_HTMLBundle } from "./onlybun-html-bundle";

export interface __Core_ServeOptions {
	port: number;
	hostname?: "0.0.0.0" | "127.0.0.1" | "localhost" | (string & {}) | undefined;
	fetch: (request: Request) => Promise<Response>;
	staticPages?: Record<string, __Core_OnlyBun_HTMLBundle>;
}
