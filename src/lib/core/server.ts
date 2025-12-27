import type { __Core_DBClientInterface } from "@/lib/core/db-client";
import type { __Core_ServeOptions } from "@/lib/core/serve-options";
import { __Core_Request } from "./request";
import type { __Core_Router } from "./router";
import { Logger } from "@/logger/logger.service";
import { __Core_getRuntime } from "@/lib/core/runtime/get-runtime";
import { __Core_serve } from "@/lib/core/runtime/serve";

export type __Core_ServerOptions = {
	router: __Core_Router;
	db?: __Core_DBClientInterface;
};

export class __Core_Server {
	private readonly logger = new Logger();

	db?: __Core_DBClientInterface;
	router: __Core_Router;
	port?: __Core_ServeOptions["port"];
	hostname?: __Core_ServeOptions["hostname"];

	constructor(readonly options: __Core_ServerOptions) {
		this.db = options.db;
		this.router = options.router;
	}

	public setHostname(hostname?: __Core_ServeOptions["hostname"]) {
		this.hostname = hostname;
	}

	public async listen(port: __Core_ServeOptions["port"]) {
		this.port = port;

		const exit = async () => {
			this.logger.log("Shutting down gracefully...");
			await this.db?.disconnect();
			process.exit(0);
		};

		process.on("SIGINT", exit);
		process.on("SIGTERM", exit);

		try {
			this.logger.log(`

Core server starting...
-> Runtime: ${__Core_getRuntime()}
-> Hostname: ${this.hostname}
-> Port: ${this.port}
`);

			await this.db?.connect();

			return __Core_serve({
				port,
				hostname: this.hostname,
				staticPages: this.router.staticPages,
				fetch: async (request) => {
					const req = new __Core_Request(request);
					const res = await this.router.handleFetch(req);
					return res.response;
				},
			});
		} catch (err) {
			this.logger.error("Server unable to start:", err);
			exit();
		}
	}
}
