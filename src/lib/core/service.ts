import { __Core_Method } from "./method";
import type { __Core_MiddlewareCallback } from "./middleware";
import {
	type __Core_RouteCallback,
	type __Core_RouteDefinition,
	type __Core_RouteSchemas,
	__Core_Route,
} from "./route";

export class __Core_Service {
	protected makeMiddlewareHandler<D = void>(callback: __Core_MiddlewareCallback<D>) {
		return callback;
	}

	protected makeRouteHandler<
		D = void,
		R extends unknown = unknown,
		B extends unknown = unknown,
		S extends unknown = unknown,
		P extends unknown = unknown,
	>(
		definition: __Core_RouteDefinition,
		callback: __Core_RouteCallback<D, R, B, S, P>,
		schemas?: __Core_RouteSchemas<R, B, S, P>,
	): __Core_Route<D, R, B, S, P> {
		if (typeof definition === "string") {
			definition = { method: __Core_Method.GET, path: definition };
		} else {
			definition = { method: definition.method, path: definition.path };
		}
		const route = new __Core_Route<D, R, B, S, P>(
			definition.method,
			definition.path,
			callback,
			schemas,
		);
		return route;
	}
}
