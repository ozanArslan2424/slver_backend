import { Adapter } from "../adapter.namespace";
import type { __Core_Cors } from "./cors";
import { __Core_Request } from "./request";
import type { __Core_Router } from "./router";

export type __Core_ServerOptions = {
	db?: Adapter.DBClientInterface;
	router: __Core_Router;
	logger?: Adapter.Logger;
	cors?: __Core_Cors;
};

export class __Core_Server {
	db?: Adapter.DBClientInterface;
	router: __Core_Router;
	logger: Adapter.Logger;
	cors?: __Core_Cors;

	constructor(readonly options: __Core_ServerOptions) {
		this.db = options.db;
		this.router = options.router;
		this.logger = options.logger ?? console;
		this.cors = options.cors;
	}

	public async listen(port: number) {
		const exit = async () => {
			this.logger.log("Shutting down gracefully...");
			await this.db?.disconnect();
			process.exit(0);
		};

		process.on("SIGINT", exit);
		process.on("SIGTERM", exit);

		try {
			await this.db?.connect();

			return Adapter.serveBun({
				port,
				fetch: async (request) => {
					const req = new __Core_Request(request);
					const res = await this.router.handleFetch(req);
					if (this.cors !== undefined) {
						const headers = this.cors.getCorsHeaders(req, res);
						res.headers.innerCombine(headers);
					}
					return res.response;
				},
				staticPages: this.router.staticPages,
			});
		} catch (err) {
			this.logger.error(err);
			exit();
		}
	}
}
