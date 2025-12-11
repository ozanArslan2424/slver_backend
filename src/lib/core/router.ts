import type { Adapter } from "../adapter.namespace";
import { TXT } from "../txt.namespace";
import type { __Core_Controller } from "./controller";
import { __Core_Method } from "./method";
import type { __Core_Middleware } from "./middleware";
import type { __Core_Request } from "./request";
import { __Core_Response } from "./response";
import type { __Core_Route } from "./route";
import { __Core_Status } from "./status";

export type __Core_ErrorCallback = (err: Adapter.Error) => Promise<__Core_Response>;

export type __Core_FetchCallback = (req: __Core_Request) => Promise<__Core_Response>;

export type __Core_RouterOptions = {
	globalPrefix?: string;
	controllers: __Core_Controller[];
	middlewares?: __Core_Middleware<any>[];
	floatingRoutes?: __Core_Route<any, any, any, any, any>[];
	staticPages?: Record<string, Adapter.HTMLBundle>;
	onError?: __Core_ErrorCallback;
	onNotFound?: __Core_FetchCallback;
	onMethodNotAllowed?: __Core_FetchCallback;
};

export class __Core_Router {
	readonly routes = new Map<string, __Core_Route>();

	globalPrefix?: string;
	controllers: __Core_Controller[];
	middlewares?: __Core_Middleware[];
	floatingRoutes?: __Core_Route[];
	staticPages?: Record<string, Adapter.HTMLBundle>;
	onError?: __Core_ErrorCallback;
	onNotFound?: __Core_FetchCallback;
	onMethodNotAllowed?: __Core_FetchCallback;

	constructor(readonly options: __Core_RouterOptions) {
		this.globalPrefix = options.globalPrefix;
		this.controllers = options.controllers;
		this.middlewares = options.middlewares;
		this.floatingRoutes = options.floatingRoutes;
		this.staticPages = options.staticPages;
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
	}

	public async handleFetch(req: __Core_Request): Promise<__Core_Response> {
		try {
			if (
				req.method === __Core_Method.OPTIONS &&
				req.headers.get("access-control-request-method")
			) {
				return new __Core_Response("Departed");
			}

			if (!req.isAllowedMethod) {
				return await this.handleMethodNotAllowed(req);
			}

			const route = this.findMatchingRoute(req);

			if (!route) {
				return await this.handleNotFound(req);
			}

			return await route.handler(req);
		} catch (err) {
			return await this.handleError(err as Adapter.Error);
		}
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
		if (this.globalPrefix !== undefined) {
			path = path.replace(this.globalPrefix, "");
		}
		return this.routes
			.values()
			.find((route) => path.match(route.pattern) && TXT.equals(req.method, route.method, "upper"));
	}
}
