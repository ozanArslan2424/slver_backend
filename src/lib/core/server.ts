import { type __Core_DBClientInterface } from "@/lib/core/db-client";
import { type __Core_ServeOptions } from "@/lib/core/serve-options";
import { __Core_Request } from "./request";
import { Logger } from "@/logger/logger";
import { __Core_getRuntime } from "@/lib/core/runtime/get-runtime";
import { __Core_serve } from "@/lib/core/runtime/serve";
import { __Core_Controller } from "@/lib/core/controller";
import { __Core_Cors } from "@/lib/core/cors";
import { __Core_Middleware } from "@/lib/core/middleware";
import { type __Core_OnlyBun_HTMLBundle } from "@/lib/core/onlybun-html-bundle";
import { __Core_Route } from "@/lib/core/route";
import { __Core_Response } from "@/lib/core/response";
import { __Core_Status } from "@/lib/core/status";
import { TXT } from "@/lib/txt.namespace";

export type __Core_ErrorCallback = (err: Error) => Promise<__Core_Response>;

export type __Core_FetchCallback = (req: __Core_Request) => Promise<__Core_Response>;

export type __Core_ServerOptions = {
	db?: __Core_DBClientInterface;
	controllers: __Core_Controller[];
	middlewares?: __Core_Middleware<any>[];
	floatingRoutes?: __Core_Route<any, any, any, any, any>[];
	staticPages?: Record<string, __Core_OnlyBun_HTMLBundle>;
	cors?: __Core_Cors;
	onError?: __Core_ErrorCallback;
	onNotFound?: __Core_FetchCallback;
	onMethodNotAllowed?: __Core_FetchCallback;
};

export class __Core_Server {
	private readonly logger = new Logger();
	readonly routes = new Map<string, __Core_Route>();

	db?: __Core_DBClientInterface;
	controllers: __Core_Controller[];
	middlewares?: __Core_Middleware[];
	floatingRoutes?: __Core_Route[];
	staticPages?: Record<string, __Core_OnlyBun_HTMLBundle>;
	cors?: __Core_Cors;
	onError?: __Core_ErrorCallback;
	onNotFound?: __Core_FetchCallback;
	onMethodNotAllowed?: __Core_FetchCallback;

	constructor(readonly options: __Core_ServerOptions) {
		this.db = options.db;
		this.controllers = options.controllers;
		this.middlewares = options.middlewares;
		this.floatingRoutes = options.floatingRoutes;
		this.staticPages = options.staticPages;
		this.cors = options.cors;
		this.onError = options.onError;
		this.onNotFound = options.onNotFound;
		this.onMethodNotAllowed = options.onMethodNotAllowed;

		if (this.middlewares && this.middlewares.length > 0) {
			for (const middleware of this.middlewares) {
				this.controllers = middleware.use(options.controllers);
			}
		}

		for (const controller of this.controllers) {
			for (const route of controller.routes) {
				this.routes.set(route.id, route);
			}
		}

		if (this.floatingRoutes && this.floatingRoutes.length > 0) {
			for (const floatingRoute of this.floatingRoutes) {
				this.routes.set(floatingRoute.id, floatingRoute);
			}
		}

		console.log(this.routes.keys());
	}

	private async getResponse(req: __Core_Request): Promise<__Core_Response> {
		try {
			if (req.isPreflight) {
				return new __Core_Response("Departed");
			}

			if (req.isMethodNotAllowed) {
				return await this.handleMethodNotAllowed(req);
			}

			const route = this.findMatchingRoute(req);
			if (route) {
				return await route.handler(req);
			}

			return await this.handleNotFound(req);
		} catch (err) {
			return await this.handleError(err as Error);
		}
	}

	public async handleFetch(req: __Core_Request): Promise<__Core_Response> {
		const res = await this.getResponse(req);

		if (this.cors !== undefined) {
			const headers = this.cors.getCorsHeaders(req, res);
			res.headers.innerCombine(headers);
		}

		return res;
	}

	private handleMethodNotAllowed: __Core_FetchCallback = async (req) => {
		if (this.onMethodNotAllowed) {
			return this.onMethodNotAllowed(req);
		}
		return new __Core_Response(`${req.method} does not exist.`, {
			status: __Core_Status.METHOD_NOT_ALLOWED,
		});
	};

	private handleNotFound: __Core_FetchCallback = async (req) => {
		if (this.onNotFound) {
			return this.onNotFound(req);
		}
		return new __Core_Response(`${req.method} on ${req.url} does not exist.`, {
			status: __Core_Status.NOT_FOUND,
		});
	};

	private handleError: __Core_ErrorCallback = async (err) => {
		if (this.onError) {
			return this.onError(err);
		}
		return new __Core_Response(err, { status: __Core_Status.INTERNAL_SERVER_ERROR });
	};

	private findMatchingRoute(req: __Core_Request): __Core_Route | undefined {
		const url = new URL(req.url);
		let path = url.pathname;
		return this.routes
			.values()
			.find((route) => path.match(route.pattern) && TXT.equals(req.method, route.method, "upper"));
	}

	private async exit() {
		this.logger.log("Shutting down gracefully...");
		await this.db?.disconnect();
		process.exit(0);
	}

	public async listen(
		port?: __Core_ServeOptions["port"],
		hostname?: __Core_ServeOptions["hostname"],
	) {
		try {
			process.on("SIGINT", () => this.exit());
			process.on("SIGTERM", () => this.exit());

			this.logger.log(
				`
Core server starting...
-> Runtime: ${__Core_getRuntime()}
-> Hostname: ${hostname}
-> Port: ${port}
`,
			);

			await this.db?.connect();

			__Core_serve({
				port: port ?? 3000,
				hostname: hostname,
				staticPages: this.staticPages,
				fetch: async (request) => {
					const req = new __Core_Request(request);
					const res = await this.handleFetch(req);
					return res.response;
				},
			});
		} catch (err) {
			this.logger.error("Server unable to start:", err);
			this.exit();
		}
	}
}
