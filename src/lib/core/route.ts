import type { Adapter } from "../adapter.namespace";
import { TXT } from "../txt.namespace";
import type { __Core_Method } from "./method";
import { __Core_Response } from "./response";
import { __Core_Context } from "./route-context";

export type __Core_Endpoint = `/${string}`;

export type __Core_RouteDefinition =
	| { method: __Core_Method; path: __Core_Endpoint }
	| __Core_Endpoint;

export type __Core_RouteCallback<
	D = any,
	R extends unknown = unknown,
	B extends unknown = unknown,
	S extends unknown = unknown,
	P extends unknown = unknown,
> = (context: __Core_Context<D, R, B, S, P>) => Promise<R> | R;

export type __Core_RouteSchemas<
	R extends unknown = unknown,
	B extends unknown = unknown,
	S extends unknown = unknown,
	P extends unknown = unknown,
> = {
	response?: Adapter.ZodType<R>;
	body?: Adapter.ZodType<B>;
	search?: Adapter.ZodType<S>;
	params?: Adapter.ZodType<P>;
};

/**
 *  This takes in a regular request which is converted to Core.Req for types,
 * the context part is for the middlewares
 */
export type __Core_RouteHandler<
	D = any,
	R extends unknown = unknown,
	B extends unknown = unknown,
	S extends unknown = unknown,
	P extends unknown = unknown,
> = (req: Adapter.Request, context?: __Core_Context<D, R, B, S, P>) => Promise<__Core_Response>;

export class __Core_Route<
	D = undefined,
	R extends unknown = unknown,
	B extends unknown = unknown,
	S extends unknown = unknown,
	P extends unknown = unknown,
> {
	id: string;
	pattern: RegExp;
	paramNames: string[];

	constructor(
		readonly method: __Core_Method,
		readonly path: __Core_Endpoint,
		private readonly callback: __Core_RouteCallback<D, R, B, S, P>,
		private readonly schemas?: __Core_RouteSchemas<R, B, S, P>,
	) {
		this.id = this.getId(method, path);
		this.pattern = this.getPattern(path);
		this.paramNames = this.getParamNames(path);
	}

	handler: __Core_RouteHandler<D, R, B, S, P> = async (req, ctx) => {
		const context = ctx ?? new __Core_Context(req, this.path, this.schemas);
		const data = await this.callback(context);
		const res = new __Core_Response(data, {
			status: context.status,
			statusText: context.statusText,
			headers: context.headers,
			cookies: context.cookies,
		});
		return res;
	};

	private getPattern(path: string) {
		// Convert route pattern to regex: "/users/:id" -> /^\/users\/([^\/]+)$/
		const regex = path
			.split("/")
			.map((part) => (part.startsWith(":") ? "([^\\/]+)" : part))
			.join("/");
		const pattern = new RegExp(`^${regex}$`);
		return pattern;
	}

	private getParamNames(path: string) {
		const paramNames: string[] = [];

		for (const part of TXT.split("/", path)) {
			if (part.startsWith(":")) {
				paramNames.push(part.slice(1));
			}
		}

		return paramNames;
	}

	private getId(method: string, path: string) {
		return `[${method}]:[${path}]`;
	}
}
